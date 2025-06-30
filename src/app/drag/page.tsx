// app/drag/page.tsx
"use client";

import { useState, useEffect } from "react";
import DropZoneOverlay from "@/components/DropZoneOverlay";

export default function DragPage() {
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        // Handle MP3 upload
        console.log("Dropped files:", files);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("dragover", handleDragEnter);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("dragover", handleDragEnter);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <DropZoneOverlay isActive={dragActive} />
      <div className="p-8">
        <h1 className="text-3xl font-bold">Upload Your MP3</h1>
        <p className="text-gray-600 mt-2">Drag and drop to upload.</p>
      </div>
    </div>
  );
}
