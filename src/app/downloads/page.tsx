'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

export default function DownloadsPage() {
  const [files, setFiles] = useState<{ name: string; url: string }[]>([])

  useEffect(() => {
    const fetchFiles = async () => {
      const { data, error } = await supabase.storage.from('mp3').list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      })

      if (error) {
        console.error('Error fetching files:', error.message)
        return
      }

      const publicUrls = data?.map((file) => {
        const { data: urlData } = supabase.storage.from('mp3').getPublicUrl(file.name)
        return {
          name: file.name,
          url: urlData.publicUrl,
        }
      })

      setFiles(publicUrls || [])
    }

    fetchFiles()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">MP3 Downloads</h1>
      {files.length === 0 && <p>No uploaded files yet.</p>}
      <ul className="space-y-6">
        {files.map((file, index) => (
          <li key={index}>
            <p className="font-medium">{file.name}</p>
            <audio controls src={file.url} className="mt-2" />
          </li>
        ))}
      </ul>
    </div>
  )
}
