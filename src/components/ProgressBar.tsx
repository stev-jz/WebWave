'use client'

import { formatTime } from '@/lib/audioUtils'

interface ProgressBarProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
}

export default function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    const percentage = clickX / width
    const newTime = percentage * duration
    
    onSeek(newTime)
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center space-x-3 w-full">
      <span className="text-sm text-gray-400 min-w-[40px]">
        {formatTime(currentTime)}
      </span>
      
      <div 
        className="flex-1 h-2 bg-gray-700 rounded-full cursor-pointer group"
        onClick={handleClick}
      >
        <div 
          className="h-full bg-white rounded-full transition-all duration-150 group-hover:bg-green-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <span className="text-sm text-gray-400 min-w-[40px]">
        {formatTime(duration)}
      </span>
    </div>
  )
}
