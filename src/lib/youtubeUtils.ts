/**
 * Utility functions for YouTube URL validation and processing
 */

export interface YouTubeVideoInfo {
  id: string
  title: string
  duration: number
  thumbnail: string
}

/**
 * Validates if a URL is a valid YouTube URL
 * Accepts formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function isValidYouTubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    
    // Check for youtube.com domains
    if (urlObj.hostname === 'www.youtube.com' || 
        urlObj.hostname === 'youtube.com' || 
        urlObj.hostname === 'm.youtube.com') {
      return urlObj.pathname === '/watch' && urlObj.searchParams.has('v')
    }
    
    // Check for youtu.be domain
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.length > 1 // Should have video ID in path
    }
    
    return false
  } catch {
    return false
  }
}

/**
 * Extracts YouTube video ID from a valid YouTube URL
 */
export function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    
    // For youtube.com URLs
    if (urlObj.hostname === 'www.youtube.com' || 
        urlObj.hostname === 'youtube.com' || 
        urlObj.hostname === 'm.youtube.com') {
      return urlObj.searchParams.get('v')
    }
    
    // For youtu.be URLs
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1) // Remove leading slash
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * Validates YouTube URL and returns video ID if valid
 */
export function validateAndExtractVideoId(url: string): string | null {
  if (!isValidYouTubeUrl(url)) {
    return null
  }
  return extractVideoId(url)
}
