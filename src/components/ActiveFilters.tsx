'use client';

import { X, SlidersHorizontal } from 'lucide-react';

interface Props {
  filters: { type: string; value: string }[];
  onRemove: (type: string) => void;
  onClearAll: () => void;
}

const colors: Record<string, string> = {
  region: 'bg-blue-50 text-blue-700 border-blue-200',
  family: 'bg-slate-50 text-slate-700 border-slate-200',
  order: 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function ActiveFilters({ filters, onRemove, onClearAll }: Props) {
  if (filters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SlidersHorizontal size={14} className="text-slate-400" />
      {filters.map(f => (
        <button
          key={f.type}
          onClick={() => onRemove(f.type)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
            colors[f.type] || 'bg-slate-50 text-slate-600 border-slate-200'
          } hover:opacity-70 transition-opacity`}
        >
          {f.type}: {f.value}
          <X size={12} />
        </button>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}