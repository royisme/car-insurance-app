import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/vehicles/makes/[makeId]/models - Retrieve models for a specific make
export async function GET(
  request: Request,
  { params }: { params: { makeId: string } }
) {
  try {
    const makeId = parseInt(params.makeId);
    
    if (isNaN(makeId)) {
      return NextResponse.json(
        { error: 'Invalid make ID' },
        { status: 400 }
      );
    }
    
    const models = await prisma.model.findMany({
      where: {
        makeId: makeId
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
