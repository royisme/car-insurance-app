/**
 * Demo Data Generator
 * 
 * This utility generates random but realistic data for the demo mode.
 * It provides functions to generate various types of data needed for the insurance application.
 */

// Helper function to get a random element from an array
export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper function to get a random integer between min and max (inclusive)
export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper to get a random date between two dates
export const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate random driver info
export const generateDriverInfo = () => {
  const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa', 'William', 'Emma', 'Richard', 'Olivia', 'James', 'Sophia', 'Thomas', 'Ava'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Lee'];
  const genders = ['male', 'female'];
  const provinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
  const cities = {
    'ON': ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'London', 'Windsor', 'Kitchener', 'Brampton', 'Kingston', 'Guelph'],
    'QC': ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Sherbrooke', 'Trois-Rivières', 'Longueuil'],
    'BC': ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond', 'Kelowna', 'Coquitlam', 'Abbotsford'],
    'AB': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Fort McMurray', 'Medicine Hat', 'Grande Prairie'],
    // Default for other provinces
    'default': ['City']
  };
  
  const streets = ['Maple', 'Oak', 'Pine', 'Cedar', 'Elm', 'Willow', 'Main', 'High', 'Park', 'Lake', 'Hill', 'River', 'Queen', 'King', 'Victoria', 'Albert'];
  const streetTypes = ['Street', 'Avenue', 'Road', 'Drive', 'Boulevard', 'Lane', 'Court', 'Place', 'Crescent', 'Way'];
  
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const gender = getRandomElement(genders);
  const province = getRandomElement(provinces);
  const city = getRandomElement(cities[province as keyof typeof cities] || cities['default']);
  
  // Generate date of birth (21-75 years old)
  const now = new Date();
  const minAge = new Date(now.getFullYear() - 75, now.getMonth(), now.getDate());
  const maxAge = new Date(now.getFullYear() - 21, now.getMonth(), now.getDate());
  const dateOfBirth = getRandomDate(minAge, maxAge);
  
  // Generate license years (1-50 years, but not more than age-16)
  const maxLicenseYears = Math.min(50, Math.floor((now.getTime() - dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365)) - 16);
  const licenseYears = getRandomInt(1, maxLicenseYears);
  
  // Generate email
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(1, 999)}@example.com`;
  
  // Generate phone number
  const areaCode = getRandomInt(200, 999);
  const prefix = getRandomInt(200, 999);
  const lineNumber = getRandomInt(1000, 9999);
  const phone = `(${areaCode}) ${prefix}-${lineNumber}`;
  
  // Generate address
  const streetNumber = getRandomInt(1, 9999);
  const street = getRandomElement(streets);
  const streetType = getRandomElement(streetTypes);
  const addressLine1 = `${streetNumber} ${street} ${streetType}`;
  
  // Maybe generate apartment number
  const hasApt = Math.random() > 0.7;
  const addressLine2 = hasApt ? `Apt ${getRandomInt(1, 999)}` : '';
  
  // Generate postal code appropriate for the province
  const postalCodePrefixes = {
    'ON': ['M', 'L', 'K', 'N', 'P'],
    'QC': ['H', 'G', 'J'],
    'BC': ['V'],
    'AB': ['T'],
    'default': ['A', 'B', 'C', 'E', 'R', 'S', 'X', 'Y']
  };
  
  const prefix1 = getRandomElement(postalCodePrefixes[province as keyof typeof postalCodePrefixes] || postalCodePrefixes['default']);
  const digit1 = getRandomInt(0, 9);
  const letter1 = getRandomElement(['A', 'B', 'C', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z']);
  const digit2 = getRandomInt(0, 9);
  const letter2 = getRandomElement(['A', 'B', 'C', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z']);
  const postalCode = `${prefix1}${digit1}${letter1} ${digit2}${letter2}${getRandomInt(0, 9)}`;
  
  // Generate claim and violation info (weighted towards zero for realism)
  const accidentDistribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2];
  const violationDistribution = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 3];
  const claimDistribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2];
  
  const accidents3Years = getRandomElement(accidentDistribution);
  const violations3Years = getRandomElement(violationDistribution);
  const claims3Years = getRandomElement(claimDistribution);
  
  return {
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    gender,
    addressLine1,
    addressLine2,
    city,
    province,
    postalCode,
    licenseYears,
    accidents3Years,
    violations3Years,
    claims3Years
  };
};

// Generate random vehicle info
export const generateVehicleInfo = () => {
  const vehicleTypes = ['Sedan', 'SUV', 'Truck', 'Van', 'Hatchback', 'Coupe', 'Wagon', 'Convertible'];
  const usages = ['personal', 'commute_short', 'commute_long', 'business'];
  const parkingOptions = ['garage', 'driveway', 'carport', 'street', 'parking_lot'];
  
  // Popular makes with IDs (1-10 for demo)
  const makes = [
    { id: 1, name: 'Toyota' },
    { id: 2, name: 'Honda' },
    { id: 3, name: 'Ford' },
    { id: 4, name: 'Chevrolet' },
    { id: 5, name: 'Nissan' },
    { id: 6, name: 'Hyundai' },
    { id: 7, name: 'Kia' },
    { id: 8, name: 'Volkswagen' },
    { id: 9, name: 'BMW' },
    { id: 10, name: 'Mercedes-Benz' }
  ];
  
  // Models per make with IDs (simplification for demo)
  const modelsByMake: Record<number, Array<{id: number, name: string}>> = {
    1: [ // Toyota
      { id: 101, name: 'Camry' },
      { id: 102, name: 'Corolla' },
      { id: 103, name: 'RAV4' },
      { id: 104, name: 'Highlander' }
    ],
    2: [ // Honda
      { id: 201, name: 'Civic' },
      { id: 202, name: 'Accord' },
      { id: 203, name: 'CR-V' },
      { id: 204, name: 'Pilot' }
    ],
    3: [ // Ford
      { id: 301, name: 'F-150' },
      { id: 302, name: 'Escape' },
      { id: 303, name: 'Explorer' },
      { id: 304, name: 'Mustang' }
    ],
    4: [ // Chevrolet
      { id: 401, name: 'Silverado' },
      { id: 402, name: 'Equinox' },
      { id: 403, name: 'Malibu' },
      { id: 404, name: 'Traverse' }
    ],
    5: [ // Nissan
      { id: 501, name: 'Altima' },
      { id: 502, name: 'Rogue' },
      { id: 503, name: 'Sentra' },
      { id: 504, name: 'Pathfinder' }
    ],
    6: [ // Hyundai
      { id: 601, name: 'Elantra' },
      { id: 602, name: 'Tucson' },
      { id: 603, name: 'Santa Fe' },
      { id: 604, name: 'Sonata' }
    ],
    7: [ // Kia
      { id: 701, name: 'Forte' },
      { id: 702, name: 'Sportage' },
      { id: 703, name: 'Sorento' },
      { id: 704, name: 'Soul' }
    ],
    8: [ // Volkswagen
      { id: 801, name: 'Jetta' },
      { id: 802, name: 'Tiguan' },
      { id: 803, name: 'Atlas' },
      { id: 804, name: 'Golf' }
    ],
    9: [ // BMW
      { id: 901, name: '3 Series' },
      { id: 902, name: '5 Series' },
      { id: 903, name: 'X3' },
      { id: 904, name: 'X5' }
    ],
    10: [ // Mercedes-Benz
      { id: 1001, name: 'C-Class' },
      { id: 1002, name: 'E-Class' },
      { id: 1003, name: 'GLC' },
      { id: 1004, name: 'GLE' }
    ]
  };
  
  // Randomly select make and then model
  const makeObj = getRandomElement(makes);
  const makeId = makeObj.id;
  const models = modelsByMake[makeId] || [];
  const modelObj = getRandomElement(models);
  const modelId = modelObj ? modelObj.id : 0;
  
  // Random year between 2000 and current year
  const currentYear = new Date().getFullYear();
  const year = getRandomInt(2000, currentYear);
  
  // Vehicle type that matches the make/model category
  const type = getRandomElement(vehicleTypes);
  
  // Usage tends toward commuting
  const primaryUse = getRandomElement(usages);
  
  // Annual mileage (realistic ranges)
  const mileageRanges = [
    { min: 5000, max: 10000 },   // Low
    { min: 10000, max: 15000 },  // Average
    { min: 15000, max: 25000 },  // High
    { min: 25000, max: 35000 }   // Very high (less common)
  ];
  
  const mileageRange = getRandomElement([0, 0, 1, 1, 1, 1, 2, 2, 3].map(i => mileageRanges[i]));
  const annualMileage = getRandomInt(mileageRange.min, mileageRange.max);
  
  // Parking - weighted for more common options
  const parking = getRandomElement([
    'garage', 'garage', 'garage', 
    'driveway', 'driveway', 'driveway',
    'carport', 
    'street', 'street',
    'parking_lot', 'parking_lot'
  ]);
  
  // Features (anti-theft more common than winter tires)
  const antiTheft = Math.random() > 0.4;
  const winterTires = Math.random() > 0.6;
  
  return {
    make: makeId,
    model: modelId,
    year,
    type,
    primaryUse,
    annualMileage,
    parking,
    antiTheft,
    winterTires
  };
};

// Generate random coverage selections
export const generateCoverageInfo = (vehicleInfo: any) => {
  // Base structure for coverage
  const coverageInfo: any = {
    mandatoryCoverages: {},
    optionalCoverages: {},
    endorsements: {},
    discounts: {}
  };
  
  // Optional coverages selection (collision and comprehensive are very common)
  const collisionSelected = Math.random() > 0.2;
  const comprehensiveSelected = Math.random() > 0.3;
  
  if (collisionSelected) {
    // Deductible options usually 500, 1000, 2000
    const deductibleOptions = [500, 1000, 2000];
    coverageInfo.optionalCoverages.collision = {
      selected: true,
      deductible: getRandomElement(deductibleOptions)
    };
  }
  
  if (comprehensiveSelected) {
    const deductibleOptions = [250, 500, 1000];
    coverageInfo.optionalCoverages.comprehensive = {
      selected: true,
      deductible: getRandomElement(deductibleOptions)
    };
  }
  
  // Random selection of endorsements
  const endorsementOptions = [
    'roadside_assistance',
    'rental_coverage',
    'accident_forgiveness',
    'disappearing_deductible'
  ];
  
  // Select 0-3 endorsements randomly
  const numEndorsements = getRandomInt(0, 3);
  const selectedEndorsements = new Set();
  
  while (selectedEndorsements.size < numEndorsements && selectedEndorsements.size < endorsementOptions.length) {
    selectedEndorsements.add(getRandomElement(endorsementOptions));
  }
  
  selectedEndorsements.forEach(endorsement => {
    coverageInfo.endorsements[endorsement as string] = { selected: true };
  });
  
  // Discounts
  const discountOptions = [
    'multi_vehicle',
    'claims_free',
    'driver_training',
    'retiree',
    'winter_tires'
  ];
  
  // Select 0-3 discounts randomly
  const numDiscounts = getRandomInt(0, 3);
  const selectedDiscounts = new Set();
  
  // Always include winter_tires discount if vehicle has them
  if (vehicleInfo.winterTires) {
    selectedDiscounts.add('winter_tires');
  }
  
  while (selectedDiscounts.size < numDiscounts && selectedDiscounts.size < discountOptions.length) {
    const discount = getRandomElement(discountOptions);
    if (discount !== 'winter_tires' || !vehicleInfo.winterTires) {
      selectedDiscounts.add(discount);
    }
  }
  
  selectedDiscounts.forEach(discount => {
    coverageInfo.discounts[discount as string] = { selected: true };
  });
  
  return coverageInfo;
};
