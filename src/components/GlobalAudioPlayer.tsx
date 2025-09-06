'use client'

import { useGlobalAudio } from '@/contexts/AudioContext'
import { useAuth } from '@/hooks/useAuth'
import PlayerControls from './PlayerControls'
import ProgressBar from './ProgressBar'
import VolumeControl from './VolumeControl'

export default function GlobalAudioPlayer() {
  const { user } = useAuth()
  const { audioPlayer } = useGlobalAudio()
  const {
    audioRef,
    currentSong,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seekTo,
    setVolume: setVolumeHandler
  } = audioPlayer

  // Always render the audio element, but only show player UI when user is logged in and has a song
  if (!user || !currentSong) {
    return null
  }

  return (
    <>
      {/* Audio Player - Fixed at bottom of page */}
      <div className="fixed bottom-0 left-64 right-0 bg-gray-900 border-t border-gray-700 p-4 z-50">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Song Info */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-white truncate">{currentSong.title}</h4>
                <p className="text-gray-400 text-sm truncate">{currentSong.artist}</p>
              </div>
            </div>

            {/* Controls - Centered */}
            <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
              <PlayerControls
                isPlaying={isPlaying}
                isLoading={isLoading}
                onPlayPause={togglePlayPause}
                onPrevious={skipToPrevious}
                onNext={skipToNext}
              />
              <ProgressBar
                currentTime={currentTime}
                duration={duration}
                onSeek={seekTo}
              />
            </div>

            {/* Volume */}
            <div className="flex items-center justify-end min-w-[120px]">
              <VolumeControl
                volume={volume}
                onVolumeChange={setVolumeHandler}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
