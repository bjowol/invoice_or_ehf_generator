'use client';

import { useState, useEffect } from 'react';
import { Person } from '@/lib/types';

interface PersonFormProps {
  person?: Partial<Person> | null;
  onSubmit: (person: Person) => void;
  onCancel: () => void;
}

export default function PersonForm({
  person,
  onSubmit,
  onCancel,
}: PersonFormProps) {
  const [formData, setFormData] = useState<Partial<Person>>({
    name: '',
    address: {
      streetAddress: '',
      postalCode: '',
      city: '',
      country: 'Norge',
    },
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (person) {
      setFormData({
        ...formData,
        ...person,
        address: {
          ...formData.address,
          ...person.address,
        },
      });
    }
  }, [person]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(formData as Person);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Navn *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          placeholder="Ola Nordmann"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Gateadresse *</label>
        <input
          type="text"
          required
          value={formData.address?.streetAddress}
          onChange={(e) =>
            setFormData({
              ...formData,
              address: { ...formData.address!, streetAddress: e.target.value },
            })
          }
          className="w-full px-3 py-2 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          placeholder="Storgata 1"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900">Postnummer *</label>
          <input
            type="text"
            required
            value={formData.address?.postalCode}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: { ...formData.address!, postalCode: e.target.value },
              })
            }
            className="w-full px-3 py-2 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            placeholder="0001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900">Poststed *</label>
          <input
            type="text"
            required
            value={formData.address?.city}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: { ...formData.address!, city: e.target.value },
              })
            }
            className="w-full px-3 py-2 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            placeholder="Oslo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900">Land *</label>
          <input
            type="text"
            required
            value={formData.address?.country}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: { ...formData.address!, country: e.target.value },
              })
            }
            className="w-full px-3 py-2 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            placeholder="Norge"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900">E-post</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            placeholder="ola@nordmann.no"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900">Telefon</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            placeholder="+47 123 45 678"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Lagre
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}
