'use client';

import { useState, useEffect } from 'react';
import { Organization } from '@/lib/types';

interface OrganizationFormProps {
  organization?: Partial<Organization> | null;
  onSubmit: (organization: Organization) => void;
  onCancel: () => void;
}

export default function OrganizationForm({
  organization,
  onSubmit,
  onCancel,
}: OrganizationFormProps) {
  const [formData, setFormData] = useState<Partial<Organization>>({
    organizationNumber: '',
    name: '',
    address: {
      streetAddress: '',
      postalCode: '',
      city: '',
      country: 'Norge',
    },
    email: '',
    phone: '',
    bankAccount: '',
    iban: '',
    swift: '',
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        ...formData,
        ...organization,
        address: {
          streetAddress: organization.address?.streetAddress || formData.address?.streetAddress || '',
          postalCode: organization.address?.postalCode || formData.address?.postalCode || '',
          city: organization.address?.city || formData.address?.city || '',
          country: organization.address?.country || formData.address?.country || 'Norge',
        },
      });
    }
  }, [organization]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(formData as Organization);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">
            Organisasjonsnummer *
          </label>
          <input
            type="text"
            required
            value={formData.organizationNumber}
            onChange={(e) =>
              setFormData({ ...formData, organizationNumber: e.target.value })
            }
            className="form-control"
            placeholder="999999999"
          />
        </div>

        <div>
          <label className="form-label">Navn *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-control"
            placeholder="Firmanavn AS"
          />
        </div>
      </div>

      <div>
        <label className="form-label">Gateadresse *</label>
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
          className="form-control"
          placeholder="Storgata 1"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="form-label">Postnummer *</label>
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
            className="form-control"
            placeholder="0001"
          />
        </div>

        <div>
          <label className="form-label">Poststed *</label>
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
            className="form-control"
            placeholder="Oslo"
          />
        </div>

        <div>
          <label className="form-label">Land *</label>
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
            className="form-control"
            placeholder="Norge"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">E-post</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-control"
            placeholder="post@firma.no"
          />
        </div>

        <div>
          <label className="form-label">Telefon</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="form-control"
            placeholder="+47 123 45 678"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="form-label">Kontonummer</label>
          <input
            type="text"
            value={formData.bankAccount}
            onChange={(e) =>
              setFormData({ ...formData, bankAccount: e.target.value })
            }
            className="form-control"
            placeholder="1234.56.78901"
          />
        </div>

        <div>
          <label className="form-label">IBAN</label>
          <input
            type="text"
            value={formData.iban}
            onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
            className="form-control"
            placeholder="NO93 8601 1117 947"
          />
        </div>

        <div>
          <label className="form-label">SWIFT/BIC</label>
          <input
            type="text"
            value={formData.swift}
            onChange={(e) => setFormData({ ...formData, swift: e.target.value })}
            className="form-control"
            placeholder="DNBANOKKXXX"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="btn btn-primary flex-1"
        >
          Lagre
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary flex-1"
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}
