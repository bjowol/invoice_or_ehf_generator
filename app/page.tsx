import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
        EHF Faktura Generator
      </h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/senders"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-gray-300"
        >
          <h2 className="text-2xl font-semibold mb-2 text-slate-800">Avsendere</h2>
          <p className="text-gray-700">
            Administrer avsendere av fakturaer (din bedrift eller personlige info)
          </p>
        </Link>

        <Link
          href="/receivers"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-gray-300"
        >
          <h2 className="text-2xl font-semibold mb-2 text-slate-800">Mottakere</h2>
          <p className="text-gray-700">
            Administrer mottakere av fakturaer (kunder og organisasjoner)
          </p>
        </Link>

        <Link
          href="/invoices/new"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-gray-300"
        >
          <h2 className="text-2xl font-semibold mb-2 text-slate-800">Ny Faktura</h2>
          <p className="text-gray-700">
            Opprett en ny faktura i EHF-format og last ned som PDF
          </p>
        </Link>
      </div>

      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-slate-800">Funksjoner</h3>
        <ul className="space-y-2 text-gray-800">
          <li className="flex items-start">
            <span className="text-green-600 mr-2 font-bold">✓</span>
            Norsk EHF faktura-format
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2 font-bold">✓</span>
            Import fra Brønnøysundregistrene
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2 font-bold">✓</span>
            Generering av PDF-filer
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2 font-bold">✓</span>
            Mobil- og desktop-vennlig
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2 font-bold">✓</span>
            Støtte for norsk og engelsk
          </li>
        </ul>
      </div>
    </div>
  );
}
