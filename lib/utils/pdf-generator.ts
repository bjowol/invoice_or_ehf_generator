import { jsPDF } from 'jspdf';
import { Invoice, Organization, Person } from '@/lib/types';

const translations = {
  no: {
    invoice: 'FAKTURA',
    invoiceNumber: 'Fakturanummer',
    invoiceDate: 'Fakturadato',
    dueDate: 'Forfallsdato',
    from: 'Fra',
    to: 'Til',
    orgNr: 'Org.nr',
    description: 'Beskrivelse',
    quantity: 'Antall',
    unitPrice: 'Enhetspris',
    vatRate: 'MVA %',
    amount: 'Beløp',
    subtotal: 'Subtotal',
    vat: 'MVA',
    total: 'Totalt',
    paymentTerms: 'Betalingsbetingelser',
    reference: 'Referanse',
    notes: 'Notater',
    bankAccount: 'Kontonummer',
    iban: 'IBAN',
    swift: 'SWIFT',
  },
  en: {
    invoice: 'INVOICE',
    invoiceNumber: 'Invoice Number',
    invoiceDate: 'Invoice Date',
    dueDate: 'Due Date',
    from: 'From',
    to: 'To',
    orgNr: 'Org.no',
    description: 'Description',
    quantity: 'Qty',
    unitPrice: 'Unit Price',
    vatRate: 'VAT %',
    amount: 'Amount',
    subtotal: 'Subtotal',
    vat: 'VAT',
    total: 'Total',
    paymentTerms: 'Payment Terms',
    reference: 'Reference',
    notes: 'Notes',
    bankAccount: 'Account Number',
    iban: 'IBAN',
    swift: 'SWIFT',
  },
};

export async function generateInvoicePDF(invoice: Invoice): Promise<Uint8Array> {
  const doc = new jsPDF();
  const t = translations[invoice.language];

  let yPos = 20;

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(t.invoice, 105, yPos, { align: 'center' });
  yPos += 15;

  // Invoice Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.invoiceNumber}: ${invoice.invoiceNumber}`, 20, yPos);
  yPos += 6;
  doc.text(`${t.invoiceDate}: ${formatDate(invoice.invoiceDate)}`, 20, yPos);
  yPos += 6;
  doc.text(`${t.dueDate}: ${formatDate(invoice.dueDate)}`, 20, yPos);
  yPos += 10;

  // Save starting position for From/To sections
  const fromToStartY = yPos;

  // From Section (Left)
  doc.setFont('helvetica', 'bold');
  doc.text(t.from, 20, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.sender.name, 20, yPos);
  yPos += 5;
  if ('organizationNumber' in invoice.sender) {
    doc.text(`${t.orgNr}: ${invoice.sender.organizationNumber}`, 20, yPos);
    yPos += 5;
  }
  doc.text(invoice.sender.address.streetAddress, 20, yPos);
  yPos += 5;
  doc.text(
    `${invoice.sender.address.postalCode} ${invoice.sender.address.city}`,
    20,
    yPos
  );
  yPos += 5;
  doc.text(invoice.sender.address.country, 20, yPos);
  yPos += 5;
  if (invoice.sender.email) {
    doc.text(invoice.sender.email, 20, yPos);
    yPos += 5;
  }
  if (invoice.sender.phone) {
    doc.text(invoice.sender.phone, 20, yPos);
    yPos += 5;
  }

  // To Section (Right) - starts at same Y position as From
  let toYPos = fromToStartY;
  doc.setFont('helvetica', 'bold');
  doc.text(t.to, 110, toYPos);
  toYPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.receiver.name, 110, toYPos);
  toYPos += 5;
  if ('organizationNumber' in invoice.receiver) {
    doc.text(`${t.orgNr}: ${invoice.receiver.organizationNumber}`, 110, toYPos);
    toYPos += 5;
  }
  doc.text(invoice.receiver.address.streetAddress, 110, toYPos);
  toYPos += 5;
  doc.text(
    `${invoice.receiver.address.postalCode} ${invoice.receiver.address.city}`,
    110,
    toYPos
  );
  toYPos += 5;
  doc.text(invoice.receiver.address.country, 110, toYPos);

  // Continue from whichever section is longer
  yPos = Math.max(yPos, toYPos);
  yPos += 5;

  // Payment Terms and Reference
  if (invoice.paymentTerms) {
    doc.text(`${t.paymentTerms}: ${invoice.paymentTerms}`, 20, yPos);
    yPos += 6;
  }
  if (invoice.referenceNumber) {
    doc.text(`${t.reference}: ${invoice.referenceNumber}`, 20, yPos);
    yPos += 6;
  }
  yPos += 5;

  // Invoice Lines Table
  const tableStartY = yPos;

  // Table Header
  doc.setFillColor(64, 64, 64); // Dark grey
  doc.rect(20, yPos, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(t.description, 22, yPos + 5);
  doc.text(t.quantity, 110, yPos + 5, { align: 'right' });
  doc.text(t.unitPrice, 135, yPos + 5, { align: 'right' });
  doc.text(t.vatRate, 160, yPos + 5, { align: 'right' });
  doc.text(t.amount, 188, yPos + 5, { align: 'right' });
  yPos += 8;

  // Table Rows
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  invoice.lines.forEach((line, index) => {
    const bgColor = index % 2 === 0 ? 249 : 255;
    doc.setFillColor(bgColor, bgColor, bgColor);
    // Wrap long descriptions and size row background to content
    const descLines = doc.splitTextToSize(line.description, 85);
    const lineHeight = 7;
    const cellHeight = Math.max(lineHeight, descLines.length * 5);
    doc.rect(20, yPos, 170, cellHeight, 'F');

    doc.text(descLines, 22, yPos + 5);
    doc.text(line.quantity.toString(), 110, yPos + 5, { align: 'right' });
    doc.text(line.unitPrice.toFixed(2), 135, yPos + 5, { align: 'right' });
    doc.text(`${line.vatRate}%`, 160, yPos + 5, { align: 'right' });
    doc.text(line.amount.toFixed(2), 188, yPos + 5, { align: 'right' });

    yPos += cellHeight;

    // Check if we need a new page
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });

  yPos += 5;

  // Totals
  const totalsX = 145;
  // clear any row shading behind totals block
  doc.setFillColor(255, 255, 255);
  doc.rect(120, yPos - 4, 70, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.text(t.subtotal, totalsX, yPos, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${invoice.subtotal.toFixed(2)} ${invoice.currency}`,
    188,
    yPos,
    { align: 'right' }
  );
  yPos += 6;

  doc.setFont('helvetica', 'bold');
  doc.text(t.vat, totalsX, yPos, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${invoice.totalVat.toFixed(2)} ${invoice.currency}`,
    188,
    yPos,
    { align: 'right' }
  );
  yPos += 8;

  // Total line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  const lineY = yPos + 2;
  doc.line(120, lineY, 190, lineY);
  yPos += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t.total, totalsX, yPos, { align: 'right' });
  doc.text(
    `${invoice.total.toFixed(2)} ${invoice.currency}`,
    188,
    yPos,
    { align: 'right' }
  );
  yPos += 10;

  // Bank Details (if sender is organization)
  if ('organizationNumber' in invoice.sender) {
    const org = invoice.sender as Organization;
    if (org.bankAccount || org.iban || org.swift) {
      yPos += 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      if (org.bankAccount) {
        doc.text(`${t.bankAccount}: `, 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(org.bankAccount, 60, yPos);
        yPos += 5;
      }
      if (org.iban) {
        doc.setFont('helvetica', 'bold');
        doc.text(`${t.iban}: `, 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(org.iban, 60, yPos);
        yPos += 5;
      }
      if (org.swift) {
        doc.setFont('helvetica', 'bold');
        doc.text(`${t.swift}: `, 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(org.swift, 60, yPos);
        yPos += 5;
      }
    }
  }

  // Notes
  if (invoice.notes) {
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(t.notes, 20, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(invoice.notes, 170);
    doc.text(noteLines, 20, yPos);
  }

  return doc.output('arraybuffer') as unknown as Uint8Array;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('no-NO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
