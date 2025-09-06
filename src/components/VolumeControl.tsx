'use client'

import { useState } from 'react'
import { FaVolumeUp, FaVolumeDown, FaVolumeMute } from 'react-icons/fa'

interface VolumeControlProps {
  volume: number
  onVolumeChange: (volume: number) => void
}

export default function VolumeControl({ volume, onVolumeChange }: VolumeControlProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    onVolumeChange(newVolume)
  }

  const toggleMute = () => {
    onVolumeChange(volume > 0 ? 0 : 0.5)
  }

  const getVolumeIcon = () => {
    if (volume === 0) return <FaVolumeMute />
    if (volume < 0.5) return <FaVolumeDown />
    return <FaVolumeUp />
  }

  return (
    <div 
      className="flex items-center space-x-2 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={toggleMute}
        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
      >
        {getVolumeIcon()}
      </button>
      
      <div className={`transition-all duration-200 overflow-hidden ${
        isHovered ? 'w-20 opacity-100' : 'w-0 opacity-0'
      }`}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleSliderChange}
          className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    </div>
  )
}
