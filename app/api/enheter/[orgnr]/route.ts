import { NextRequest, NextResponse } from 'next/server';
import { BrregEnhet } from '@/lib/types';

const BRREG_API_BASE = 'https://data.brreg.no/enhetsregisteret/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { orgnr: string } }
) {
  const { orgnr } = params;

  try {
    const response = await fetch(`${BRREG_API_BASE}/enheter/${orgnr}`);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Organisasjon ikke funnet' },
          { status: 404 }
        );
      }
      throw new Error(`Brreg API error: ${response.statusText}`);
    }

    const data: BrregEnhet = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Brreg:', error);
    return NextResponse.json(
      { error: 'Kunne ikke hente data fra Brønnøysundregistrene' },
      { status: 500 }
    );
  }
}
