import { PrismaClient } from '@prisma/client';
import { seedDepartments } from './seeds/departments.js';
import { seedClassrooms } from './seeds/classrooms.js';
import { seedEquipment } from './seeds/equipment.js';
import { seedModules } from './seeds/modules.js';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // Seed departments
    await seedDepartments(prisma);

    // Seed modules
    await seedModules(prisma);

    // Seed facilities
    await seedClassrooms(prisma);
    await seedEquipment(prisma);

    console.log('Seed completed.');
}

main()
    .catch((error) => {
        console.error('Seed failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 