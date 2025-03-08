import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/quotes/[id] - Get a quote by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Fetch quote with all related data
    const quote = await prisma.quote.findUnique({
      where: { id },
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
    
    // Format the data for client consumption
    const quoteData = {
      id: quote.id,
      referenceNumber: quote.referenceNumber,
      driverInfo: {
        firstName: quote.firstName,
        lastName: quote.lastName,
        email: quote.email,
        phone: quote.phone || null,
        dateOfBirth: quote.dateOfBirth,
        gender: quote.gender,
        addressLine1: quote.addressLine1,
        addressLine2: quote.addressLine2 || null,
        city: quote.city,
        province: quote.provinceId,
        provinceName: quote.province.name_en,
        postalCode: quote.postalCode,
        licenseYears: quote.licenseYears,
        accidents3Years: quote.accidents3Years,
        violations3Years: quote.violations3Years,
        claims3Years: quote.claims3Years
      },
      vehicleInfo: {
        year: quote.vehicles[0].year,
        make: quote.vehicles[0].model.make.name,
        model: quote.vehicles[0].model.name,
        type: quote.vehicles[0].type,
        primaryUse: quote.vehicles[0].vehicleUsageId,
        primaryUseDescription: quote.vehicles[0].primaryUse.description_en,
        annualMileage: quote.vehicles[0].annualMileage,
        parking: quote.vehicles[0].parking,
        antiTheft: quote.vehicles[0].antiTheft,
        winterTires: quote.vehicles[0].winterTires
      },
      coverages: {
        mandatory: quote.selectedCoverages
          .filter(coverage => coverage.coverage.isMandatory)
          .map(coverage => ({
            id: coverage.coverageId,
            name: coverage.coverage.name_en,
            amount: coverage.amount ? parseInt(coverage.amount) : null,
            deductible: coverage.deductible,
            premium: coverage.premium
          })),
        optional: quote.selectedCoverages
          .filter(coverage => !coverage.coverage.isMandatory)
          .map(coverage => ({
            id: coverage.coverageId,
            name: coverage.coverage.name_en,
            deductible: coverage.deductible,
            premium: coverage.premium
          })),
        endorsements: quote.selectedEndorsements.map(endorsement => ({
          id: endorsement.endorsementId,
          name: endorsement.endorsement.name_en,
          premium: endorsement.premium
        })),
        discounts: quote.appliedDiscounts.map(discount => ({
          id: discount.discountId,
          description: discount.discount.description_en,
          percentage: Math.round(discount.discount.discount_factor * 100),
          amount: discount.amount
        }))
      },
      basePremium: quote.basePremium,
      discountAmount: quote.discountAmount,
      fees: quote.fees,
      taxes: quote.taxes,
      annualPremium: quote.annualPremium,
      monthlyPremium: quote.monthlyPremium,
      status: quote.status,
      createdAt: quote.createdAt
    };
    
    return NextResponse.json(quoteData);
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
