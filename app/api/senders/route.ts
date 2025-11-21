import { NextRequest, NextResponse } from 'next/server';
import { getSenders, saveSender } from '@/lib/utils/storage';
import { Organization, Person } from '@/lib/types';

export async function GET() {
  try {
    const senders = getSenders();
    return NextResponse.json(senders);
  } catch (error) {
    console.error('Error getting senders:', error);
    return NextResponse.json(
      { error: 'Kunne ikke hente avsendere' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sender: Organization | Person = {
      ...body,
      id: body.id || crypto.randomUUID(),
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveSender(sender);
    return NextResponse.json(sender, { status: 201 });
  } catch (error) {
    console.error('Error creating sender:', error);
    return NextResponse.json(
      { error: 'Kunne ikke opprette avsender' },
      { status: 500 }
    );
  }
}
