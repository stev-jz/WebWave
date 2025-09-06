export const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '0:00'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url)
      resolve(audio.duration)
    })
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load audio'))
    })
    
    audio.src = url
  })
}

export const extractMetadata = (filename: string) => {
  // Remove file extension and timestamp prefix
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  const nameWithoutTimestamp = nameWithoutExt.replace(/^\d+_/, '')
  
  // Try to parse "Artist - Title" format
  const parts = nameWithoutTimestamp.split(' - ')
  if (parts.length >= 2) {
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim()
    }
  }
  
  // Fallback to filename as title
  return {
    artist: 'Unknown Artist',
    title: nameWithoutTimestamp
  }
}
