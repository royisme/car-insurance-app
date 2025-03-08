import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/coverages - Retrieve coverages based on province
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get('province');
    
    if (!provinceId) {
      return NextResponse.json(
        { error: 'Province ID is required' },
        { status: 400 }
      );
    }
    
    // Get province details to determine mandatory coverages
    const province = await prisma.province.findUnique({
      where: { id: provinceId },
      select: {
        mandatoryCoverages: true,
        optionalCoverages: true
      }
    });
    
    if (!province) {
      return NextResponse.json(
        { error: 'Province not found' },
        { status: 404 }
      );
    }
    
    // Get all coverages
    const coverages = await prisma.coverage.findMany();
    
    // Get endorsements
    const endorsements = await prisma.endorsement.findMany();
    
    // Separate coverages into mandatory and optional based on province
    const mandatoryCoverages = coverages.filter(coverage => 
      province.mandatoryCoverages.includes(coverage.id)
    );
    
    const optionalCoverages = coverages.filter(coverage => 
      province.optionalCoverages.includes(coverage.id)
    );
    
    return NextResponse.json({
      mandatory: mandatoryCoverages,
      optional: optionalCoverages,
      endorsements: endorsements
    });
  } catch (error) {
    console.error('Error fetching coverages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coverages' },
      { status: 500 }
    );
  }
}
