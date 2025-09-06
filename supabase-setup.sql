-- Supabase Database Setup for WebWave Music Streaming App
-- Run this SQL in your Supabase SQL Editor

-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  duration INTEGER, -- duration in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on songs table
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for songs table
CREATE POLICY "Users can view their own songs" ON songs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own songs" ON songs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own songs" ON songs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own songs" ON songs
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for MP3 files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('mp3', 'mp3', true) 
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own MP3 files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'mp3' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own MP3 files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'mp3' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own MP3 files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'mp3' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for songs table
CREATE TRIGGER update_songs_updated_at 
  BEFORE UPDATE ON songs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS songs_user_id_idx ON songs(user_id);
CREATE INDEX IF NOT EXISTS songs_created_at_idx ON songs(created_at DESC);

-- Optional: Create playlists table for future enhancement
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on playlists table
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for playlists table
CREATE POLICY "Users can manage their own playlists" ON playlists
  FOR ALL USING (auth.uid() = user_id);

-- Create playlist_songs junction table
CREATE TABLE IF NOT EXISTS playlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, song_id)
);

-- Enable RLS on playlist_songs table
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for playlist_songs
CREATE POLICY "Users can manage songs in their playlists" ON playlist_songs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );
