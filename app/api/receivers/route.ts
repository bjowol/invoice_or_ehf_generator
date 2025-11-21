import { NextRequest, NextResponse } from 'next/server';
import { getReceivers, saveReceiver } from '@/lib/utils/storage';
import { Organization, Person } from '@/lib/types';

export async function GET() {
  try {
    const receivers = getReceivers();
    return NextResponse.json(receivers);
  } catch (error) {
    console.error('Error getting receivers:', error);
    return NextResponse.json(
      { error: 'Kunne ikke hente mottakere' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const receiver: Organization | Person = {
      ...body,
      id: body.id || crypto.randomUUID(),
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveReceiver(receiver);
    return NextResponse.json(receiver, { status: 201 });
  } catch (error) {
    console.error('Error creating receiver:', error);
    return NextResponse.json(
      { error: 'Kunne ikke opprette mottaker' },
      { status: 500 }
    );
  }
}
