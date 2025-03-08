import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/provinces - Retrieve all provinces
export async function GET() {
  try {
    const provinces = await prisma.province.findMany({
      orderBy: {
        name_en: 'asc'
      }
    });
    
    return NextResponse.json(provinces);
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provinces' },
      { status: 500 }
    );
  }
}
