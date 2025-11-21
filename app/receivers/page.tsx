'use client';

import { useState, useEffect } from 'react';
import { Organization, Person, BrregEnhet } from '@/lib/types';
import OrganizationForm from '@/components/OrganizationForm';
import PersonForm from '@/components/PersonForm';
import BrregSearch from '@/components/BrregSearch';
import { storage } from '@/lib/utils/clientStorage';

type Receiver = Organization | Person;

export default function ReceiversPage() {
  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReceiver, setEditingReceiver] = useState<Receiver | null>(null);
  const [receiverType, setReceiverType] = useState<'organization' | 'person'>('organization');
  const [showBrregSearch, setShowBrregSearch] = useState(false);

  useEffect(() => {
    fetchReceivers();
  }, []);

  async function fetchReceivers() {
    setReceivers(storage.getReceivers());
  }

  async function handleDelete(id: string) {
    if (!confirm('Er du sikker på at du vil slette denne mottakeren?')) return;

    storage.deleteReceiver(id);
    fetchReceivers();
  }

  function handleEdit(receiver: Receiver) {
    setEditingReceiver(receiver);
    setReceiverType('organizationNumber' in receiver ? 'organization' : 'person');
    setIsFormOpen(true);
    setShowBrregSearch(false);
  }

  function handleNewReceiver() {
    setEditingReceiver(null);
    setIsFormOpen(true);
    setShowBrregSearch(false);
  }

  async function handleImportFromBrreg(enhet: BrregEnhet) {
    let enriched = enhet;
    try {
      const baseUrl = `https://data.brreg.no/enhetsregisteret/api/enheter/${enhet.organisasjonsnummer}`;
      const detailRes = await fetch(baseUrl);
      if (detailRes.ok) {
        enriched = await detailRes.json();
      }
      const contactRes = await fetch(`${baseUrl}/kontaktinformasjon`);
      if (contactRes.ok) {
        const contact = await contactRes.json();
        enriched = {
          ...enriched,
          kontaktinformasjon: {
            ...(enriched as any).kontaktinformasjon,
            telefon: contact.telefon || contact.telefonnummer,
            mobiltelefon: contact.mobiltelefon || contact.mobil,
            epost: contact.epost || contact.epostadresse,
            epostadresse: contact.epostadresse || contact.epost,
          },
        } as BrregEnhet;
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
    setEditingReceiver(organization as Organization);
    setReceiverType('organization');
    setShowBrregSearch(false);
    setIsFormOpen(true);
  }

  async function handleSubmit(receiver: Receiver) {
    const now = new Date().toISOString();
    const receiverWithMeta = {
      ...receiver,
      id:
        editingReceiver && 'id' in editingReceiver
          ? editingReceiver.id
          : crypto.randomUUID(),
      createdAt:
        editingReceiver && 'createdAt' in editingReceiver
          ? editingReceiver.createdAt
          : now,
      updatedAt: now,
    } as Receiver;

    storage.saveReceiver(receiverWithMeta);
    setIsFormOpen(false);
    setEditingReceiver(null);
    fetchReceivers();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Mottakere</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowBrregSearch(!showBrregSearch)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            {showBrregSearch ? 'Skjul søk' : 'Importer fra Brreg'}
          </button>
          <button
            onClick={handleNewReceiver}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            + Ny Mottaker
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
              {editingReceiver && 'id' in editingReceiver ? 'Rediger' : 'Ny'} Mottaker
            </h2>
            <button
              onClick={() => {
                setIsFormOpen(false);
                setEditingReceiver(null);
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
                checked={receiverType === 'organization'}
                onChange={(e) => setReceiverType(e.target.value as 'organization')}
                className="mr-2"
              />
              Organisasjon
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="person"
                checked={receiverType === 'person'}
                onChange={(e) => setReceiverType(e.target.value as 'person')}
                className="mr-2"
              />
              Person
            </label>
          </div>

          {receiverType === 'organization' ? (
            <OrganizationForm
              organization={editingReceiver as Organization}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingReceiver(null);
              }}
            />
          ) : (
            <PersonForm
              person={editingReceiver as Person}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingReceiver(null);
              }}
            />
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {receivers.map((receiver) => (
          <div
            key={receiver.id}
            className="p-4 bg-white rounded-lg shadow-md border-2 border-gray-300 hover:shadow-lg transition-shadow flex flex-col h-full"
          >
            <h3 className="font-semibold text-lg mb-2 text-gray-900">{receiver.name}</h3>
            {'organizationNumber' in receiver && (
              <p className="text-sm text-gray-800 mb-2">
                Org.nr: {receiver.organizationNumber}
              </p>
            )}
            <p className="text-sm text-gray-800 mb-2">
              {receiver.address.streetAddress}
              <br />
              {receiver.address.postalCode} {receiver.address.city}
            </p>
            {receiver.email && (
              <p className="text-sm text-gray-800 mb-2">📧 {receiver.email}</p>
            )}
            {receiver.phone && (
              <p className="text-sm text-gray-800 mb-4">📞 {receiver.phone}</p>
            )}
            <div className="flex gap-2 mt-auto pt-2">
              <button
                onClick={() => handleEdit(receiver)}
                className="flex-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Rediger
              </button>
              <button
                onClick={() => handleDelete(receiver.id)}
                className="flex-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Slett
              </button>
            </div>
          </div>
        ))}
      </div>

      {receivers.length === 0 && !isFormOpen && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-4">Ingen mottakere ennå</p>
          <p className="text-sm">
            Klikk på "Ny Mottaker" eller "Importer fra Brreg" for å komme i gang
          </p>
        </div>
      )}
    </div>
  );
}
