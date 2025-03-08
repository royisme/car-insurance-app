// This is a database seeding script that will populate the database with initial data

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')

  // Load data from JSON files
  const provinces = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/provinces.json'))).provinces
  const vehiclesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/vehicles.json')))
  const insuranceData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/insuranceTypes.json')))
  const driverData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/driverCategories.json')))
  const translationsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/translations.json')))

  // Clear existing data (in reverse order of dependencies)
  console.log('Clearing existing data...')
  await prisma.$transaction([
    prisma.quoteDiscount.deleteMany(),
    prisma.quoteEndorsement.deleteMany(),
    prisma.quoteInsurance.deleteMany(),
    prisma.vehicle.deleteMany(),
    prisma.quote.deleteMany(),
    prisma.model.deleteMany(),
    prisma.make.deleteMany(),
    prisma.discount.deleteMany(),
    prisma.driverCategory.deleteMany(),
    prisma.endorsement.deleteMany(),
    prisma.coverage.deleteMany(),
    prisma.vehicleUsage.deleteMany(),
    prisma.province.deleteMany(),
    prisma.translation.deleteMany(),
    prisma.theme.deleteMany()
  ])

  // Seed provinces
  console.log('Seeding provinces...')
  await prisma.province.createMany({
    data: provinces.map(p => ({
      id: p.id,
      name_en: p.name_en,
      name_zh: p.name_zh,
      capital: p.capital,
      minLiabilityAmount: p.minLiabilityAmount,
      insuranceSystem: p.insuranceSystem,
      mandatoryCoverages: p.mandatoryCoverages,
      optionalCoverages: p.optionalCoverages || []
    }))
  })

  // Seed car makes and models
  console.log('Seeding vehicle makes and models...')
  for (const make of vehiclesData.makes) {
    const createdMake = await prisma.make.create({
      data: {
        id: make.id,
        name: make.name
      }
    })

    for (const model of make.models) {
      await prisma.model.create({
        data: {
          id: model.id,
          name: model.name,
          types: model.types,
          years: model.years,
          insurance_group: model.insurance_group,
          safety_rating: model.safety_rating,
          makeId: createdMake.id
        }
      })
    }
  }

  // Seed coverages (insurance types)
  console.log('Seeding insurance coverages...')
  for (const coverage of insuranceData.coverages) {
    await prisma.coverage.create({
      data: {
        id: coverage.id,
        name_en: coverage.name_en,
        name_zh: coverage.name_zh,
        description_en: coverage.description_en,
        description_zh: coverage.description_zh,
        isMandatory: coverage.isMandatory,
        defaultAmount: coverage.defaultAmount?.toString(),
        defaultDeductible: coverage.defaultDeductible,
        options: coverage.options
      }
    })
  }

  // Seed endorsements
  console.log('Seeding endorsements...')
  for (const endorsement of insuranceData.endorsements) {
    await prisma.endorsement.create({
      data: {
        id: endorsement.id,
        name_en: endorsement.name_en,
        name_zh: endorsement.name_zh,
        description_en: endorsement.description_en,
        description_zh: endorsement.description_zh,
        premium_factor: endorsement.premium_factor
      }
    })
  }

  // Seed driver categories
  console.log('Seeding driver categories...')
  // Age groups
  for (const ageGroup of driverData.driverAgeGroups) {
    await prisma.driverCategory.create({
      data: {
        id: `age_${ageGroup.id}`,
        category_type: 'age_group',
        min_value: ageGroup.min_age,
        max_value: ageGroup.max_age,
        premium_factor: ageGroup.premium_factor,
        description_en: ageGroup.description_en,
        description_zh: ageGroup.description_zh
      }
    })
  }
  
  // Experience levels
  for (const exp of driverData.drivingExperience) {
    await prisma.driverCategory.create({
      data: {
        id: `exp_${exp.id}`,
        category_type: 'experience',
        min_value: exp.min_years,
        max_value: exp.max_years,
        premium_factor: exp.premium_factor,
        description_en: exp.description_en,
        description_zh: exp.description_zh
      }
    })
  }
  
  // Driving history
  for (const history of driverData.drivingHistory) {
    await prisma.driverCategory.create({
      data: {
        id: `history_${history.id}`,
        category_type: 'history',
        premium_factor: history.premium_factor,
        description_en: history.description_en,
        description_zh: history.description_zh
      }
    })
  }

  // Seed discounts
  console.log('Seeding discounts...')
  for (const discount of driverData.discounts) {
    await prisma.discount.create({
      data: {
        id: discount.id,
        discount_factor: discount.discount_factor,
        description_en: discount.description_en,
        description_zh: discount.description_zh
      }
    })
  }
  
  // Seed vehicle usage types
  console.log('Seeding vehicle usage types...')
  for (const usage of driverData.vehicleUsage) {
    await prisma.vehicleUsage.create({
      data: {
        id: usage.id,
        premium_factor: usage.premium_factor,
        description_en: usage.description_en,
        description_zh: usage.description_zh,
        annual_km_range: usage.annual_km_range
      }
    })
  }
  
  // Seed translations
  console.log('Seeding translations...')
  const translations = []
  
  // Process each namespace in translationsData
  for (const namespace of Object.keys(translationsData)) {
    const section = translationsData[namespace]
    
    // Process each key in the section
    for (const key of Object.keys(section)) {
      translations.push({
        id: `${namespace}.${key}`,
        key: `${namespace}.${key}`,
        namespace: namespace,
        en: section[key].en,
        zh: section[key].zh
      })
    }
  }
  
  await prisma.translation.createMany({
    data: translations
  })
  
  // Seed themes
  console.log('Seeding themes...')
  await prisma.theme.createMany({
    data: [
      {
        id: 'professional',
        name: 'Professional',
        colors: {
          primary: '#1a365d',
          secondary: '#4a5568',
          accent: '#3182ce',
          background: '#f7fafc',
          text: '#2d3748',
          border: '#e2e8f0',
          success: '#2f855a',
          warning: '#dd6b20',
          error: '#e53e3e',
          info: '#3182ce'
        },
        isDefault: true
      },
      {
        id: 'vibrant',
        name: 'Vibrant',
        colors: {
          primary: '#38b2ac',
          secondary: '#4fd1c5',
          accent: '#f6ad55',
          background: '#ffffff',
          text: '#2d3748',
          border: '#e6fffa',
          success: '#68d391',
          warning: '#fbd38d',
          error: '#fc8181',
          info: '#63b3ed'
        },
        isDefault: false
      }
    ]
  })

  console.log('Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
