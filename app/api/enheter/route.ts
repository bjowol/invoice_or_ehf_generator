import { NextRequest, NextResponse } from 'next/server';
import { BrregSearchResponse } from '@/lib/types';

const BRREG_API_BASE = 'https://data.brreg.no/enhetsregisteret/api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const navn = searchParams.get('navn');
  const organisasjonsnummer = searchParams.get('organisasjonsnummer');

  if (!navn && !organisasjonsnummer) {
    return NextResponse.json(
      { error: 'Må spesifisere enten navn eller organisasjonsnummer' },
      { status: 400 }
    );
  }

  try {
    const url = new URL(`${BRREG_API_BASE}/enheter`);
    if (navn) {
      url.searchParams.set('navn', navn);
    }
    if (organisasjonsnummer) {
      url.searchParams.set('organisasjonsnummer', organisasjonsnummer);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Brreg API error: ${response.statusText}`);
    }

    const data: BrregSearchResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Brreg:', error);
    return NextResponse.json(
      { error: 'Kunne ikke hente data fra Brønnøysundregistrene' },
      { status: 500 }
    );
  }
}
