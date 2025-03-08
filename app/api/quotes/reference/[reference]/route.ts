import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/quotes/reference/[reference] - Get a quote by reference number
export async function GET(
  request: Request,
  { params }: { params: { reference: string } }
) {
  try {
    const reference = params.reference;
    
    // Fetch quote with all related data using reference number
    const quote = await prisma.quote.findUnique({
      where: { referenceNumber: reference },
      include: {
        province: true,
        vehicles: {
          include: {
            model: {
              include: {
                make: true
              }
            },
            primaryUse: true
          }
        },
        selectedCoverages: {
          include: {
            coverage: true
          }
        },
        selectedEndorsements: {
          include: {
            endorsement: true
          }
        },
        appliedDiscounts: {
          include: {
            discount: true
          }
        }
      }
    });
    
    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
