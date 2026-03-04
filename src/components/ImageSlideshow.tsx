'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Fish, ImageOff } from 'lucide-react';

interface Props {
  images: string[];
  name: string;
  className?: string;
  onImageClick?: (index: number) => void;
}

export default function ImageSlideshow({ images, name, className = 'h-52', onImageClick }: Props) {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [errored, setErrored] = useState<Record<number, boolean>>({});

  const validImages = images?.filter((_, i) => !errored[i]) || [];

  const go = useCallback((dir: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(prev => (prev + dir + images.length) % images.length);
  }, [images?.length]);

  if (validImages.length === 0) {
    return (
      <div className={`${className} w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center`}>
        <div className="text-center opacity-50">
          {images?.length > 0
            ? <ImageOff className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
            : <Fish className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
          }
          <span className="text-[10px] text-slate-400 font-medium block max-w-[120px] mx-auto leading-tight">{name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className} w-full bg-slate-900 overflow-hidden group`}>
      {!loaded[current] && <div className="absolute inset-0 bg-slate-100 animate-pulse" />}

      <img
        src={images[current]}
        alt={`${name} - ${current + 1}`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${onImageClick ? 'cursor-zoom-in' : ''} ${loaded[current] ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(prev => ({ ...prev, [current]: true }))}
        onError={() => setErrored(prev => ({ ...prev, [current]: true }))}
        onClick={(e) => { if (onImageClick) { e.stopPropagation(); onImageClick(current); } }}
      />

      {images.length > 1 && (
        <>
          <button onClick={(e) => go(-1, e)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm">
            <ChevronLeft size={16} />
          </button>
          <button onClick={(e) => go(1, e)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm">
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 px-2 py-1 rounded-full bg-black/20 backdrop-blur-sm">
            {images.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }} className={`rounded-full transition-all ${i === current ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`} />
            ))}
          </div>
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            {current + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
}