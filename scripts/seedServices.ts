import { EquipmentType } from '../generated/prisma/client';
import prisma from '../src/lib/db';

const services = [
  {
    name: "Cultivation",
    description: "Prepare and loosen the soil before planting.",
    resourcesRequired: [EquipmentType.TRACTOR, EquipmentType.CULTIVATOR],
    pricingUnit: "acre"
  },
  {
    name: "Ploughing",
    description: "Turn and break the soil to prepare the field for cultivation.",
    resourcesRequired: [EquipmentType.TRACTOR, EquipmentType.PLOUGH],
    pricingUnit: "acre"
  },
  {
    name: "Sowing",
    description: "Plant seeds uniformly across the prepared field.",
    resourcesRequired: [EquipmentType.TRACTOR, EquipmentType.SEED_DRILL],
    pricingUnit: "acre"
  },
  {
    name: "Rotavator",
    description: "Fine-till the soil and create a suitable seedbed.",
    resourcesRequired: [EquipmentType.TRACTOR, EquipmentType.ROTAVATOR],
    pricingUnit: "acre"
  },
  {
    name: "Crop Spraying",
    description: "Apply pesticides, fertilizers, and crop protection solutions.",
    resourcesRequired: [EquipmentType.TRACTOR, EquipmentType.SPRAYER],
    pricingUnit: "acre"
  },
  {
    name: "Harvesting",
    description: "Harvest mature crops using agricultural machinery.",
    resourcesRequired: [EquipmentType.TRACTOR, EquipmentType.HARVESTER],
    pricingUnit: "acre"
  },
  {
    name: "Material Transportation",
    description: "Transport agricultural materials, produce, or farm inputs.",
    resourcesRequired: [EquipmentType.TRACTOR, EquipmentType.TRAILER],
    pricingUnit: "trip"
  },
  {
    name: "Land Preparation",
    description: "Complete basic field preparation before planting.",
    resourcesRequired: [EquipmentType.TRACTOR, EquipmentType.CULTIVATOR],
    pricingUnit: "acre"
  }
];

async function main() {
  console.log('Start seeding Platform Services...');

  for (const service of services) {
    const existing = await prisma.platformService.findUnique({
      where: { name: service.name }
    });

    if (existing) {
      await prisma.platformService.update({
        where: { id: existing.id },
        data: service
      });
      console.log(`Updated service: ${service.name}`);
    } else {
      await prisma.platformService.create({
        data: service
      });
      console.log(`Created service: ${service.name}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
