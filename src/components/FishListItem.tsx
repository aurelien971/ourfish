'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Fish as FishIcon } from 'lucide-react';
import { Species } from '@/types/species';

interface Props {
  fish: Species;
  onClick: () => void;
}

export default function FishListItem({ fish, onClick }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} onClick={onClick} className="flex items-center gap-4 bg-white rounded-lg border border-slate-200/60 p-3 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all group">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
        {fish.images?.length > 0 && visible ? (
          <>
            {!loaded && <div className="w-full h-full bg-slate-100" />}
            <img
              src={fish.images[0]}
              alt={fish.name}
              loading="lazy"
              decoding="async"
              className={`w-full h-full object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FishIcon size={20} className="text-slate-300" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-semibold text-slate-900 capitalize truncate group-hover:text-blue-600 transition-colors">{fish.name}</h3>
          {fish.englishName && <span className="text-[11px] text-slate-400 truncate shrink-0">{fish.englishName}</span>}
        </div>
        {fish.scientificName && <p className="text-[11px] text-slate-400 italic truncate">{fish.scientificName}</p>}
        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-medium">
          {fish.region && (
            <span className="flex items-center gap-0.5 text-blue-500">
              <MapPin size={9} /> {fish.region}
            </span>
          )}
          {fish.family && fish.family !== 'unknown' && <span>{fish.family}</span>}
          {fish.order && fish.order !== 'unknown' && <span>{fish.order}</span>}
        </div>
      </div>

      <span className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
        fish.photoSource === 'web' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
      }`}>
        {fish.photoSource}
      </span>
    </div>
  );
}