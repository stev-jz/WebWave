'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useGlobalAudio } from '@/contexts/AudioContext'
import { isValidYouTubeUrl } from '@/lib/youtubeUtils'
import GlobalAudioPlayer from '@/components/GlobalAudioPlayer'

export default function DragPage() {
  const { user } = useAuth()
  const { songs, loadUserSongs } = useGlobalAudio()
  const [uploading, setUploading] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Get song count from global songs
  const songCount = songs.length

  const handleYouTubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user) {
      alert('Please log in to add songs')
      return
    }

    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL')
      return
    }

    if (!isValidYouTubeUrl(youtubeUrl)) {
      setError('Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)')
      return
    }

    // Check song limit
    if (songCount >= 10) {
      setError('Song limit reached! Delete some songs to add more.')
      return
    }

    setUploading(true)
    setUploadProgress('Converting YouTube video to MP3...')

    try {
      // Call our API to convert YouTube to MP3
      const response = await fetch('/api/youtube-to-mp3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtubeUrl }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to convert YouTube video')
      }

      if (!result.success || !result.data) {
        throw new Error('Invalid response from conversion service')
      }

      // Convert base64 audio data back to a File-like object
      setUploadProgress('Uploading to your library...')
      
      const audioData = result.data.audioData
      const audioBuffer = Buffer.from(audioData, 'base64')
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      const audioFile = new File([audioBlob], result.data.filename, { type: 'audio/mpeg' })

      // Upload using existing upload function
      const { uploadSongFromYoutube } = await import('@/lib/supabaseHelpers')
      await uploadSongFromYoutube(audioFile, user.id, {
        title: result.data.title,
        artist: result.data.artist,
        duration: result.data.duration,
        originalUrl: result.data.originalUrl
      })

      // Clear form and refresh songs
      setYoutubeUrl('')
      await loadUserSongs()
      
      alert(`Successfully added "${result.data.title}" to your library!`)

    } catch (error) {
      console.error('YouTube conversion failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
    } finally {
      setUploading(false)
      setUploadProgress(null)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="text-gray-400">You need to be logged in to upload files</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 pb-32">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Add Music from YouTube</h1>
        
        {uploading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-xl text-purple-400 mb-2">Processing...</p>
            {uploadProgress && (
              <p className="text-sm text-gray-400">{uploadProgress}</p>
            )}
          </div>
        ) : (
          <>
            <form onSubmit={handleYouTubeSubmit} className="space-y-6">
              <div>
                <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-300 mb-2">
                  YouTube URL
                </label>
                <input
                  id="youtube-url"
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={uploading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-500 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !youtubeUrl.trim() || songCount >= 10}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors cursor-pointer"
              >
                {songCount >= 10 ? 'Song Limit Reached' : 'Convert & Add to Library'}
              </button>
            </form>

            {/* Song Count Display */}
            <div className="mt-8 p-4 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-300 mb-2">
                📊 Songs: <span className="font-medium text-white">{songCount}/10</span>
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(songCount / 10) * 100}%` }}
                />
              </div>
              {songCount >= 10 && (
                <p className="text-red-400 text-sm mt-2">⚠️ Song limit reached! Delete songs to add more.</p>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
              <h3 className="text-blue-400 font-medium mb-2">How to use:</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p>1. Copy a YouTube video URL</p>
                <p>2. Paste it in the field above</p>
                <p>3. Click &quot;Convert &amp; Add to Library&quot;</p>
                <p>4. Wait for conversion and upload to complete</p>
              </div>
            </div>

            {/* Limitations */}
            <div className="mt-4 text-sm text-gray-500 space-y-1">
              <p>YouTube videos only</p>
              <p>Maximum video length: 10 minutes</p>
              <p>Maximum file size after conversion: 7MB</p>
              <p>Maximum songs per user: 10</p>
            </div>
          </>
        )}
      </div>

      {/* Audio Player */}
      <GlobalAudioPlayer />
    </div>
  )
}
