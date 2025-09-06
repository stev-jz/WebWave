'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Song, AudioPlayerState } from '@/types'

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const hasPendingPlayRef = useRef<boolean>(false)
  const lastTimeLogRef = useRef<number>(0)

  const debug = (...args: unknown[]) => console.log('[AUDIO]', ...args)
  const logElementState = (label: string) => {
    const a = audioRef.current
    if (!a) return console.log('[AUDIO]', label, 'no audioRef')
    console.log('[AUDIO]', label, {
      src: a.src,
      paused: a.paused,
      readyState: a.readyState,
      networkState: a.networkState,
      currentTime: a.currentTime,
      duration: a.duration,
    })
  }
  
  const [state, setState] = useState<AudioPlayerState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isLoading: false,
    playlist: [],
    currentIndex: -1,
    isShuffled: false,
    repeatMode: 'none'
  })

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      debug('loadedmetadata')
      logElementState('on loadedmetadata')
      setState(prev => ({ 
        ...prev, 
        duration: audio.duration,
        isLoading: false 
      }))
    }

    const handleTimeUpdate = () => {
      const safeTime = isNaN(audio.currentTime) ? 0 : audio.currentTime
      setState(prev => ({ ...prev, currentTime: safeTime }))
      const now = Date.now()
      if (now - lastTimeLogRef.current > 1000) {
        debug('timeupdate', { t: safeTime })
        lastTimeLogRef.current = now
      }
    }

    const handlePlay = () => {
      hasPendingPlayRef.current = false
      debug('play event')
      logElementState('on play')
      setState(prev => ({ ...prev, isPlaying: true }))
    }

    const handlePause = () => {
      hasPendingPlayRef.current = false
      debug('pause event')
      logElementState('on pause')
      setState(prev => ({ ...prev, isPlaying: false }))
    }

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }))
      // Skip to next song
      const currentState = audioRef.current?.paused !== false
      if (currentState) {
        // Auto-advance to next song logic can be added here
      }
    }

    const handleLoadStart = () => {
      debug('loadstart')
      setState(prev => ({ ...prev, isLoading: true }))
    }

    const handleCanPlay = () => {
      debug('canplay')
      logElementState('on canplay')
      setState(prev => ({ ...prev, isLoading: false }))
    }

    const handleLoadedData = () => {
      debug('loadeddata')
      setState(prev => ({ ...prev, isLoading: false }))
    }

    const handleError = (e: Event) => {
      hasPendingPlayRef.current = false
      debug('error event', e)
      logElementState('on error')
      setState(prev => ({ ...prev, isLoading: false, isPlaying: false }))
      console.error('Audio playback error:', e)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('error', handleError)
    }
  }, [])

  const loadSong = useCallback((song: Song) => {
    debug('loadSong called with:', song)
    debug('song.url:', song.url)
    
    const audio = audioRef.current
    console.log('[AUDIO] audio element:', audio)
    
    if (!audio) {
      console.log('[AUDIO] No audio element')
      return
    }
    
    if (!song.url) {
      console.log('[AUDIO] No song URL')
      return
    }

    console.log('[AUDIO] Setting current song and loading audio')
    
    setState(prev => ({ 
      ...prev, 
      currentSong: song, 
      isLoading: true,
      isPlaying: false 
    }))
    
    audio.src = song.url
    console.log('[AUDIO] Audio src set to:', audio.src)
    audio.load()
    
    // Timeout to prevent infinite loading
    setTimeout(() => {
      setState(prev => ({ ...prev, isLoading: false }))
    }, 5000)
  }, [])

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || !state.currentSong) return

    try {
      // Avoid spamming play() while a prior play request is pending
      if (hasPendingPlayRef.current) return
      hasPendingPlayRef.current = true

      // If the audio can already play, start immediately, otherwise wait for canplay
      if (audio.readyState >= 3) {
        debug('play(): readyState >= 3, calling play()')
        await audio.play()
      } else {
        debug('play(): waiting for canplay before play()')
        await new Promise<void>((resolve, reject) => {
          const onCanPlay = async () => {
            audio.removeEventListener('canplay', onCanPlay)
            try {
              await audio.play()
              resolve()
            } catch (err) {
              reject(err)
            }
          }
          audio.addEventListener('canplay', onCanPlay, { once: true })
          // Fallback safety timer
          setTimeout(() => {
            audio.removeEventListener('canplay', onCanPlay)
            // Try anyway; if it fails, it will be caught
            audio.play().then(() => {}).catch(() => {})
            resolve()
          }, 2000)
        })
      }
      // State will be updated by the 'play' event listener
    } catch (error) {
      console.error('Playback failed:', error)
      setState(prev => ({ ...prev, isPlaying: false }))
    }
  }, [state.currentSong])

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    // State will be updated by the 'pause' event listener
  }, [])

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    // Use the actual audio element state to avoid UI-state race conditions
    if (audio.paused) {
      debug('toggle -> play')
      play()
    } else {
      debug('toggle -> pause')
      pause()
    }
  }, [play, pause])

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = time
    setState(prev => ({ ...prev, currentTime: time }))
  }, [])

  const setVolume = useCallback((volume: number) => {
    const audio = audioRef.current
    if (!audio) return

    const clampedVolume = Math.max(0, Math.min(1, volume))
    audio.volume = clampedVolume
    setState(prev => ({ ...prev, volume: clampedVolume }))
  }, [])

  const setPlaylist = useCallback((playlist: Song[], startIndex: number = 0) => {
    setState(prev => ({ 
      ...prev, 
      playlist, 
      currentIndex: startIndex 
    }))
    
    if (playlist.length > 0 && startIndex >= 0 && startIndex < playlist.length) {
      loadSong(playlist[startIndex])
    }
  }, [loadSong])

  const playFromPlaylist = useCallback(async (playlist: Song[], startIndex: number = 0) => {
    setState(prev => ({ 
      ...prev, 
      playlist, 
      currentIndex: startIndex 
    }))
    
    if (playlist.length > 0 && startIndex >= 0 && startIndex < playlist.length) {
      loadSong(playlist[startIndex])
      // Don't auto-play - let user control playback
    }
  }, [loadSong])

  const skipToNext = useCallback(() => {
    const { playlist, currentIndex } = state
    
    if (playlist.length === 0) return

    const nextIndex = currentIndex + 1
    
    if (nextIndex < playlist.length) {
      setState(prev => ({ ...prev, currentIndex: nextIndex }))
      loadSong(playlist[nextIndex])
    }
  }, [state, loadSong])

  const skipToPrevious = useCallback(() => {
    const { playlist, currentIndex } = state
    
    if (playlist.length === 0) return

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1
    
    setState(prev => ({ ...prev, currentIndex: prevIndex }))
    loadSong(playlist[prevIndex])
  }, [state, loadSong])


  return {
    audioRef,
    ...state,
    loadSong,
    play,
    pause,
    togglePlayPause,
    seekTo,
    setVolume,
    setPlaylist,
    playFromPlaylist,
    skipToNext,
    skipToPrevious
  }
}
