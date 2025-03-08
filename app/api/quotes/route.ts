import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import calculatePremium from '@/app/lib/calculatePremium';

const prisma = new PrismaClient();

// POST /api/quotes - Create a new quote
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { driverInfo, vehicleInfo, coverageInfo } = data;
    
    // Calculate premium
    const premium = await calculatePremium(driverInfo, vehicleInfo, coverageInfo);
    
    // Create quote in database
    const quote = await prisma.quote.create({
      data: {
        firstName: driverInfo.firstName,
        lastName: driverInfo.lastName,
        email: driverInfo.email,
        phone: driverInfo.phone || null,
        dateOfBirth: new Date(driverInfo.dateOfBirth),
        gender: driverInfo.gender,
        addressLine1: driverInfo.addressLine1,
        addressLine2: driverInfo.addressLine2 || null,
        city: driverInfo.city,
        provinceId: driverInfo.province,
        postalCode: driverInfo.postalCode,
        licenseYears: driverInfo.licenseYears,
        accidents3Years: driverInfo.accidents3Years || 0,
        violations3Years: driverInfo.violations3Years || 0,
        claims3Years: driverInfo.claims3Years || 0,
        basePremium: premium.basePremium,
        discountAmount: premium.discountAmount,
        fees: premium.fees,
        taxes: premium.taxes,
        annualPremium: premium.annualPremium,
        monthlyPremium: premium.monthlyPremium,
        status: 'completed',
        
        // Create vehicle record
        vehicles: {
          create: {
            year: vehicleInfo.year,
            modelId: vehicleInfo.model,
            type: vehicleInfo.type,
            vehicleUsageId: vehicleInfo.primaryUse,
            annualMileage: vehicleInfo.annualMileage,
            parking: vehicleInfo.parking,
            antiTheft: vehicleInfo.antiTheft || false,
            winterTires: vehicleInfo.winterTires || false
          }
        }
      }
    });
    
    // Add coverages, endorsements, and discounts
    await addCoverages(quote.id, coverageInfo, premium);
    
    return NextResponse.json({
      id: quote.id,
      referenceNumber: quote.referenceNumber
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}

// Helper function to add coverages, endorsements, and discounts to a quote
async function addCoverages(quoteId: string, coverageInfo: any, premium: any) {
  // Add mandatory coverages
  for (const coverageId of Object.keys(coverageInfo.mandatoryCoverages)) {
    const coverage = coverageInfo.mandatoryCoverages[coverageId];
    if (coverage.selected) {
      await prisma.quoteInsurance.create({
        data: {
          quoteId,
          coverageId,
          amount: coverage.amount?.toString(),
          deductible: coverage.deductible,
          premium: premium.coveragePremiums[coverageId] || 0
        }
      });
    }
  }
  
  // Add optional coverages
  for (const coverageId of Object.keys(coverageInfo.optionalCoverages)) {
    const coverage = coverageInfo.optionalCoverages[coverageId];
    if (coverage.selected) {
      await prisma.quoteInsurance.create({
        data: {
          quoteId,
          coverageId,
          deductible: coverage.deductible,
          premium: premium.coveragePremiums[coverageId] || 0
        }
      });
    }
  }
  
  // Add endorsements
  for (const endorsementId of Object.keys(coverageInfo.endorsements)) {
    const endorsement = coverageInfo.endorsements[endorsementId];
    if (endorsement.selected) {
      await prisma.quoteEndorsement.create({
        data: {
          quoteId,
          endorsementId,
          premium: premium.endorsementPremiums[endorsementId] || 0
        }
      });
    }
  }
  
  // Add discounts
  for (const discountId of Object.keys(coverageInfo.discounts)) {
    const discount = coverageInfo.discounts[discountId];
    if (discount.selected) {
      await prisma.quoteDiscount.create({
        data: {
          quoteId,
          discountId,
          amount: premium.discountAmounts[discountId] || 0
        }
      });
    }
  }
}
