import { Invoice, Organization, Person } from '@/lib/types';

// Generate a minimal Peppol BIS Billing 3.0 (UBL 2.1) invoice XML
export function generateEHF(invoice: Invoice): string {
  const lines: string[] = [];

  const currency = invoice.currency || 'NOK';
  const formatAmount = (value: number) => Number(value).toFixed(2);
  const countryCode = (value?: string) => {
    if (!value) return 'NO';
    const trimmed = value.trim().toUpperCase();
    return trimmed.length === 2 ? trimmed : 'NO';
  };
  const escape = (value?: string) =>
    (value ?? '').replace(/[<>&'"]/g, (c) => ({
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      "'": '&apos;',
      '"': '&quot;',
    }[c] as string));

  const partyIdentifiers = (party: Organization | Person) => {
    if ('organizationNumber' in party) {
      return `<cbc:EndpointID schemeID="0192">${escape(party.organizationNumber)}</cbc:EndpointID>
        <cac:PartyIdentification>
          <cbc:ID schemeID="0192">${escape(party.organizationNumber)}</cbc:ID>
        </cac:PartyIdentification>
        <cac:PartyLegalEntity>
          <cbc:RegistrationName>${escape(party.name)}</cbc:RegistrationName>
          <cbc:CompanyID schemeID="0192">${escape(party.organizationNumber)}</cbc:CompanyID>
        </cac:PartyLegalEntity>`;
    }
    return `<cbc:EndpointID schemeID="ZZZ">${escape(party.name)}</cbc:EndpointID>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escape(party.name)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>`;
  };

  const partyBlock = (label: 'Supplier' | 'Customer', party: Organization | Person) => `
    <cac:Accounting${label}Party>
      <cac:Party>
        ${partyIdentifiers(party)}
        <cac:PostalAddress>
          <cbc:StreetName>${escape(party.address.streetAddress)}</cbc:StreetName>
          <cbc:CityName>${escape(party.address.city)}</cbc:CityName>
          <cbc:PostalZone>${escape(party.address.postalCode)}</cbc:PostalZone>
          <cbc:CountrySubentity>${escape(party.address.city)}</cbc:CountrySubentity>
          <cac:Country>
            <cbc:IdentificationCode>${escape(countryCode(party.address.country))}</cbc:IdentificationCode>
          </cac:Country>
        </cac:PostalAddress>
        ${party.email ? `<cbc:ElectronicMail>${escape(party.email)}</cbc:ElectronicMail>` : ''}
        ${party.phone ? `<cbc:Telephone>${escape(party.phone)}</cbc:Telephone>` : ''}
      </cac:Party>
    </cac:Accounting${label}Party>`;

  const taxTotal = invoice.totalVat || 0;

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push(
    `<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
      xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
      xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">`
  );
  lines.push('<cbc:CustomizationID>urn:peppol.eu:bis:billing:3</cbc:CustomizationID>');
  lines.push('<cbc:ProfileID>urn:peppol.eu:profile:billing:01</cbc:ProfileID>');
  lines.push(`<cbc:ID>${escape(invoice.invoiceNumber)}</cbc:ID>`);
  lines.push('<cbc:InvoiceTypeCode listID="UNCL1001">380</cbc:InvoiceTypeCode>');
  lines.push(`<cbc:IssueDate>${escape(invoice.invoiceDate)}</cbc:IssueDate>`);
  lines.push(`<cbc:DueDate>${escape(invoice.dueDate)}</cbc:DueDate>`);
  if (invoice.referenceNumber) {
    lines.push(`<cbc:BuyerReference>${escape(invoice.referenceNumber)}</cbc:BuyerReference>`);
  }
  lines.push(`<cbc:DocumentCurrencyCode>${escape(currency)}</cbc:DocumentCurrencyCode>`);

  lines.push(partyBlock('Supplier', invoice.sender));
  lines.push(partyBlock('Customer', invoice.receiver));

  // Payment means (basic bank account if present)
  if ('organizationNumber' in invoice.sender) {
    const org = invoice.sender as Organization;
    if (org.bankAccount || org.iban) {
      lines.push(`<cac:PaymentMeans>
        <cbc:PaymentMeansCode>31</cbc:PaymentMeansCode>
        ${org.bankAccount ? `<cbc:PaymentID>${escape(org.bankAccount)}</cbc:PaymentID>` : ''}
        <cac:PayeeFinancialAccount>
          <cbc:ID>${escape(org.iban || org.bankAccount || '')}</cbc:ID>
        </cac:PayeeFinancialAccount>
      </cac:PaymentMeans>`);
    }
  }

  // Tax total
  lines.push(`<cac:TaxTotal>
    <cbc:TaxAmount currencyID="${escape(currency)}">${formatAmount(taxTotal)}</cbc:TaxAmount>
    ${
      invoice.totalVat > 0
        ? `<cac:TaxSubtotal>
            <cbc:TaxableAmount currencyID="${escape(currency)}">${formatAmount(invoice.subtotal)}</cbc:TaxableAmount>
            <cbc:TaxAmount currencyID="${escape(currency)}">${formatAmount(taxTotal)}</cbc:TaxAmount>
            <cac:TaxCategory>
              <cbc:ID>S</cbc:ID>
              <cbc:Percent>${formatAmount(
                invoice.lines.find((l) => l.vatRate)?.vatRate || 0
              )}</cbc:Percent>
              <cac:TaxScheme>
                <cbc:ID>VAT</cbc:ID>
              </cac:TaxScheme>
            </cac:TaxCategory>
          </cac:TaxSubtotal>`
        : ''
    }
  </cac:TaxTotal>`);

  // Monetary totals
  lines.push(`<cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${escape(currency)}">${formatAmount(invoice.subtotal)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${escape(currency)}">${formatAmount(invoice.subtotal)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${escape(currency)}">${formatAmount(invoice.total)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${escape(currency)}">${formatAmount(invoice.total)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>`);

  // Invoice lines
  invoice.lines.forEach((line, idx) => {
    const lineExtension = line.amount;
    lines.push(`<cac:InvoiceLine>
      <cbc:ID>${idx + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="C62">${formatAmount(line.quantity)}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="${escape(currency)}">${formatAmount(lineExtension)}</cbc:LineExtensionAmount>
      <cac:Item>
        <cbc:Description>${escape(line.description)}</cbc:Description>
        <cac:ClassifiedTaxCategory>
          <cbc:ID>S</cbc:ID>
          <cbc:Percent>${formatAmount(line.vatRate)}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>VAT</cbc:ID>
          </cac:TaxScheme>
        </cac:ClassifiedTaxCategory>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="${escape(currency)}">${formatAmount(line.unitPrice)}</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>`);
  });

  lines.push('</Invoice>');
  return lines.join('\n');
}
