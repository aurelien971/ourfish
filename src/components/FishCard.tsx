'use client';

import { MapPin } from 'lucide-react';
import ImageSlideshow from './ImageSlideshow';
import { Species } from '@/types/species';

interface Props {
  fish: Species;
  onClick: () => void;
}

export default function FishCard({ fish, onClick }: Props) {
  return (
    <div onClick={onClick} className="group bg-white rounded-lg border border-slate-200/60 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <ImageSlideshow images={fish.images} name={fish.name} className="h-40 sm:h-44" />
      <div className="p-3">
        <h3 className="text-[13px] font-semibold text-slate-900 capitalize leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">{fish.name}</h3>
        {fish.englishName && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{fish.englishName}</p>}
        {fish.scientificName && <p className="text-[10px] text-slate-400 italic mt-0.5 line-clamp-1">{fish.scientificName}</p>}
        {fish.region && (
          <div className="flex items-center gap-1 mt-2 text-blue-500">
            <MapPin size={9} className="shrink-0" />
            <span className="text-[10px] font-medium line-clamp-1">{fish.region}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-2 text-[9px] text-slate-400 font-medium">
          {fish.family && fish.family !== 'unknown' && <span>{fish.family}</span>}
          {fish.family && fish.order && fish.family !== 'unknown' && fish.order !== 'unknown' && <span>·</span>}
          {fish.order && fish.order !== 'unknown' && <span>{fish.order}</span>}
        </div>
      </div>
    </div>
  );
}