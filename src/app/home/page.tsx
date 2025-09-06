'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useGlobalAudio } from '@/contexts/AudioContext'
import { deleteSong } from '@/lib/supabaseHelpers'
import { Song } from '@/types'
import { FaTrash } from 'react-icons/fa'
import GlobalAudioPlayer from '@/components/GlobalAudioPlayer'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const { songs, loadUserSongs, audioPlayer } = useGlobalAudio()
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Wait for auth to finish loading before checking user state
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        // User is authenticated, mark as loaded
        setLoading(false)
      } else {
        // No user, mark as loaded so we can show the login message
        setLoading(false)
      }
    }
  }, [authLoading, user])

  const handleDelete = async (song: Song) => {
    if (!confirm(`Are you sure you want to delete "${song.title}"?`)) {
      return
    }

    try {
      setDeleting(song.id)
      await deleteSong(song.id, song.file_path)
      // Reload songs in global context
      await loadUserSongs()
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete song')
    } finally {
      setDeleting(null)
    }
  }

  const handlePlaySong = (song: Song, index: number) => {
    // Set the current song and start playing
    audioPlayer.playFromPlaylist(songs, index)
  }


  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to WebWave</h1>
          <p className="text-gray-400 mb-8">Please log in to access your music library</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">Error: {error}</p>
          <button 
            onClick={loadUserSongs}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 pb-32">
      <h1 className="text-3xl font-bold mb-8">Your Music Library</h1>
      
      {songs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No songs in your library yet</p>
          <p className="text-sm text-gray-500">
            Upload some MP3 files using the drag & drop page
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {songs.map((song, index) => (
              <div 
                key={song.id} 
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handlePlaySong(song, index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-gray-400 font-mono text-sm min-w-[30px]">
                      #{(index + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{song.title}</h3>
                      <p className="text-gray-400 text-sm">{song.artist}</p>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {song.duration && `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}`}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(song)
                      }}
                      disabled={deleting === song.id}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Delete"
                    >
                      {deleting === song.id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Audio Player - Only on this page */}
      <GlobalAudioPlayer />
    </div>
  )
}
