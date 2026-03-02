'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus('Parsing CSV...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const speciesCollection = collection(db, 'species');
          let count = 0;

          setStatus(`Uploading ${results.data.length} species...`);

          for (const row of results.data) {
            // We upload the row exactly as it is in your CSV
            await addDoc(speciesCollection, row);
            count++;
          }

          setStatus(`Success! ${count} species uploaded.`);
        } catch (error) {
          console.error(error);
          setStatus('Error uploading to Firebase. Check your console.');
        } finally {
          setUploading(false);
        }
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Upload Species CSV</h1>
        <p className="text-gray-400 mb-6 text-sm">
          Select your fish species CSV to sync it with Firebase Firestore.
        </p>
        
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
        />

        {status && (
          <p className={`mt-4 text-sm font-medium ${status.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}