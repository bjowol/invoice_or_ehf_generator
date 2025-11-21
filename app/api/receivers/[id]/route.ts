import { NextRequest, NextResponse } from 'next/server';
import { getReceiverById, saveReceiver, deleteReceiver } from '@/lib/utils/storage';
import { Organization, Person } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const receiver = getReceiverById(params.id);
    if (!receiver) {
      return NextResponse.json(
        { error: 'Mottaker ikke funnet' },
        { status: 404 }
      );
    }
    return NextResponse.json(receiver);
  } catch (error) {
    console.error('Error getting receiver:', error);
    return NextResponse.json(
      { error: 'Kunne ikke hente mottaker' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const receiver: Organization | Person = {
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    };

    saveReceiver(receiver);
    return NextResponse.json(receiver);
  } catch (error) {
    console.error('Error updating receiver:', error);
    return NextResponse.json(
      { error: 'Kunne ikke oppdatere mottaker' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    deleteReceiver(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting receiver:', error);
    return NextResponse.json(
      { error: 'Kunne ikke slette mottaker' },
      { status: 500 }
    );
  }
}
