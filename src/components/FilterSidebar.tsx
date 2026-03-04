'use client';

import { useMemo } from 'react';
import { Species } from '@/types/species';

interface Props {
  species: Species[];
  filters: Record<string, string>;
  onFilter: (type: string, value: string) => void;
}

export default function FilterSidebar({ species, filters, onFilter }: Props) {
  const facets = useMemo(() => {
    const regionMap: Record<string, number> = {};
    const familyMap: Record<string, number> = {};
    const orderMap: Record<string, number> = {};
    const sourceMap: Record<string, number> = {};
    let withImages = 0;
    let withoutImages = 0;

    species.forEach(s => {
      if (s.region) regionMap[s.region] = (regionMap[s.region] || 0) + 1;
      if (s.family && s.family !== 'unknown') familyMap[s.family] = (familyMap[s.family] || 0) + 1;
      if (s.order && s.order !== 'unknown') orderMap[s.order] = (orderMap[s.order] || 0) + 1;
      if (s.photoSource) sourceMap[s.photoSource] = (sourceMap[s.photoSource] || 0) + 1;
      if (s.images?.length > 0) withImages++; else withoutImages++;
    });

    const sort = (map: Record<string, number>) =>
      Object.entries(map).sort((a, b) => b[1] - a[1]);

    return {
      hasImages: [['Has images', withImages], ['No images', withoutImages]] as [string, number][],
      photoSource: sort(sourceMap),
      region: sort(regionMap),
      family: sort(familyMap),
      order: sort(orderMap),
    };
  }, [species]);

  const sections = [
    { key: 'hasImages', label: 'Images' },
    { key: 'photoSource', label: 'Source' },
    { key: 'region', label: 'Region' },
    { key: 'family', label: 'Family' },
    { key: 'order', label: 'Order' },
  ] as const;

  return (
    <div className="space-y-5">
      {sections.map(section => {
        const items = facets[section.key];
        if (items.length === 0) return null;
        const active = filters[section.key];

        return (
          <div key={section.key}>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{section.label}</h4>
            <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
              {items.map(([value, count]) => {
                const isActive = active?.toLowerCase() === value.toString().toLowerCase();
                return (
                  <button
                    key={value}
                    onClick={() => onFilter(section.key, isActive ? '' : value.toString())}
                    className={`w-full text-left flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="truncate capitalize">{value}</span>
                    <span className={`text-[10px] tabular-nums shrink-0 ml-2 ${isActive ? 'text-blue-400' : 'text-slate-300'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}