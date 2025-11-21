'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Hjem' },
    { href: '/senders', label: 'Avsendere' },
    { href: '/receivers', label: 'Mottakere' },
    { href: '/invoices/new', label: 'Ny Faktura' },
  ];

  return (
    <nav className="bg-slate-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between py-4">
          <Link href="/" className="text-xl font-bold text-white hover:text-gray-200">
            EHF Faktura
          </Link>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors text-white ${
                  pathname === link.href
                    ? 'bg-slate-700'
                    : 'hover:bg-slate-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
