'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaMusic } from 'react-icons/fa';

const navLinks = [
  { href: '/home', label: 'Music Player', icon: <FaMusic /> },
  { href: '/drag', label: 'Drag and Drop Audio', icon: <FaHome /> },
  { href: '/downloads', label: 'Downloads', icon: <FaHome /> },
  { href: '/settings', label: 'Settings', icon: <FaHome /> }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-zinc-900 text-white fixed left-0 top-0 p-6">
      <Link href="/home"><h1 className="text-2xl font-bold mb-8">🎵 WebWave</h1></Link>
      <nav className="space-y-4">
        {navLinks.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center space-x-3 px-4 py-2 rounded-md transition 
              ${pathname === href ? 'bg-zinc-700' : 'hover:bg-zinc-800'}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-6 left-6 right-6 flex gap-2">
        <Link href="/login" className="flex-1">
            <button className="w-full bg-white text-black px-4 py-2 rounded-md hover:bg-zinc-200">
            Login
            </button>
        </Link>
        <Link href="/signup" className="flex-1">
            <button className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
            Sign Up
            </button>
        </Link>
      </div>
    </aside>
  );
}
