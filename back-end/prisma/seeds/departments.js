export async function seedDepartments(prisma) {
    const departments = [
        {
            name: 'School of Computing',
            description: 'Specializing in software engineering, cybersecurity, and artificial intelligence'
        },
        {
            name: 'School of Business',
            description: 'Focusing on business management, finance, and entrepreneurship studies'
        },
        {
            name: 'Department of Engineering',
            description: 'Offering programs in mechanical, electrical, and civil engineering'
        },
        {
            name: 'Digital Arts Academy',
            description: 'Creative hub for digital design, animation, and interactive media'
        },
        {
            name: 'Data Science Institute',
            description: 'Advanced analytics, machine learning, and big data technologies'
        }
    ];

    console.log('Seeding departments...');

    for (const department of departments) {
        const result = await prisma.department.upsert({
            where: { name: department.name },
            update: {},
            create: department
        });
        console.log(`Created department: ${result.name} (ID: ${result.id})`);
    }

    console.log('Finished seeding departments.');
} 