import { NextResponse } from 'next/server';
import calculatePremium from '@/app/lib/calculatePremium';

// POST /api/quotes/calculate - Calculate premium without saving
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { driverInfo, vehicleInfo, coverageInfo } = data;
    
    // Calculate premium
    const premium = await calculatePremium(driverInfo, vehicleInfo, coverageInfo);
    
    return NextResponse.json(premium);
  } catch (error) {
    console.error('Error calculating premium:', error);
    return NextResponse.json(
      { error: 'Failed to calculate premium' },
      { status: 500 }
    );
  }
}
