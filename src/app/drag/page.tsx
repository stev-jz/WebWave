'use client'

import { supabase } from '../../../supabaseClient'
import { useState } from 'react'

export default function DragPage() {
  const [uploading, setUploading] = useState(false)

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]

    if (!file || file.type !== 'audio/mpeg') return alert('Please drop an MP3 file.')

    const filePath = `${Date.now()}_${file.name}`

    setUploading(true)
    const { error } = await supabase.storage
      .from('mp3')
      .upload(filePath, file, {
        contentType: 'audio/mpeg',
        upsert: false,
      })

    setUploading(false)

    if (error) {
      alert('Upload failed: ' + error.message)
    } else {
      alert('Upload successful!')
    }
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="w-full h-screen flex items-center justify-center border-4 border-dashed border-purple-400 bg-purple-100"
    >
      <p className="text-xl text-purple-700">
        {uploading ? 'Uploading...' : 'Drop your MP3 file here'}
      </p>
    </div>
  )
}
