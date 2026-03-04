'use client';

import { X } from 'lucide-react';

interface Props {
  filters: { type: string; value: string }[];
  onRemove: (type: string) => void;
  onClearAll: () => void;
}

export default function ActiveFilters({ filters, onRemove, onClearAll }: Props) {
  if (filters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap text-xs">
      <span className="text-slate-400 font-medium">Filtered by:</span>
      {filters.map(f => (
        <button key={f.type} onClick={() => onRemove(f.type)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition-colors">
          <span className="text-slate-400">{f.type}:</span> {f.value}
          <X size={10} className="ml-0.5 text-slate-400" />
        </button>
      ))}
      <button onClick={onClearAll} className="text-slate-400 hover:text-red-500 font-medium transition-colors underline">
        clear
      </button>
    </div>
  );
}