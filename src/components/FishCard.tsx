'use client';

import { MapPin, Tag } from 'lucide-react';
import ImageSlideshow from './ImageSlideshow';
import { Species } from '@/types/species';

interface Props {
  fish: Species;
  onClick: () => void;
}

export default function FishCard({ fish, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300"
    >
      <div className="relative">
        <ImageSlideshow images={fish.images} name={fish.name} />
        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm ${
              fish.photoSource === 'web'
                ? 'bg-amber-100/90 text-amber-700'
                : 'bg-emerald-500/90 text-white'
            }`}
          >
            {fish.photoSource}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-[15px] font-semibold text-slate-900 capitalize leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
          {fish.name}
        </h3>
        {fish.englishName && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{fish.englishName}</p>
        )}

        <div className="flex items-center gap-1.5 mt-2.5 text-blue-500 text-[11px] font-medium">
          <MapPin size={11} />
          <span className="line-clamp-1">{fish.region || 'Unknown'}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {fish.family && fish.family !== 'unknown' && (
            <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px] font-medium border border-slate-100">
              {fish.family}
            </span>
          )}
          {fish.order && fish.order !== 'unknown' && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-500 text-[10px] font-medium border border-blue-100">
              {fish.order}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}