'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Fish } from 'lucide-react';

interface Props {
  images: string[];
  name: string;
  className?: string;
}

export default function ImageSlideshow({ images, name, className = 'h-52' }: Props) {
  const [current, setCurrent] = useState(0);
  const [errored, setErrored] = useState<Record<number, boolean>>({});

  if (!images || images.filter((_, i) => !errored[i]).length === 0) {
    return (
      <div className={`${className} w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center`}>
        <div className="text-center">
          <Fish className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <span className="text-xs text-slate-400 font-medium">{name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className} w-full bg-slate-100 overflow-hidden group`}>
      <img
        src={images[current]}
        alt={name}
        className="w-full h-full object-cover"
        onError={() => setErrored(prev => ({ ...prev, [current]: true }))}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((current - 1 + images.length) % images.length); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((current + 1) % images.length); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}