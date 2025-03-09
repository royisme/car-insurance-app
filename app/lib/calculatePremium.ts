import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Calculate premium based on driver, vehicle, and coverage information
 * 
 * @param driverInfo Driver information
 * @param vehicleInfo Vehicle information
 * @param coverageInfo Coverage selections
 * @returns Calculated premium details
 */
export default async function calculatePremium(
  driverInfo: any,
  vehicleInfo: any,
  coverageInfo: any
) {
  try {
    // Validate input data
    if (!driverInfo || !vehicleInfo || !coverageInfo) {
      throw new Error('Missing required data for premium calculation: driver, vehicle, or coverage info');
    }

    if (!driverInfo.province || !vehicleInfo.model || !vehicleInfo.primaryUse) {
      throw new Error('Missing required data for premium calculation: province, model, or primary use');
    }

    // Base premium factors
    const BASE_PREMIUM = 800; // Starting base premium
    const TAX_RATE = 0.13; // Example HST rate
    const FEES = 35; // Administrative fees
    
    // Ensure coverageInfo has all required properties
    const normalizedCoverageInfo = {
      mandatoryCoverages: coverageInfo.mandatoryCoverages || {},
      optionalCoverages: coverageInfo.optionalCoverages || {},
      endorsements: coverageInfo.endorsements || {},
      discounts: coverageInfo.discounts || {}
    };
    
    // Fetch relevant data from database
    // Use try-catch to handle database lookup failures
    let province, model, vehicleUsage, driverFactors, coverages, endorsements, discounts;
    
    try {
      [province, model, vehicleUsage, driverFactors, coverages, endorsements, discounts] = await Promise.all([
        prisma.province.findUnique({ where: { id: driverInfo.province } }),
        prisma.model.findUnique({ 
          where: { id: vehicleInfo.model },
          include: { make: true }
        }),
        prisma.vehicleUsage.findUnique({ where: { id: vehicleInfo.primaryUse } }),
        getDriverFactors(driverInfo),
        getMandatoryAndOptionalCoverages(driverInfo.province, normalizedCoverageInfo),
        getEndorsements(normalizedCoverageInfo.endorsements),
        getDiscounts(normalizedCoverageInfo.discounts)
      ]);
    } catch (error) {
      console.error('Database lookup error:', error);
      // Continue with default values
    }
    
    // Use default values if database lookup failed
    province = province || { 
      id: driverInfo.province || 'ON',
      name_en: 'Ontario',
      name_zh: '安大略省',
      minLiabilityAmount: 200000,
      insuranceSystem: 'no-fault'
    };
    
    model = model || {
      id: vehicleInfo.model || 1001,
      name: 'Default Model',
      insurance_group: 'Group 10',
      safety_rating: 4.0,
      make: { id: vehicleInfo.make || 10, name: 'Default Make' }
    };
    
    vehicleUsage = vehicleUsage || {
      id: vehicleInfo.primaryUse || 'commute',
      name: 'Commute',
      factor: 1.2
    };
    
    // Default values for other variables
    driverFactors = driverFactors || {
      age_factor: 1.0,
      experience_factor: 1.0,
      history_factor: 1.0
    };
    
    coverages = coverages || {
      mandatory: [],
      optional: []
    };
    
    endorsements = endorsements || [];
    
    discounts = discounts || [];
    
    // Calculate base premium with driver and vehicle factors
    let basePremium = calculateBasePremium(
      BASE_PREMIUM,
      driverFactors,
      model,
      vehicleInfo,
      vehicleUsage
    );
    
    // Calculate coverages premiums
    const coveragePremiums: Record<string, number> = {};
    let totalCoveragePremium = 0;
    
    // Add mandatory coverages
    for (const coverage of coverages.mandatory) {
      const coverageDetails = getCoverageDetails(coverage, coverageInfo.mandatoryCoverages[coverage.id] || {});
      coveragePremiums[coverage.id] = coverageDetails.premium;
      totalCoveragePremium += coverageDetails.premium;
    }
    
    // Add optional coverages
    for (const coverage of coverages.optional) {
      if (coverageInfo.optionalCoverages[coverage.id]?.selected) {
        const coverageDetails = getCoverageDetails(coverage, coverageInfo.optionalCoverages[coverage.id] || {});
        coveragePremiums[coverage.id] = coverageDetails.premium;
        totalCoveragePremium += coverageDetails.premium;
      }
    }
    
    // Add base premium to total
    basePremium += totalCoveragePremium;
    
    // Calculate endorsements premiums
    const endorsementPremiums: Record<string, number> = {};
    let totalEndorsementPremium = 0;
    
    for (const endorsement of endorsements) {
      const premium = calculateEndorsementPremium(basePremium, endorsement);
      endorsementPremiums[endorsement.id] = premium;
      totalEndorsementPremium += premium;
    }
    
    // Add endorsement premiums to base premium
    basePremium += totalEndorsementPremium;
    
    // Calculate discounts
    const discountAmounts: Record<string, number> = {};
    let totalDiscountAmount = 0;
    
    for (const discount of discounts) {
      const amount = basePremium * discount.discount_factor;
      discountAmounts[discount.id] = amount;
      totalDiscountAmount += amount;
    }
    
    // Subtract discounts and add fees
    const subtotal = basePremium - totalDiscountAmount;
    const taxes = subtotal * TAX_RATE;
    const annualPremium = subtotal + taxes + FEES;
    const monthlyPremium = annualPremium / 12;
    
    // Return premium calculation details
    return {
      basePremium: parseFloat(basePremium.toFixed(2)),
      discountAmount: parseFloat(totalDiscountAmount.toFixed(2)),
      fees: FEES,
      taxes: parseFloat(taxes.toFixed(2)),
      annualPremium: parseFloat(annualPremium.toFixed(2)),
      monthlyPremium: parseFloat(monthlyPremium.toFixed(2)),
      coveragePremiums,
      endorsementPremiums,
      discountAmounts
    };
  } catch (error) {
    console.error('Error calculating premium:', error);
    throw error;
  }
}

/**
 * Get driver risk factors based on age, experience, and driving history
 */
async function getDriverFactors(driverInfo: any) {
  // Get age group factor
  const driverAge = calculateAge(new Date(driverInfo.dateOfBirth));
  const ageGroup = await prisma.driverCategory.findFirst({
    where: {
      category_type: 'age_group',
      min_value: { lte: driverAge },
      max_value: { gte: driverAge }
    }
  });
  
  // Get experience factor
  const experienceCategory = await prisma.driverCategory.findFirst({
    where: {
      category_type: 'experience',
      min_value: { lte: driverInfo.licenseYears },
      max_value: { gte: driverInfo.licenseYears }
    }
  });
  
  // Get history factor
  let historyCategory;
  
  if (driverInfo.accidents3Years > 0 && driverInfo.violations3Years > 0) {
    historyCategory = await prisma.driverCategory.findFirst({
      where: {
        category_type: 'history',
        id: 'history_multiple_infractions'
      }
    });
  } else if (driverInfo.accidents3Years > 0) {
    historyCategory = await prisma.driverCategory.findFirst({
      where: {
        category_type: 'history',
        id: 'history_at_fault_accident'
      }
    });
  } else if (driverInfo.violations3Years > 0) {
    historyCategory = await prisma.driverCategory.findFirst({
      where: {
        category_type: 'history',
        id: 'history_minor_infraction'
      }
    });
  } else {
    historyCategory = await prisma.driverCategory.findFirst({
      where: {
        category_type: 'history',
        id: 'history_clean'
      }
    });
  }
  
  return {
    ageGroup: ageGroup || { premium_factor: 1.0 },
    experience: experienceCategory || { premium_factor: 1.0 },
    history: historyCategory || { premium_factor: 1.0 }
  };
}

/**
 * Calculate base premium based on driver and vehicle factors
 */
function calculateBasePremium(
  basePremium: number,
  driverFactors: any,
  model: any,
  vehicleInfo: any,
  vehicleUsage: any
) {
  // Get insurance group factor from vehicle model
  const groupFactor = getInsuranceGroupFactor(model.insurance_group);
  
  // Get vehicle age factor
  const vehicleAge = new Date().getFullYear() - vehicleInfo.year;
  const ageFactor = getVehicleAgeFactor(vehicleAge);
  
  // Apply all factors to base premium
  let premium = basePremium;
  
  // Apply driver factors
  premium *= driverFactors.ageGroup.premium_factor;
  premium *= driverFactors.experience.premium_factor;
  premium *= driverFactors.history.premium_factor;
  
  // Apply vehicle factors
  premium *= groupFactor;
  premium *= ageFactor;
  premium *= vehicleUsage.premium_factor;
  
  // Apply safety rating adjustment (0.9 to 1.1 scale)
  const safetyFactor = 1.1 - (model.safety_rating / 10); // 4.5 rating → 0.55 → factor of 1.1-0.55 = 0.55
  premium *= safetyFactor;
  
  // Vehicle features discounts
  if (vehicleInfo.antiTheft) {
    premium *= 0.95; // 5% discount for anti-theft
  }
  
  if (vehicleInfo.winterTires) {
    premium *= 0.97; // 3% discount for winter tires
  }
  
  // Parking location factor
  switch (vehicleInfo.parking) {
    case 'garage':
      premium *= 0.9; // 10% discount for garage parking
      break;
    case 'driveway':
      premium *= 0.95; // 5% discount for driveway parking
      break;
    case 'street':
      premium *= 1.1; // 10% surcharge for street parking
      break;
    case 'parking_lot':
      premium *= 1.05; // 5% surcharge for parking lot
      break;
  }
  
  return premium;
}

/**
 * Get insurance group factor
 */
function getInsuranceGroupFactor(group: string) {
  const factors: Record<string, number> = {
    'compact': 1.0,
    'midsize': 1.1,
    'luxury': 1.4,
    'sports': 1.6,
    'suv_small': 1.2,
    'suv_large': 1.3,
    'truck': 1.25,
    'van': 1.15
  };
  
  return factors[group] || 1.0;
}

/**
 * Get vehicle age factor
 */
function getVehicleAgeFactor(age: number) {
  if (age === 0) return 1.5; // New vehicle
  if (age === 1) return 1.4;
  if (age === 2) return 1.3;
  if (age === 3) return 1.2;
  if (age === 4) return 1.1;
  if (age === 5) return 1.0;
  if (age === 6) return 0.95;
  if (age === 7) return 0.9;
  if (age === 8) return 0.85;
  if (age === 9) return 0.8;
  
  return 0.75; // 10+ years old
}

/**
 * Calculate age based on birthdate
 */
function calculateAge(birthdate: Date) {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDiff = today.getMonth() - birthdate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Get mandatory and optional coverages based on province
 */
async function getMandatoryAndOptionalCoverages(provinceId: string, coverageInfo: any) {
  if (!provinceId) {
    throw new Error('Province ID is required for coverage calculation');
  }

  // Get coverages for the province
  const province = await prisma.province.findUnique({
    where: { id: provinceId },
    select: {
      mandatoryCoverages: true,
      optionalCoverages: true
    }
  });
  
  if (!province) {
    throw new Error('Province not found');
  }
  
  // Get mandatory coverages
  const mandatoryCoverages = await prisma.coverage.findMany({
    where: {
      id: { in: province.mandatoryCoverages }
    }
  });
  
  // Get optional coverages selected by the user
  const optionalCoverageIds = Object.keys(coverageInfo.optionalCoverages || {})
    .filter(id => coverageInfo.optionalCoverages[id]?.selected);
  
  const optionalCoverages = await prisma.coverage.findMany({
    where: {
      id: { in: optionalCoverageIds.length > 0 ? optionalCoverageIds : [] }
    }
  });
  
  return {
    mandatory: mandatoryCoverages,
    optional: optionalCoverages
  };
}

/**
 * Get selected endorsements
 */
async function getEndorsements(endorsementsInfo: any) {
  const endorsementIds = Object.keys(endorsementsInfo || {})
    .filter(id => endorsementsInfo[id]?.selected);
  
  if (endorsementIds.length === 0) {
    return [];
  }
  
  return prisma.endorsement.findMany({
    where: {
      id: { in: endorsementIds }
    }
  });
}

/**
 * Get selected discounts
 */
async function getDiscounts(discountsInfo: any) {
  const discountIds = Object.keys(discountsInfo || {})
    .filter(id => discountsInfo[id]?.selected);
  
  if (discountIds.length === 0) {
    return [];
  }
  
  return prisma.discount.findMany({
    where: {
      id: { in: discountIds }
    }
  });
}

/**
 * Get coverage details including premium
 */
function getCoverageDetails(coverage: any, selectedOptions: any) {
  // Base coverage premium is 10% of base premium for each coverage
  let premium = 80; // Base coverage premium
  
  // Apply premium factors based on selected options
  if (coverage.options && selectedOptions) {
    // Handle special cases for mandatory coverages with zero or undefined values
    if (coverage.isMandatory) {
      // For Accident Benefits, ensure we have a valid level
      if (coverage.id === 'accident_benefits' && !selectedOptions.level) {
        selectedOptions.level = coverage.defaultAmount || 'standard';
        console.log('Fixed accident_benefits level to:', selectedOptions.level);
      }
      
      // For Uninsured Automobile, ensure we have a valid level
      if (coverage.id === 'uninsured_automobile' && !selectedOptions.level) {
        selectedOptions.level = coverage.defaultAmount || 'standard';
        console.log('Fixed uninsured_automobile level to:', selectedOptions.level);
      }
      
      // For Direct Compensation Property Damage, ensure we have a valid level
      if (coverage.id === 'direct_compensation_property_damage' && !selectedOptions.level) {
        selectedOptions.level = coverage.defaultAmount || 'standard';
        console.log('Fixed direct_compensation_property_damage level to:', selectedOptions.level);
      }
    }
    
    // Find the matching option based on selected values
    const option = coverage.options.find((opt: any) => {
      // For coverages that use level (Direct Compensation Property Damage, Accident Benefits, Uninsured Automobile)
      if (['direct_compensation_property_damage', 'accident_benefits', 'uninsured_automobile'].includes(coverage.id)) {
        return opt.level === selectedOptions.level;
      }
      
      // Primary matching based on amount if available
      if (opt.amount !== undefined && selectedOptions.amount === opt.amount) {
        return true;
      }
      
      // Secondary matching based on deductible if available
      if (opt.deductible !== undefined && selectedOptions.deductible === opt.deductible) {
        return true;
      }
      
      // Tertiary matching based on level if available
      if (opt.level !== undefined && selectedOptions.level === opt.level) {
        return true;
      }
      
      return false;
    });
    
    if (option) {
      premium *= option.premium_factor;
      
      // Ensure the selected options are complete by copying missing properties from the matched option
      if (option.amount !== undefined && selectedOptions.amount === undefined) {
        selectedOptions.amount = option.amount;
      }
      
      if (option.deductible !== undefined && selectedOptions.deductible === undefined) {
        selectedOptions.deductible = option.deductible;
      }
      
      if (option.level !== undefined && selectedOptions.level === undefined) {
        selectedOptions.level = option.level;
      }
    } else {
      // If no matching option found, use the first option as fallback
      if (coverage.options.length > 0) {
        const defaultOption = coverage.options[0];
        premium *= defaultOption.premium_factor || 1;
        
        // Apply default option values
        if (defaultOption.amount !== undefined) {
          selectedOptions.amount = defaultOption.amount;
        }
        
        if (defaultOption.deductible !== undefined) {
          selectedOptions.deductible = defaultOption.deductible;
        }
        
        if (defaultOption.level !== undefined) {
          selectedOptions.level = defaultOption.level;
        }
      }
    }
  }
  
  return {
    coverage,
    selectedOptions,
    premium
  };
}

/**
 * Calculate endorsement premium
 */
function calculateEndorsementPremium(basePremium: number, endorsement: any) {
  return basePremium * endorsement.premium_factor;
}
