import fs from 'fs';
import path from 'path';
import { Organization, Person, Invoice } from '@/lib/types';

const dataDir = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sendersFile = path.join(dataDir, 'senders.json');
const receiversFile = path.join(dataDir, 'receivers.json');
const invoicesFile = path.join(dataDir, 'invoices.json');

// Initialize files if they don't exist
if (!fs.existsSync(sendersFile)) {
  fs.writeFileSync(sendersFile, JSON.stringify([], null, 2));
}
if (!fs.existsSync(receiversFile)) {
  fs.writeFileSync(receiversFile, JSON.stringify([], null, 2));
}
if (!fs.existsSync(invoicesFile)) {
  fs.writeFileSync(invoicesFile, JSON.stringify([], null, 2));
}

// Senders
export function getSenders(): (Organization | Person)[] {
  const data = fs.readFileSync(sendersFile, 'utf-8');
  return JSON.parse(data);
}

export function saveSender(sender: Organization | Person): void {
  const senders = getSenders();
  const index = senders.findIndex(s => s.id === sender.id);
  if (index !== -1) {
    senders[index] = sender;
  } else {
    senders.push(sender);
  }
  fs.writeFileSync(sendersFile, JSON.stringify(senders, null, 2));
}

export function deleteSender(id: string): void {
  const senders = getSenders();
  const filtered = senders.filter(s => s.id !== id);
  fs.writeFileSync(sendersFile, JSON.stringify(filtered, null, 2));
}

export function getSenderById(id: string): (Organization | Person) | undefined {
  const senders = getSenders();
  return senders.find(s => s.id === id);
}

// Receivers
export function getReceivers(): (Organization | Person)[] {
  const data = fs.readFileSync(receiversFile, 'utf-8');
  return JSON.parse(data);
}

export function saveReceiver(receiver: Organization | Person): void {
  const receivers = getReceivers();
  const index = receivers.findIndex(r => r.id === receiver.id);
  if (index !== -1) {
    receivers[index] = receiver;
  } else {
    receivers.push(receiver);
  }
  fs.writeFileSync(receiversFile, JSON.stringify(receivers, null, 2));
}

export function deleteReceiver(id: string): void {
  const receivers = getReceivers();
  const filtered = receivers.filter(r => r.id !== id);
  fs.writeFileSync(receiversFile, JSON.stringify(filtered, null, 2));
}

export function getReceiverById(id: string): (Organization | Person) | undefined {
  const receivers = getReceivers();
  return receivers.find(r => r.id === id);
}

// Invoices
export function getInvoices(): Invoice[] {
  const data = fs.readFileSync(invoicesFile, 'utf-8');
  return JSON.parse(data);
}

export function saveInvoice(invoice: Invoice): void {
  const invoices = getInvoices();
  const index = invoices.findIndex(i => i.id === invoice.id);
  if (index !== -1) {
    invoices[index] = invoice;
  } else {
    invoices.push(invoice);
  }
  fs.writeFileSync(invoicesFile, JSON.stringify(invoices, null, 2));
}

export function deleteInvoice(id: string): void {
  const invoices = getInvoices();
  const filtered = invoices.filter(i => i.id !== id);
  fs.writeFileSync(invoicesFile, JSON.stringify(filtered, null, 2));
}

export function getInvoiceById(id: string): Invoice | undefined {
  const invoices = getInvoices();
  return invoices.find(i => i.id === id);
}
