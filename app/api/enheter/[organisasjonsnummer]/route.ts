import { NextRequest, NextResponse } from 'next/server';

const BRREG_API_BASE = 'https://data.brreg.no/enhetsregisteret/api';

export async function GET(
  _request: NextRequest,
  { params }: { params: { organisasjonsnummer: string } }
) {
  try {
    const baseUrl = `${BRREG_API_BASE}/enheter/${params.organisasjonsnummer}`;
    const response = await fetch(baseUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Fant ikke detaljer for organisasjonsnummer' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Try to enrich with kontaktinformasjon endpoint if available
    try {
      const contactRes = await fetch(`${baseUrl}/kontaktinformasjon`);
      if (contactRes.ok) {
        const contactData = await contactRes.json();
        data.kontaktinformasjon = data.kontaktinformasjon || {};
        data.kontaktinformasjon.telefon = contactData.telefon || contactData.telefonnummer;
        data.kontaktinformasjon.mobiltelefon =
          contactData.mobiltelefon || contactData.mobil;
        data.kontaktinformasjon.epost =
          contactData.epost || contactData.epostadresse;
        data.kontaktinformasjon.epostadresse =
          contactData.epostadresse || contactData.epost;
      }
    } catch (error) {
      console.warn('Ingen kontaktinformasjon tilgjengelig fra Brreg', error);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Brreg entity detail:', error);
    return NextResponse.json(
      { error: 'Kunne ikke hente detaljer fra Brønnøysundregistrene' },
      { status: 500 }
    );
  }
}
