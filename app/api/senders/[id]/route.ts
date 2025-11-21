import { NextRequest, NextResponse } from 'next/server';
import { getSenderById, saveSender, deleteSender } from '@/lib/utils/storage';
import { Organization, Person } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sender = getSenderById(params.id);
    if (!sender) {
      return NextResponse.json(
        { error: 'Avsender ikke funnet' },
        { status: 404 }
      );
    }
    return NextResponse.json(sender);
  } catch (error) {
    console.error('Error getting sender:', error);
    return NextResponse.json(
      { error: 'Kunne ikke hente avsender' },
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
    const sender: Organization | Person = {
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    };

    saveSender(sender);
    return NextResponse.json(sender);
  } catch (error) {
    console.error('Error updating sender:', error);
    return NextResponse.json(
      { error: 'Kunne ikke oppdatere avsender' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    deleteSender(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sender:', error);
    return NextResponse.json(
      { error: 'Kunne ikke slette avsender' },
      { status: 500 }
    );
  }
}
