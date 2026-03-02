'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { Search, X, Fish } from 'lucide-react';
import FishCard from '@/components/FishCard';
import FishDetail from '@/components/FishDetail';
import ActiveFilters from '@/components/ActiveFilters';
import { Species } from '@/types/species';

export default function FishExplorer() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedFish, setSelectedFish] = useState<Species | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const q = query(collection(db, 'species'), orderBy('name'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Species[];
        setSpecies(data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return species.filter(fish => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        fish.name?.toLowerCase().includes(q) ||
        fish.englishName?.toLowerCase().includes(q) ||
        fish.scientificName?.toLowerCase().includes(q) ||
        fish.family?.toLowerCase().includes(q) ||
        fish.order?.toLowerCase().includes(q) ||
        fish.region?.toLowerCase().includes(q);

      const matchesFilters = Object.entries(filters).every(([key, val]) => {
        const fishVal = (fish as any)[key];
        return fishVal?.toLowerCase() === val.toLowerCase();
      });

      return matchesSearch && matchesFilters;
    });
  }, [species, searchQuery, filters]);

  const handleFilter = (type: string, value: string) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const removeFilter = (type: string) => {
    setFilters(prev => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
  };

  const activeFilters = Object.entries(filters).map(([type, value]) => ({ type, value }));

  // ─── Detail View ───
  if (selectedFish) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <FishDetail
            fish={selectedFish}
            onBack={() => setSelectedFish(null)}
            onFilter={handleFilter}
          />
        </main>
      </div>
    );
  }

  // ─── Grid View ───
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Logo />

          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search species, families, regions..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-100 border border-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="shrink-0 text-xs text-slate-400 font-medium hidden sm:block">
            {filtered.length} species
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeFilters.length > 0 && (
          <div className="mb-5">
            <ActiveFilters
              filters={activeFilters}
              onRemove={removeFilter}
              onClearAll={() => setFilters({})}
            />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Fish className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No species found</p>
            <p className="text-slate-400 text-sm mt-1">Try a different search or clear filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(fish => (
              <FishCard key={fish.id} fish={fish} onClick={() => setSelectedFish(fish)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Shared sub-components ───
function Logo() {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <Fish size={18} className="text-white" />
      </div>
      <span className="text-lg font-bold text-slate-900 tracking-tight">OURFISH</span>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center">
        <Logo />
      </div>
    </header>
  );
}