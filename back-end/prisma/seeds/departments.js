export async function seedDepartments(prisma) {
    console.log('Seeding departments...');

    const departments = [
        {
            name: 'Administration',
            description: 'Central administrative department managing institutional operations and support services'
        },
        {
            name: 'School of Computing',
            description: 'Focused on software engineering, artificial intelligence, and computer science education.'
        },
        {
            name: 'School of Business',
            description: 'Specializing in business management, finance, and entrepreneurship education.'
        },
        {
            name: 'Department of Engineering',
            description: 'Covering mechanical, electrical, and civil engineering disciplines.'
        },
        {
            name: 'Digital Arts Academy',
            description: 'Focused on digital design, animation, and multimedia production.'
        },
        {
            name: 'Data Science Institute',
            description: 'Specializing in data analytics, machine learning, and statistical analysis.'
        }
    ];

    const departmentPromises = departments.map(async (dept) => {
        try {
            const result = await prisma.department.upsert({
                where: { name: dept.name },
                update: {},
                create: dept
            });
            return { success: true, result };
        } catch (error) {
            return { success: false, error, department: dept };
        }
    });

    const results = await Promise.all(departmentPromises);

    results.forEach(({ success, result, error, department }) => {
        if (success) {
            console.log(`Created department: ${result.name}`);
        } else {
            console.error(`Failed to create department ${department.name}:`, error);
        }
    });

    console.log('Finished seeding departments.');
} 