// components/DropZoneOverlay.tsx
export default function DropZoneOverlay({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;

  return (
    <div className="fixed top-0 left-64 w-[calc(100%-5rem)] h-full bg-purple-800 bg-opacity-30 z-40 flex items-center justify-center pointer-events-none">
      <h1 className="text-white text-4xl font-bold">Drop MP3 anywhere</h1>
    </div>
  );
}
