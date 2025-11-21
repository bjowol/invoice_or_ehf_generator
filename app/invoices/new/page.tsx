'use client';

import { useState, useEffect } from 'react';
import { Organization, Person, Invoice, InvoiceLine } from '@/lib/types';
import { storage } from '@/lib/utils/clientStorage';
import { generateInvoicePDF } from '@/lib/utils/pdf-generator';
import { generateEHF } from '@/lib/utils/ehf-generator';

type Sender = Organization | Person;
type Receiver = Organization | Person;

export default function NewInvoicePage() {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [selectedSender, setSelectedSender] = useState<string>('');
  const [selectedReceiver, setSelectedReceiver] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [currency, setCurrency] = useState('NOK');
  const [language, setLanguage] = useState<'no' | 'en'>('no');
  const [notes, setNotes] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Netto 30 dager');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [lines, setLines] = useState<InvoiceLine[]>([
    {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      vatRate: 25,
      amount: 0,
      vatAmount: 0,
    },
  ]);
  const [generating, setGenerating] = useState(false);
  const [generatingEHF, setGeneratingEHF] = useState(false);

  useEffect(() => {
    fetchSendersAndReceivers();
  }, []);

  async function fetchSendersAndReceivers() {
    setSenders(storage.getSenders());
    setReceivers(storage.getReceivers());
  }

  function addLine() {
    setLines([
      ...lines,
      {
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        vatRate: 25,
        amount: 0,
        vatAmount: 0,
      },
    ]);
  }

  function removeLine(id: string) {
    if (lines.length === 1) return;
    setLines(lines.filter((line) => line.id !== id));
  }

  function updateLine(id: string, updates: Partial<InvoiceLine>) {
    setLines(
      lines.map((line) => {
        if (line.id !== id) return line;
        const updatedLine = { ...line, ...updates };
        const amount = updatedLine.quantity * updatedLine.unitPrice;
        const vatAmount = amount * (updatedLine.vatRate / 100);
        return {
          ...updatedLine,
          amount,
          vatAmount,
        };
      })
    );
  }

  function handleArrowStep(
    e: React.KeyboardEvent<HTMLInputElement>,
    id: string,
    field: 'quantity' | 'unitPrice'
  ) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const target = lines.find((line) => line.id === id);
    if (!target) return;
    const currentValue = target[field] || 0;
    const delta = e.key === 'ArrowUp' ? 1 : -1;
    const nextValue = Math.max(0, currentValue + delta);
    updateLine(id, { [field]: parseFloat(nextValue.toFixed(2)) });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const totalVat = lines.reduce((sum, line) => sum + line.vatAmount, 0);
  const total = subtotal + totalVat;

  async function handleGeneratePDF() {
    if (!selectedSender || !selectedReceiver || !invoiceNumber) {
      alert('Vennligst fyll ut alle obligatoriske felt');
      return;
    }

    setGenerating(true);

    try {
      const sender = senders.find((s) => s.id === selectedSender);
      const receiver = receivers.find((r) => r.id === selectedReceiver);

      if (!sender || !receiver) {
        throw new Error('Avsender eller mottaker ikke funnet');
      }

      const invoice: Invoice = {
        id: crypto.randomUUID(),
        invoiceNumber,
        invoiceDate,
        dueDate,
        sender,
        receiver,
        lines,
        currency,
        language,
        subtotal,
        totalVat,
        total,
        notes,
        paymentTerms,
        referenceNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      storage.saveInvoice(invoice);

      const pdfBytes = await generateInvoicePDF(invoice);
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
        type: 'application/pdf',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Faktura-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('PDF generert og lastet ned!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Kunne ikke generere PDF. Vennligst prøv igjen.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateEHF() {
    if (!selectedSender || !selectedReceiver || !invoiceNumber) {
      alert('Vennligst fyll ut alle obligatoriske felt');
      return;
    }

    setGeneratingEHF(true);
    try {
      const sender = senders.find((s) => s.id === selectedSender);
      const receiver = receivers.find((r) => r.id === selectedReceiver);

      if (!sender || !receiver) {
        throw new Error('Avsender eller mottaker ikke funnet');
      }

      const invoice: Invoice = {
        id: crypto.randomUUID(),
        invoiceNumber,
        invoiceDate,
        dueDate,
        sender,
        receiver,
        lines,
        currency,
        language,
        subtotal,
        totalVat,
        total,
        notes,
        paymentTerms,
        referenceNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      storage.saveInvoice(invoice);

      const xml = generateEHF(invoice);
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Faktura-${invoiceNumber}.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('EHF XML generert og lastet ned!');
    } catch (error) {
      console.error('Error generating EHF:', error);
      alert('Kunne ikke generere EHF. Vennligst prøv igjen.');
    } finally {
      setGeneratingEHF(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Ny Faktura</h1>

      <div className="space-y-6">
        {/* Sender and Receiver Selection */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 card">
            <h2 className="section-title">Avsender *</h2>
            {senders.length === 0 ? (
              <p className="text-gray-800 text-sm">
                Ingen avsendere funnet. Legg til en avsender først.
              </p>
            ) : (
              <select
                value={selectedSender}
                onChange={(e) => setSelectedSender(e.target.value)}
                className="form-control"
                required
              >
                <option value="">Velg avsender...</option>
                {senders.map((sender) => (
                  <option key={sender.id} value={sender.id}>
                    {sender.name}
                    {'organizationNumber' in sender && ` (${sender.organizationNumber})`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="p-5 card">
            <h2 className="section-title">Mottaker *</h2>
            {receivers.length === 0 ? (
              <p className="text-gray-800 text-sm">
                Ingen mottakere funnet. Legg til en mottaker først.
              </p>
            ) : (
              <select
                value={selectedReceiver}
                onChange={(e) => setSelectedReceiver(e.target.value)}
                className="form-control"
                required
              >
                <option value="">Velg mottaker...</option>
                {receivers.map((receiver) => (
                  <option key={receiver.id} value={receiver.id}>
                    {receiver.name}
                    {'organizationNumber' in receiver && ` (${receiver.organizationNumber})`}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="p-5 card">
          <h2 className="section-title">Fakturadetaljer</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="form-label">
                Fakturanummer *
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="form-control"
                placeholder={new Date().getFullYear() + "-001"}
                required
              />
            </div>

            <div>
              <label className="form-label">
                Fakturadato *
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="form-control"
                required
              />
            </div>

            <div>
              <label className="form-label">
                Forfallsdato *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Valuta</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="form-control"
              >
                <option value="NOK">NOK</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div>
              <label className="form-label">Språk</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'no' | 'en')}
                className="form-control"
              >
                <option value="no">Norsk</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="form-label">
                Betalingsbetingelser
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="form-control"
                placeholder="Netto 14 dager"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="form-label">
              Referansenummer
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="form-control"
              placeholder="Referanse"
            />
          </div>
        </div>

        {/* Invoice Lines */}
        <div className="p-5 card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="section-title mb-0">Fakturalinjer</h2>
            <button
              onClick={addLine}
              className="btn btn-primary text-sm"
            >
              + Legg til linje
            </button>
          </div>

          <div className="space-y-4">
            {lines.map((line, index) => (
              <div
                key={line.id}
                className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900">Linje {index + 1}</span>
                  {lines.length > 1 && (
                    <button
                      onClick={() => removeLine(line.id)}
                      className="btn btn-ghost text-sm text-red-600 hover:text-red-700 p-0"
                    >
                      Fjern
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-5 gap-2">
                  <div className="md:col-span-2">
                    <label className="form-label">
                      Beskrivelse *
                    </label>
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) =>
                        updateLine(line.id, { description: e.target.value })
                      }
                      className="form-control"
                      placeholder="Beskrivelse av vare/tjeneste"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      Antall *
                    </label>
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(line.id, {
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                      onKeyDown={(e) => handleArrowStep(e, line.id, 'quantity')}
                      className="form-control"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      Enhetspris *
                    </label>
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={line.unitPrice}
                      onChange={(e) =>
                        updateLine(line.id, {
                          unitPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      onKeyDown={(e) => handleArrowStep(e, line.id, 'unitPrice')}
                      className="form-control"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      MVA % *
                    </label>
                    <select
                      value={line.vatRate}
                      onChange={(e) =>
                        updateLine(line.id, {
                          vatRate: parseFloat(e.target.value),
                        })
                      }
                      className="form-control"
                    >
                      <option value="0">0%</option>
                      <option value="15">15%</option>
                      <option value="25">25%</option>
                    </select>
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-800 font-medium">
                  Beløp: {line.amount.toFixed(2)} {currency} | MVA:{' '}
                  {line.vatAmount.toFixed(2)} {currency} | Totalt:{' '}
                  {(line.amount + line.vatAmount).toFixed(2)} {currency}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="grid md:grid-cols-3 gap-4 text-right text-slate-900">
              <div className="md:col-span-2 font-semibold">Subtotal:</div>
              <div className="font-semibold">
                {subtotal.toFixed(2)} {currency}
              </div>

              <div className="md:col-span-2 font-semibold">Total MVA:</div>
              <div className="font-semibold">
                {totalVat.toFixed(2)} {currency}
              </div>

              <div className="md:col-span-2 text-lg font-bold">
                Totalt å betale:
              </div>
              <div className="text-lg font-bold">
                {total.toFixed(2)} {currency}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="p-5 card">
          <h2 className="section-title">Notater</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-control"
            rows={4}
            placeholder="Tilleggsnotater..."
          />
        </div>

        {/* Generate Button */}
        <div className="flex flex-wrap justify-end gap-3">
          <button
            onClick={handleGeneratePDF}
            disabled={generating || !selectedSender || !selectedReceiver || !invoiceNumber}
            className="btn btn-primary px-6 py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? 'Genererer PDF...' : 'Generer og Last ned PDF'}
          </button>
          <button
            onClick={handleGenerateEHF}
            disabled={generatingEHF || !selectedSender || !selectedReceiver || !invoiceNumber}
            className="btn btn-secondary px-6 py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingEHF ? 'Genererer EHF...' : 'Generer og Last ned EHF (XML)'}
          </button>
        </div>
      </div>
    </div>
  );
}
