import { AuthProvider } from '@/hooks/useAuth'
import { AudioProvider } from '@/contexts/AudioContext'
import Sidebar from '@/components/navbar'
import './globals.css'

export const metadata = {
  title: 'WebWave',
  description: 'Full-stack music streaming platform with drag-and-drop uploads',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <AuthProvider>
          <AudioProvider>
            <Sidebar />
            <main className="ml-64">{children}</main>
          </AudioProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
