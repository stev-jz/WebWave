import Sidebar from '@/components/navbar';
import './globals.css';

export const metadata = {
  title: 'WebWave',
  description: 'Spotify-style MP3 player app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Sidebar />
        <main className="ml-64 p-6">{children}</main>
      </body>
    </html>
  );
}
