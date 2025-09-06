'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
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
  const audioPlayerRef = useRef(audioPlayer)

  // Keep ref in sync
  useEffect(() => {
    audioPlayerRef.current = audioPlayer
  }, [audioPlayer])

  const loadUserSongs = useCallback(async () => {
    if (!user) return

    try {
      const userSongs = await getUserSongs(user.id)
      setSongs(userSongs)
      audioPlayerRef.current.setPlaylist(userSongs)
    } catch (error) {
      console.error('Error loading songs:', error)
    }
  }, [user])

  // Load songs when user changes
  useEffect(() => {
    if (user) {
      loadUserSongs()
    } else {
      setSongs([])
      audioPlayerRef.current.setPlaylist([])
    }
  }, [user, loadUserSongs])

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
