'use client';

import { ArrowLeft, MapPin, Tag, FlaskConical } from 'lucide-react';
import ImageSlideshow from './ImageSlideshow';
import { Species } from '@/types/species';

interface Props {
  fish: Species;
  onBack: () => void;
  onFilter: (type: string, value: string) => void;
}

export default function FishDetail({ fish, onBack, onFilter }: Props) {
  const details = [
    { label: 'Scientific Name', value: fish.scientificName, italic: true },
    { label: 'English Name', value: fish.englishName },
    { label: 'Quantity Caught', value: fish.quantity },
    { label: 'Common Weight (lb)', value: fish.commonWeight },
    { label: 'Location / When', value: fish.locationDetails },
    { label: 'Fishing Technique', value: fish.fishingTechnique },
  ].filter(d => d.value);

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to explorer
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <ImageSlideshow images={fish.images} name={fish.name} className="h-72 sm:h-96" />

        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 capitalize">
              {fish.name}
            </h1>
            <span
              className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                fish.photoSource === 'web'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {fish.photoSource}
            </span>
          </div>

          {fish.scientificName && (
            <p className="text-sm text-slate-400 italic mb-6">{fish.scientificName}</p>
          )}

          {/* Clickable filter tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => { onFilter('region', fish.region); onBack(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              <MapPin size={12} /> {fish.region}
            </button>
            {fish.family && fish.family !== 'unknown' && (
              <button
                onClick={() => { onFilter('family', fish.family); onBack(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <Tag size={12} /> {fish.family}
              </button>
            )}
            {fish.order && fish.order !== 'unknown' && (
              <button
                onClick={() => { onFilter('order', fish.order); onBack(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-600 text-xs font-semibold border border-violet-100 hover:bg-violet-100 transition-colors"
              >
                <FlaskConical size={12} /> {fish.order}
              </button>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {details.map((d) => (
              <div key={d.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {d.label}
                </p>
                <p className={`text-sm text-slate-700 ${d.italic ? 'italic' : ''}`}>
                  {d.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}