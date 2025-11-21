import { NextRequest, NextResponse } from 'next/server';
import { Invoice } from '@/lib/types';
import { generateEHF } from '@/lib/utils/ehf-generator';

export async function POST(request: NextRequest) {
  try {
    const invoice: Invoice = await request.json();
    const xml = generateEHF(invoice);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="Faktura-${invoice.invoiceNumber}.xml"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Kunne ikke generere EHF XML' },
      { status: 500 }
    );
  }
}
