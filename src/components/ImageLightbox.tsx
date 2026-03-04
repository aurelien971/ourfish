'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  images: string[];
  startIndex: number;
  name: string;
  onClose: () => void;
}

export default function ImageLightbox({ images, startIndex, name, onClose }: Props) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrent(prev => (prev - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setCurrent(prev => (prev + 1) % images.length);
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
          <X size={20} />
        </button>

        {/* Image */}
        <img
          src={images[current]}
          alt={`${name} - ${current + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg"
        />

        {/* Nav */}
        {images.length > 1 && (
          <>
            <button onClick={() => setCurrent((current - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCurrent((current + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-sm">
              {current + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}