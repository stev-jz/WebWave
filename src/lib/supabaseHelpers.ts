import { supabase } from '../../supabaseClient'
import { Song } from '@/types'
import { extractMetadata, getAudioDuration } from './audioUtils'

export const uploadSongFile = async (file: File, userId: string): Promise<Song> => {
  // Check file size limit (7MB = 7 * 1024 * 1024 bytes)
  const MAX_FILE_SIZE = 7 * 1024 * 1024 // 7MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is 7MB, but file is ${(file.size / (1024 * 1024)).toFixed(1)}MB`)
  }
  
  // Check user song count limit
  const { count, error: countError } = await supabase
    .from('songs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  if (countError) throw countError
  
  const MAX_SONGS_PER_USER = 10
  if (count !== null && count >= MAX_SONGS_PER_USER) {
    throw new Error(`Song limit reached. You can only upload ${MAX_SONGS_PER_USER} songs. Please delete some songs first.`)
  }
  
  // Extract metadata
  const { artist, title } = extractMetadata(file.name)
  
  // Get audio duration
  let duration: number | undefined
  try {
    duration = await getAudioDuration(file)
  } catch (error) {
    console.warn('Could not extract duration:', error)
  }
  
  // Upload file to storage
  const filePath = `${userId}/${Date.now()}_${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('mp3')
    .upload(filePath, file, {
      contentType: 'audio/mpeg',
      upsert: false,
    })
  
  if (uploadError) throw uploadError
  
  // Insert song record
  const { data: song, error: dbError } = await supabase
    .from('songs')
    .insert({
      user_id: userId,
      title,
      artist,
      filename: file.name,
      file_path: filePath,
      duration: duration ? Math.floor(duration) : null,
    })
    .select()
    .single()
  
  if (dbError) throw dbError
  
  return song
}

export interface YouTubeMetadata {
  title: string
  artist: string
  duration: number
  originalUrl: string
}

export const uploadSongFromYoutube = async (
  file: File, 
  userId: string, 
  metadata: YouTubeMetadata
): Promise<Song> => {
  // Check file size limit (7MB = 7 * 1024 * 1024 bytes)
  const MAX_FILE_SIZE = 7 * 1024 * 1024 // 7MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is 7MB, but file is ${(file.size / (1024 * 1024)).toFixed(1)}MB`)
  }
  
  // Check user song count limit
  const { count, error: countError } = await supabase
    .from('songs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  if (countError) throw countError
  
  const MAX_SONGS_PER_USER = 10
  if (count !== null && count >= MAX_SONGS_PER_USER) {
    throw new Error(`Song limit reached. You can only upload ${MAX_SONGS_PER_USER} songs. Please delete some songs first.`)
  }
  
  // Upload file to storage
  const filePath = `${userId}/${Date.now()}_${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('mp3')
    .upload(filePath, file, {
      contentType: 'audio/mpeg',
      upsert: false,
    })
  
  if (uploadError) throw uploadError
  
  // Insert song record with YouTube metadata
  const { data: song, error: dbError } = await supabase
    .from('songs')
    .insert({
      user_id: userId,
      title: metadata.title,
      artist: metadata.artist,
      filename: file.name,
      file_path: filePath,
      duration: Math.floor(metadata.duration),
    })
    .select()
    .single()
  
  if (dbError) throw dbError
  
  return song
}

export const getUserSongs = async (userId: string): Promise<Song[]> => {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  // Add URLs for playback; prefer signed URL, fallback to public URL
  const songsWithUrls = await Promise.all(data.map(async song => {
    try {
      const { data: signed, error: signedErr } = await supabase.storage
        .from('mp3')
        .createSignedUrl(song.file_path, 3600)
      if (!signedErr && signed?.signedUrl) {
        return { ...song, url: signed.signedUrl }
      }
      console.error('Signed URL error for', song.title, signedErr)
    } catch (e) {
      console.error('Signed URL exception for', song.title, e)
    }

    // Fallback to public URL (works if bucket is public)
    try {
      const { data: publicUrl } = supabase.storage.from('mp3').getPublicUrl(song.file_path)
      if (publicUrl?.publicUrl) {
        return { ...song, url: publicUrl.publicUrl }
      }
    } catch (e) {
      console.error('Public URL exception for', song.title, e)
    }

    // Could not build any URL → mark as unavailable
    return { ...song, url: null }
  }))
  
  return songsWithUrls
}

export const deleteSong = async (songId: string, filePath: string): Promise<void> => {
  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('mp3')
    .remove([filePath])
  
  if (storageError) throw storageError
  
  // Delete from database
  const { error: dbError } = await supabase
    .from('songs')
    .delete()
    .eq('id', songId)
  
  if (dbError) throw dbError
}

export const deleteUserAccount = async (userId: string): Promise<void> => {
  try {
    // 1. Get all user's songs to get file paths
    const { data: userSongs, error: songsError } = await supabase
      .from('songs')
      .select('file_path')
      .eq('user_id', userId)
    
    if (songsError) throw songsError
    
    // 2. Delete all user's files from storage
    if (userSongs && userSongs.length > 0) {
      const filePaths = userSongs.map(song => song.file_path)
      const { error: storageError } = await supabase.storage
        .from('mp3')
        .remove(filePaths)
      
      if (storageError) throw storageError
    }
    
    // 3. Delete all user's songs from database
    const { error: songsDeleteError } = await supabase
      .from('songs')
      .delete()
      .eq('user_id', userId)
    
    if (songsDeleteError) throw songsDeleteError
    
    // 4. Call API route to delete user from auth
    const response = await fetch('/api/delete-account', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete account')
    }
    
  } catch (error) {
    console.error('Error deleting user account:', error)
    throw error
  }
}
