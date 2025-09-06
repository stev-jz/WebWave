'use client';

import { useAuth } from '@/hooks/useAuth'

export default function SettingsPage() {
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          <p className="text-gray-400">Please log in to access settings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="max-w-2xl space-y-6">
        {/* Account Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <p className="text-white">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">User ID</label>
              <p className="text-gray-300 font-mono text-sm">{user.id}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Account Created</label>
              <p className="text-gray-300">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">About WebWave</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Version</label>
              <p className="text-white">1.0.0</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Storage Usage</label>
              <p className="text-gray-300">Music files stored securely in the cloud</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Features</label>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Add up to 10 songs from YouTube (10 min max each)</li>
                <li>• Convert YouTube videos to MP3 automatically</li>
                <li>• Secure cloud storage with Supabase</li>
                <li>• High-quality audio playback</li>
                <li>• Click any song to play instantly</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-400">Danger Zone</h2>
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              Once you sign out, you&apos;ll need to sign back in to access your music library.
            </p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
