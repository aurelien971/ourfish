'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface Species {
  id: string;
  [key: string]: any; // This allows us to access all your CSV columns
}

export default function SpeciesGallery() {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const q = query(collection(db, 'species'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSpeciesList(data);
      } catch (error) {
        console.error("Error fetching species:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecies();
  }, []);

  const filteredSpecies = speciesList.filter(s => {
    const nameFr = s['Noms vernaculaires local ou francais']?.toLowerCase() || '';
    const nameEn = s['Nom vernaculaire anglais']?.toLowerCase() || '';
    const scientific = s['nom scientifique (especes)']?.toLowerCase() || '';
    return nameFr.includes(searchTerm.toLowerCase()) || 
           nameEn.includes(searchTerm.toLowerCase()) ||
           scientific.includes(searchTerm.toLowerCase());
  });

  if (loading) return <div className="p-10 text-center">Loading your collection...</div>;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h1 className="text-4xl font-bold text-blue-400">Species Library</h1>
          <input 
            type="text"
            placeholder="Search by name or scientific name..."
            className="p-2 rounded bg-gray-800 border border-gray-700 w-full md:max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpecies.map((fish) => (
            <div key={fish.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-colors shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold capitalize">
                  {fish['Noms vernaculaires local ou francais'] || 'Unknown Species'}
                </h2>
                <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">
                  {fish['famille']}
                </span>
              </div>
              
              <p className="text-gray-400 italic text-sm mb-4">
                {fish['nom scientifique (especes)']}
              </p>

              <div className="space-y-2 text-sm border-t border-gray-700 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">English:</span>
                  <span>{fish['Nom vernaculaire anglais']}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Region:</span>
                  <span>{fish['Regions du monde']}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Caught:</span>
                  <span className="text-blue-300 font-bold">{fish['combien']} times</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400">
                <strong>Best Tech:</strong> {fish['Technique de peche']}
              </div>
            </div>
          ))}
        </div>

        {filteredSpecies.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No species found matching that search.</p>
        )}
      </div>
    </main>
  );
}