'use client';

import { useState } from 'react';
import { ArrowLeft, MapPin, Tag, FlaskConical, Weight, Navigation, Waves, Camera, Hash, Scale, Crosshair } from 'lucide-react';
import ImageSlideshow from './ImageSlideshow';
import ImageLightbox from './ImageLightbox';
import { Species } from '@/types/species';

interface Props {
  fish: Species;
  onBack: () => void;
  onFilter: (type: string, value: string) => void;
}

export default function FishDetail({ fish, onBack, onFilter }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const rows = [
    { icon: <Hash size={13} />,       label: 'Scientific Name',    value: fish.scientificName, italic: true },
    { icon: <Tag size={13} />,        label: 'English Name',       value: fish.englishName },
    { icon: <Crosshair size={13} />,  label: 'Quantity Caught',    value: fish.quantity },
    { icon: <Scale size={13} />,      label: 'Weight (lb)',        value: fish.commonWeight },
    { icon: <Navigation size={13} />, label: 'Location / When',    value: fish.locationDetails },
    { icon: <Waves size={13} />,      label: 'Technique',          value: fish.fishingTechnique },
    { icon: <Camera size={13} />,     label: 'Photo Source',       value: fish.photoSource },
  ].filter(d => d.value);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Lightbox */}
      {lightboxIndex !== null && fish.images?.length > 0 && (
        <ImageLightbox
          images={fish.images}
          startIndex={lightboxIndex}
          name={fish.name}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Back */}
      <button onClick={onBack} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm font-medium mb-5 group transition-colors">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Back
      </button>

      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
        {/* Hero image — clickable to lightbox */}
        <ImageSlideshow
          images={fish.images}
          name={fish.name}
          className="h-64 sm:h-[400px]"
          onImageClick={(i) => setLightboxIndex(i)}
        />

        <div className="p-5 sm:p-7">
          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 capitalize tracking-tight leading-tight">
            {fish.name}
          </h1>
          {fish.scientificName && (
            <p className="text-sm text-slate-400 italic mt-0.5">{fish.scientificName}</p>
          )}

          {/* Taxonomy — clean text links, not capsules */}
          <div className="flex items-center gap-4 mt-4 text-[12px] font-medium">
            {fish.region && (
              <button onClick={() => { onFilter('region', fish.region); onBack(); }} className="text-blue-600 hover:underline flex items-center gap-1">
                <MapPin size={12} /> {fish.region}
              </button>
            )}
            {fish.family && fish.family !== 'unknown' && (
              <button onClick={() => { onFilter('family', fish.family); onBack(); }} className="text-slate-600 hover:underline flex items-center gap-1">
                <Tag size={12} /> {fish.family}
              </button>
            )}
            {fish.order && fish.order !== 'unknown' && (
              <button onClick={() => { onFilter('order', fish.order); onBack(); }} className="text-slate-600 hover:underline flex items-center gap-1">
                <FlaskConical size={12} /> {fish.order}
              </button>
            )}
          </div>

          {/* Info table — encyclopedic style */}
          {rows.length > 0 && (
            <table className="w-full mt-6 text-sm">
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.label} className={i < rows.length - 1 ? 'border-b border-slate-100' : ''}>
                    <td className="py-3 pr-4 text-slate-400 font-medium text-xs whitespace-nowrap align-top w-[160px]">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">{r.icon}</span>
                        {r.label}
                      </div>
                    </td>
                    <td className={`py-3 text-slate-700 ${r.italic ? 'italic' : ''}`}>
                      {r.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}