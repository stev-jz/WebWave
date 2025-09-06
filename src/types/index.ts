export interface Song {
  id: string
  user_id: string
  title: string
  artist?: string
  filename: string
  file_path: string
  duration?: number
  created_at: string
  url?: string
}

export interface User {
  id: string
  email: string
  created_at: string
}

export interface AudioPlayerState {
  currentSong: Song | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isLoading: boolean
  playlist: Song[]
  currentIndex: number
  isShuffled: boolean
  repeatMode: 'none' | 'one' | 'all'
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}