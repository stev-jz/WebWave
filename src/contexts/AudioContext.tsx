'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getUserSongs } from '@/lib/supabaseHelpers'
import { Song } from '@/types'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'

interface AudioContextType {
  songs: Song[]
  loadUserSongs: () => Promise<void>
  audioPlayer: ReturnType<typeof useAudioPlayer>
}

const AudioContext = createContext<AudioContextType | null>(null)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [songs, setSongs] = useState<Song[]>([])
  const audioPlayer = useAudioPlayer()

  const loadUserSongs = useCallback(async () => {
    if (!user) return

    try {
      const userSongs = await getUserSongs(user.id)
      // Only update if the list actually changed to avoid reloading current track
      const changed = JSON.stringify(userSongs.map(s => s.id)) !== JSON.stringify(songs.map(s => s.id))
      setSongs(userSongs)
      if (changed) {
        audioPlayer.setPlaylist(userSongs)
      }
    } catch (error) {
      console.error('Error loading songs:', error)
    }
  }, [user, songs, audioPlayer])

  // Load songs when user changes
  useEffect(() => {
    if (user) {
      loadUserSongs()
    } else {
      setSongs([])
      audioPlayer.setPlaylist([])
    }
  }, [user, loadUserSongs, audioPlayer])

  return (
    <>
      {/* Hidden audio element mounted at provider level so hooks can bind events immediately */}
      <audio ref={audioPlayer.audioRef} style={{ display: 'none' }} />
      <AudioContext.Provider value={{ songs, loadUserSongs, audioPlayer }}>
        {children}
      </AudioContext.Provider>
    </>
  )
}

export function useGlobalAudio() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useGlobalAudio must be used within an AudioProvider')
  }
  return context
}
