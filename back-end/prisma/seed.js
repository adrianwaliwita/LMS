import { PrismaClient } from '@prisma/client';
import { seedDepartments } from './seeds/departments.js';
import { seedClassrooms } from './seeds/classrooms.js';
import { seedEquipment } from './seeds/equipment.js';
import { seedModules } from './seeds/modules.js';
import { seedCourses } from './seeds/courses.js';
import { seedBatches } from './seeds/batches.js';
import { seedUsers } from './seeds/users.js';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // Seed departments
    await seedDepartments(prisma);

    // Seed modules
    await seedModules(prisma);

    // Seed courses after departments
    await seedCourses(prisma);

    // Seed batches after courses
    await seedBatches(prisma);

    // Seed users after batches
    await seedUsers(prisma);

    // // Seed facilities
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