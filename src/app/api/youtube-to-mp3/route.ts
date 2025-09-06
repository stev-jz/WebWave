import { NextRequest, NextResponse } from 'next/server'
import { validateAndExtractVideoId } from '@/lib/youtubeUtils'

/**
 * API Route: Convert YouTube video to MP3
 * 
 * This endpoint:
 * 1. Validates the YouTube URL
 * 2. Downloads the audio from YouTube
 * 3. Converts to MP3 format
 * 4. Returns the MP3 data and metadata
 */
export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl } = await request.json()

    if (!youtubeUrl || typeof youtubeUrl !== 'string') {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      )
    }

    // Validate YouTube URL
    const videoId = validateAndExtractVideoId(youtubeUrl)
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL. Please provide a valid YouTube video link.' },
        { status: 400 }
      )
    }

    // Try to use @distube/ytdl-core as it's more maintained
    let ytdl: {
      getInfo: (url: string) => Promise<{
        videoDetails: {
          title: string
          lengthSeconds: string
          author?: { name: string }
        }
      }>
      (url: string, options?: { quality?: string; filter?: 'audioonly' | 'videoonly' | 'videoandaudio' }): NodeJS.ReadableStream
    }
    try {
      const distube = await import('@distube/ytdl-core')
      ytdl = distube.default
    } catch {
      // Fallback to regular ytdl-core
      const regular = await import('ytdl-core')
      ytdl = regular.default
    }
    
    console.log('Getting video info for:', youtubeUrl)
    
    // Get video info first to validate and get metadata
    const info = await ytdl.getInfo(youtubeUrl)
    const title = info.videoDetails.title
    const duration = parseInt(info.videoDetails.lengthSeconds)
    const author = info.videoDetails.author?.name || 'Unknown Artist'
    
    console.log('Video info:', { title, duration, author })
    
    // Validate duration (max 10 minutes = 600 seconds)
    if (duration > 600) {
      return NextResponse.json(
        { error: 'Video is too long. Maximum duration is 10 minutes.' },
        { status: 400 }
      )
    }
    
    console.log('Starting audio download...')
    
    // Download audio stream
    const audioStream = ytdl(youtubeUrl, {
      quality: 'highestaudio',
      filter: 'audioonly'
    })
    
    // Convert stream to buffer
    const chunks: Buffer[] = []
    
    return new Promise<Response>((resolve, reject) => {
      audioStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })
      
      audioStream.on('end', () => {
        try {
          const audioBuffer = Buffer.concat(chunks)
          console.log('Download complete, buffer size:', audioBuffer.length)
          
          // Validate file size (max 7MB)
          const maxSize = 7 * 1024 * 1024 // 7MB in bytes
          if (audioBuffer.length > maxSize) {
            resolve(NextResponse.json(
              { error: 'Audio file is too large. Maximum size is 7MB.' },
              { status: 400 }
            ))
            return
          }
          
          // Create filename - sanitize title and keep it reasonable length
          const sanitizedTitle = title.replace(/[^a-zA-Z0-9\s-]/g, '').trim().substring(0, 50)
          const filename = `${Date.now()}_${sanitizedTitle || 'youtube_audio'}.mp3`
          
          resolve(NextResponse.json({
            success: true,
            data: {
              title: sanitizedTitle || 'Unknown Title',
              artist: author,
              duration,
              filename,
              audioData: audioBuffer.toString('base64'), // Convert to base64 for JSON transport
              size: audioBuffer.length,
              originalUrl: youtubeUrl
            }
          }))
        } catch (error) {
          console.error('Error processing audio buffer:', error)
          reject(error)
        }
      })
      
      audioStream.on('error', (error: Error) => {
        console.error('Audio stream error:', error)
        reject(error)
      })
    })

  } catch (error) {
    console.error('YouTube conversion error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to process YouTube video'
    
    if (error instanceof Error) {
      if (error.message.includes('Video unavailable')) {
        errorMessage = 'Video is unavailable or private'
      } else if (error.message.includes('Sign in to confirm your age')) {
        errorMessage = 'Video requires age verification'
      } else if (error.message.includes('This video is not available')) {
        errorMessage = 'Video is not available in your region'
      } else if (error.message.includes('Private video')) {
        errorMessage = 'Video is private'
      } else if (error.message.includes('Sign in to confirm you\'re not a bot') || error.message.includes('not a bot')) {
        errorMessage = 'YouTube error: Sign in to confirm you\'re not a bot'
      } else {
        errorMessage = `YouTube error: ${error.message}`
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
