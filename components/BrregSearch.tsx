'use client';

import { useState } from 'react';
import { BrregEnhet, BrregSearchResponse } from '@/lib/types';

interface BrregSearchProps {
  onSelect: (enhet: BrregEnhet) => void;
}

export default function BrregSearch({ onSelect }: BrregSearchProps) {
  const [searchType, setSearchType] = useState<'navn' | 'organisasjonsnummer'>('navn');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<BrregEnhet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set(searchType, searchQuery);

      const response = await fetch(`/api/enheter?${params}`);
      if (!response.ok) {
        throw new Error('Kunne ikke søke i Brønnøysundregistrene');
      }

      const data: BrregSearchResponse = await response.json();
      setResults(data._embedded?.enheter || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'En feil oppstod');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 card">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Søk i Brønnøysundregistrene</h3>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="mb-4 flex flex-wrap gap-4 text-sm font-semibold text-slate-800">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              value="navn"
              checked={searchType === 'navn'}
              onChange={(e) => setSearchType(e.target.value as 'navn')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
            />
            Søk på navn
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              value="organisasjonsnummer"
              checked={searchType === 'organisasjonsnummer'}
              onChange={(e) => setSearchType(e.target.value as 'organisasjonsnummer')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
            />
            Søk på org.nr
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              searchType === 'navn' ? 'Skriv inn firmanavn...' : 'Skriv inn org.nr...'
            }
            className="form-control flex-1"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Søker...' : 'Søk'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-4">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((enhet) => (
            <div
              key={enhet.organisasjonsnummer}
              className="p-4 border border-slate-200 rounded-lg hover:bg-indigo-50/60 cursor-pointer transition-colors"
              onClick={() => onSelect(enhet)}
            >
              <h4 className="font-semibold text-gray-900">{enhet.navn}</h4>
              <p className="text-sm text-gray-800">Org.nr: {enhet.organisasjonsnummer}</p>
              {enhet.forretningsadresse && (
                <p className="text-sm text-gray-800">
                  {enhet.forretningsadresse.adresse?.[0]},{' '}
                  {enhet.forretningsadresse.postnummer} {enhet.forretningsadresse.poststed}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && searchQuery && !error && (
        <p className="text-gray-500 text-center py-4">Ingen resultater funnet</p>
      )}
    </div>
  );
}
