import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/vehicles/makes - Retrieve all vehicle makes
export async function GET() {
  try {
    const makes = await prisma.make.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(makes);
  } catch (error) {
    console.error('Error fetching vehicle makes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle makes' },
      { status: 500 }
    );
  }
}
