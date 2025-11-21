export interface Address {
  streetAddress: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface Organization {
  id: string;
  organizationNumber: string;
  name: string;
  address: Address;
  email?: string;
  phone?: string;
  bankAccount?: string;
  iban?: string;
  swift?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id: string;
  name: string;
  address: Address;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export type Sender = Organization | Person;
export type Receiver = Organization | Person;

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  amount: number;
  vatAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  sender: Sender;
  receiver: Receiver;
  lines: InvoiceLine[];
  currency: string;
  language: 'no' | 'en';
  subtotal: number;
  totalVat: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
  referenceNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrregEnhet {
  organisasjonsnummer: string;
  navn: string;
  organisasjonsform?: {
    kode: string;
    beskrivelse: string;
  };
  telefon?: string;
  mobiltelefon?: string;
  epost?: string;
  epostadresse?: string;
  kontaktinformasjon?: {
    telefon?: string;
    mobiltelefon?: string;
    epost?: string;
    epostadresse?: string;
  };
  hjemmeside?: string;
  postadresse?: {
    land: string;
    landkode: string;
    postnummer?: string;
    poststed?: string;
    adresse?: string[];
    kommune?: string;
    kommunenummer?: string;
  };
  forretningsadresse?: {
    land: string;
    landkode: string;
    postnummer?: string;
    poststed?: string;
    adresse?: string[];
    kommune?: string;
    kommunenummer?: string;
  };
}

export interface BrregSearchResponse {
  _embedded?: {
    enheter: BrregEnhet[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}
