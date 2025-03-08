import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Create a new instance of PrismaClient
const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { makeId: string; modelId: string } }
) {
  try {
    // Parse the IDs from the URL parameters
    const makeId = parseInt(params.makeId);
    const modelId = parseInt(params.modelId);
    
    // Validate the IDs
    if (isNaN(makeId) || isNaN(modelId)) {
      return NextResponse.json(
        { error: 'Invalid make ID or model ID' },
        { status: 400 }
      );
    }
    
    // Query the database for the model without using include
    const model = await prisma.model.findFirst({
      where: {
        id: modelId,
        makeId: makeId
      },
      select: {
        years: true,
        types: true
      }
    });
    
    // Return 404 if the model is not found
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }
    
    // Return the years and types directly
    return NextResponse.json({
      years: model.years || [],
      types: model.types || []
    });
    
  } catch (error) {
    console.error('Error fetching model details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model details' },
      { status: 500 }
    );
  }
}
