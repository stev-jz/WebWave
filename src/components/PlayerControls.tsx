'use client'

import { FaPlay, FaPause, FaStepBackward, FaStepForward } from 'react-icons/fa'

interface PlayerControlsProps {
  isPlaying: boolean
  isLoading: boolean
  onPlayPause: () => void
  onPrevious: () => void
  onNext: () => void
}

export default function PlayerControls({
  isPlaying,
  isLoading,
  onPlayPause,
  onPrevious,
  onNext
}: PlayerControlsProps) {
  return (
    <div className="flex items-center justify-center space-x-6">
      {/* Previous */}
      <button
        onClick={onPrevious}
        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
      >
        <FaStepBackward size={24} />
      </button>

      {/* Play/Pause */}
      <button
        onClick={onPlayPause}
        disabled={isLoading}
        className="bg-white text-black rounded-full p-4 hover:scale-105 transition-transform disabled:opacity-50 cursor-pointer"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <FaPause size={24} />
        ) : (
          <FaPlay size={24} className="ml-1" />
        )}
      </button>

      {/* Next */}
      <button
        onClick={onNext}
        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
      >
        <FaStepForward size={24} />
      </button>
    </div>
  )
}
