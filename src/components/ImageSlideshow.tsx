'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Fish, ImageOff } from 'lucide-react';

// Global cache — survives component re-renders/remounts
const loadedCache = new Set<string>();

interface Props {
  images: string[];
  name: string;
  className?: string;
  onImageClick?: (index: number) => void;
}

export default function ImageSlideshow({ images, name, className = 'h-52', onImageClick }: Props) {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>(() => {
    // Pre-fill from cache so already-seen images show instantly
    const initial: Record<number, boolean> = {};
    images?.forEach((url, i) => { if (loadedCache.has(url)) initial[i] = true; });
    return initial;
  });
  const [errored, setErrored] = useState<Record<number, boolean>>({});
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const validImages = images?.filter((_, i) => !errored[i]) || [];

  const go = useCallback((dir: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(prev => (prev + dir + images.length) % images.length);
  }, [images?.length]);

  const handleLoad = useCallback((index: number) => {
    if (images?.[index]) loadedCache.add(images[index]);
    setLoaded(prev => ({ ...prev, [index]: true }));
  }, [images]);

if (!images || validImages.length === 0) {
    return (
      <div ref={ref} className={`${className} w-full bg-slate-50 flex items-center justify-center`}>
        <div className="text-center opacity-50">
          <Fish className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
          <span className="text-[11px] text-slate-400 font-medium block">No image for this fish</span>
        </div>
      </div>
    );
  }

  const isCached = loaded[current];

  return (
    <div ref={ref} className={`relative ${className} w-full bg-slate-100 overflow-hidden group`}>
      {!isCached && <div className="absolute inset-0 bg-slate-100" />}

      {isVisible && (
        <img
          src={images[current]}
          alt={`${name} - ${current + 1}`}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover ${onImageClick ? 'cursor-zoom-in' : ''} ${isCached ? 'opacity-100' : 'opacity-0 transition-opacity duration-200'}`}
          onLoad={() => handleLoad(current)}
          onError={() => setErrored(prev => ({ ...prev, [current]: true }))}
          onClick={(e) => { if (onImageClick) { e.stopPropagation(); onImageClick(current); } }}
        />
      )}

      {images.length > 1 && isCached && (
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