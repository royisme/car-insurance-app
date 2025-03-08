import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/discounts - Retrieve all available discounts
export async function GET() {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: {
        description_en: 'asc'
      }
    });
    
    return NextResponse.json(discounts);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}
