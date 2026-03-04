'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { Search, X, Fish, ArrowUpDown, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import FishCard from '@/components/FishCard';
import FishListItem from '@/components/FishListItem';
import FishDetail from '@/components/FishDetail';
import ActiveFilters from '@/components/ActiveFilters';
import FilterSidebar from '@/components/FilterSidebar';
import { Species } from '@/types/species';

type SortKey = 'name' | 'region' | 'family' | 'order' | 'photoSource';
type ViewMode = 'grid' | 'list';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'region', label: 'Region' },
  { value: 'family', label: 'Family' },
  { value: 'order', label: 'Order' },
  { value: 'photoSource', label: 'Source' },
];

export default function FishExplorer() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedFish, setSelectedFish] = useState<Species | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [showSort, setShowSort] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const q = query(collection(db, 'species'), orderBy('name'));
        const snapshot = await getDocs(q);
        setSpecies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Species[]);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let results = species.filter(fish => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        fish.name?.toLowerCase().includes(q) ||
        fish.englishName?.toLowerCase().includes(q) ||
        fish.scientificName?.toLowerCase().includes(q) ||
        fish.family?.toLowerCase().includes(q) ||
        fish.order?.toLowerCase().includes(q) ||
        fish.region?.toLowerCase().includes(q);

      const matchesFilters = Object.entries(filters).every(([key, val]) => {
  if (!val) return true;
  if (key === 'hasImages') {
    const has = fish.images?.length > 0;
    return val === 'Has images' ? has : !has;
  }
  const fishVal = (fish as any)[key];
  if (typeof fishVal !== 'string') return true;
  return fishVal.toLowerCase() === val.toLowerCase();
});

      return matchesSearch && matchesFilters;
    });

    results.sort((a, b) => ((a as any)[sortBy] || '').toLowerCase().localeCompare(((b as any)[sortBy] || '').toLowerCase()));
    return results;
  }, [species, searchQuery, filters, sortBy]);

  const handleFilter = (type: string, value: string) => {
    if (!value) {
      setFilters(prev => { const n = { ...prev }; delete n[type]; return n; });
    } else {
      setFilters(prev => ({ ...prev, [type]: value }));
    }
  };

  const removeFilter = (type: string) => setFilters(prev => { const n = { ...prev }; delete n[type]; return n; });
  const activeFilters = Object.entries(filters).filter(([, v]) => v).map(([type, value]) => ({ type, value }));

  // ─── Detail View ───
  if (selectedFish) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <FishDetail fish={selectedFish} onBack={() => setSelectedFish(null)} onFilter={handleFilter} />
        </main>
      </div>
    );
  }

  // ─── Main View ───
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Logo />

          <div className="relative w-full max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full h-9 pl-9 pr-8 rounded-lg bg-slate-50 border border-slate-200/60 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`lg:hidden w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}
            >
              <SlidersHorizontal size={14} />
            </button>

            {/* View toggle */}
            <div className="hidden sm:flex items-center border border-slate-200/60 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`w-8 h-8 flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
                <LayoutGrid size={14} />
              </button>
              <button onClick={() => setViewMode('list')} className={`w-8 h-8 flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
                <List size={14} />
              </button>
            </div>

            {/* Sort */}
            <div className="relative hidden sm:block">
              <button onClick={() => setShowSort(!showSort)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200/60 text-[11px] font-medium text-slate-500 hover:bg-slate-50 transition-colors">
                <ArrowUpDown size={11} />
                {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
              </button>
              {showSort && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg border border-slate-200 shadow-lg py-1 min-w-[110px]">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                        className={`block w-full text-left px-3 py-1.5 text-[11px] font-medium transition-colors ${sortBy === opt.value ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <span className="text-[11px] text-slate-400 font-medium tabular-nums hidden md:block">{filtered.length}</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="mb-4">
            <ActiveFilters filters={activeFilters} onRemove={removeFilter} onClearAll={() => setFilters({})} />
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar — always visible on desktop */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-56 shrink-0`}>
            <div className="sticky top-20 bg-white rounded-xl border border-slate-200/60 p-4">
              <FilterSidebar species={species} filters={filters} onFilter={handleFilter} />
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-7 h-7 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <Fish className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium">No species found</p>
                {(searchQuery || activeFilters.length > 0) && (
                  <button onClick={() => { setSearchQuery(''); setFilters({}); }} className="mt-3 text-xs text-blue-500 hover:underline font-medium">
                    Reset filters
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map(fish => (
                  <FishCard key={fish.id} fish={fish} onClick={() => setSelectedFish(fish)} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(fish => (
                  <FishListItem key={fish.id} fish={fish} onClick={() => setSelectedFish(fish)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
        <Fish size={15} className="text-white" />
      </div>
      <span className="text-base font-bold text-slate-900 tracking-tight">OURFISH</span>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center">
        <Logo />
      </div>
    </header>
  );
}

