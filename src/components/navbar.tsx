'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaMusic } from 'react-icons/fa';

const navLinks = [
    {href: '/home', label: 'Music Player', icon: <FaMusic/>},
    {href: '/dragndrop', label: 'Drag and Drop', icon: <FaHome/>},
    {href: '/downloads', label: 'Downloads', icon: <FaHome/>},
]

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-zinc-900 text-white fixed left-0 top-0 p-6">
      <h1 className="text-2xl font-bold mb-8">🎵 WebWave</h1>
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
    </aside>
  );
}
