import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/vehicles/uses - Retrieve all vehicle use types
export async function GET() {
  try {
    const uses = await prisma.vehicleUsage.findMany({
      orderBy: {
        premium_factor: 'asc'
      }
    });
    
    return NextResponse.json(uses);
  } catch (error) {
    console.error('Error fetching vehicle uses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle uses' },
      { status: 500 }
    );
  }
}
