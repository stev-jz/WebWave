'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { FaHome, FaMusic, FaYoutube, FaDownload, FaCog, FaSignOutAlt } from 'react-icons/fa';

const navLinks = [
  { href: '/home', label: 'Your Library', icon: <FaMusic /> },
  { href: '/drag', label: 'Add from YouTube', icon: <FaYoutube /> },
  { href: '/settings', label: 'Settings', icon: <FaCog /> }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <aside className="w-64 h-screen bg-zinc-900 text-white fixed left-0 top-0 p-6 flex flex-col">
      <Link href="/home">
        <h1 className="text-2xl font-bold mb-8 hover:text-green-400 transition-colors cursor-pointer">
          🎵 WebWave
        </h1>
      </Link>
      
      <nav className="space-y-2 flex-1">
        {navLinks.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors cursor-pointer ${
              pathname === href 
                ? 'bg-green-600 text-white' 
                : 'hover:bg-zinc-800 text-gray-300 hover:text-white'
            }`}
          >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-700 pt-4">
        {user ? (
          <div className="space-y-3">
            <div className="px-4 py-2">
              <p className="text-sm text-gray-400">Signed in as</p>
              <p className="text-sm font-medium truncate">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              <FaSignOutAlt />
              <span>{loading ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/login" className="flex-1">
              <button className="w-full bg-white text-black px-4 py-2 rounded-md hover:bg-zinc-200 transition-colors font-medium cursor-pointer">
                Login
              </button>
            </Link>
            <Link href="/signup" className="flex-1">
              <button className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors font-medium cursor-pointer">
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
