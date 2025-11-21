import { Invoice, Organization, Person } from '@/lib/types';

type Storable = Organization | Person | Invoice;
type CollectionKey = 'senders' | 'receivers' | 'invoices';

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function getCollection<T extends Storable>(key: CollectionKey): T[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(key);
  return safeParse<T[]>(raw, []);
}

function setCollection<T extends Storable>(key: CollectionKey, value: T[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function upsert<T extends Storable & { id: string }>(
  key: CollectionKey,
  item: T
): T {
  const items = getCollection<T>(key);
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx >= 0) {
    items[idx] = item;
  } else {
    items.push(item);
  }
  setCollection(key, items);
  return item;
}

function remove(key: CollectionKey, id: string) {
  const items = getCollection<Storable & { id: string }>(key);
  setCollection(key, items.filter((item) => item.id !== id));
}

export const storage = {
  getSenders: () => getCollection<Organization | Person>('senders'),
  saveSender: (sender: Organization | Person) => upsert('senders', sender),
  deleteSender: (id: string) => remove('senders', id),
  getReceivers: () => getCollection<Organization | Person>('receivers'),
  saveReceiver: (receiver: Organization | Person) => upsert('receivers', receiver),
  deleteReceiver: (id: string) => remove('receivers', id),
  getInvoices: () => getCollection<Invoice>('invoices'),
  saveInvoice: (invoice: Invoice) => upsert('invoices', invoice),
  deleteInvoice: (id: string) => remove('invoices', id),
};
