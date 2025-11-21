import { NextRequest, NextResponse } from 'next/server';
import { Invoice } from '@/lib/types';
import { generateInvoicePDF } from '@/lib/utils/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const invoice: Invoice = await request.json();

    const pdfBytes = await generateInvoicePDF(invoice);

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Faktura-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Kunne ikke generere PDF' },
      { status: 500 }
    );
  }
}
