'use client';

import { useState, useEffect } from 'react';
import { Organization, Person, BrregEnhet, BrregSearchResponse } from '@/lib/types';
import OrganizationForm from '@/components/OrganizationForm';
import PersonForm from '@/components/PersonForm';
import BrregSearch from '@/components/BrregSearch';

type Sender = Organization | Person;

export default function SendersPage() {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSender, setEditingSender] = useState<Sender | null>(null);
  const [senderType, setSenderType] = useState<'organization' | 'person'>('organization');
  const [showBrregSearch, setShowBrregSearch] = useState(false);

  useEffect(() => {
    fetchSenders();
  }, []);

  async function fetchSenders() {
    const response = await fetch('/api/senders');
    const data = await response.json();
    setSenders(data);
  }

  async function handleDelete(id: string) {
    if (!confirm('Er du sikker på at du vil slette denne avsenderen?')) return;

    await fetch(`/api/senders/${id}`, { method: 'DELETE' });
    fetchSenders();
  }

  function handleEdit(sender: Sender) {
    setEditingSender(sender);
    setSenderType('organizationNumber' in sender ? 'organization' : 'person');
    setIsFormOpen(true);
    setShowBrregSearch(false);
  }

  function handleNewSender() {
    setEditingSender(null);
    setIsFormOpen(true);
    setShowBrregSearch(false);
  }

  async function handleImportFromBrreg(enhet: BrregEnhet) {
    let enriched = enhet;
    try {
      const detailRes = await fetch(`/api/enheter/${enhet.organisasjonsnummer}`);
      if (detailRes.ok) {
        enriched = await detailRes.json();
      }
    } catch (error) {
      console.warn('Kunne ikke hente detaljer fra Brreg', error);
    }

    const organization: Partial<Organization> = {
      organizationNumber: enriched.organisasjonsnummer,
      name: enriched.navn,
      address: {
        streetAddress: enriched.forretningsadresse?.adresse?.[0] || '',
        postalCode: enriched.forretningsadresse?.postnummer || '',
        city: enriched.forretningsadresse?.poststed || '',
        country: enriched.forretningsadresse?.land || 'Norge',
      },
      email:
        enriched.kontaktinformasjon?.epost ||
        enriched.epost ||
        enriched.epostadresse,
      phone:
        enriched.kontaktinformasjon?.mobiltelefon ||
        enriched.kontaktinformasjon?.telefon ||
        enriched.mobiltelefon ||
        enriched.telefon,
    };
    setEditingSender(organization as Organization);
    setSenderType('organization');
    setShowBrregSearch(false);
    setIsFormOpen(true);
  }

  async function handleSubmit(sender: Sender) {
    if (editingSender && 'id' in editingSender) {
      await fetch(`/api/senders/${editingSender.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sender),
      });
    } else {
      await fetch('/api/senders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sender),
      });
    }
    setIsFormOpen(false);
    setEditingSender(null);
    fetchSenders();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Avsendere</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowBrregSearch(!showBrregSearch)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            {showBrregSearch ? 'Skjul søk' : 'Importer fra Brreg'}
          </button>
          <button
            onClick={handleNewSender}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            + Ny Avsender
          </button>
        </div>
      </div>

      {showBrregSearch && (
        <div className="mb-6">
          <BrregSearch onSelect={handleImportFromBrreg} />
        </div>
      )}

      {isFormOpen && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-md border-2 border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingSender && 'id' in editingSender ? 'Rediger' : 'Ny'} Avsender
            </h2>
            <button
              onClick={() => {
                setIsFormOpen(false);
                setEditingSender(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <label className="inline-flex items-center mr-6">
              <input
                type="radio"
                value="organization"
                checked={senderType === 'organization'}
                onChange={(e) => setSenderType(e.target.value as 'organization')}
                className="mr-2"
              />
              Organisasjon
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="person"
                checked={senderType === 'person'}
                onChange={(e) => setSenderType(e.target.value as 'person')}
                className="mr-2"
              />
              Person
            </label>
          </div>

          {senderType === 'organization' ? (
            <OrganizationForm
              organization={editingSender as Organization}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingSender(null);
              }}
            />
          ) : (
            <PersonForm
              person={editingSender as Person}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingSender(null);
              }}
            />
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {senders.map((sender) => (
          <div
            key={sender.id}
            className="p-4 bg-white rounded-lg shadow-md border-2 border-gray-300 hover:shadow-lg transition-shadow flex flex-col h-full"
          >
            <h3 className="font-semibold text-lg mb-2 text-gray-900">{sender.name}</h3>
            {'organizationNumber' in sender && (
              <p className="text-sm text-gray-800 mb-2">
                Org.nr: {sender.organizationNumber}
              </p>
            )}
            <p className="text-sm text-gray-800 mb-2">
              {sender.address.streetAddress}
              <br />
              {sender.address.postalCode} {sender.address.city}
            </p>
            {sender.email && (
              <p className="text-sm text-gray-800 mb-2">📧 {sender.email}</p>
            )}
            {sender.phone && (
              <p className="text-sm text-gray-800 mb-4">📞 {sender.phone}</p>
            )}
            <div className="flex gap-2 mt-auto pt-2">
              <button
                onClick={() => handleEdit(sender)}
                className="flex-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Rediger
              </button>
              <button
                onClick={() => handleDelete(sender.id)}
                className="flex-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Slett
              </button>
            </div>
          </div>
        ))}
      </div>

      {senders.length === 0 && !isFormOpen && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-4">Ingen avsendere ennå</p>
          <p className="text-sm">
            Klikk på "Ny Avsender" eller "Importer fra Brreg" for å komme i gang
          </p>
        </div>
      )}
    </div>
  );
}
