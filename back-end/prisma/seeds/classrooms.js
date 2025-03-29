export async function seedClassrooms(prisma) {
    const classrooms = [
        {
            name: 'Lecture Hall A',
            capacity: 120
        },
        {
            name: 'Computer Lab 01',
            capacity: 30
        },
        {
            name: 'Seminar Room 201',
            capacity: 40
        },
        {
            name: 'Design Studio',
            capacity: 25
        },
        {
            name: 'Conference Room B',
            capacity: 50
        }
    ];

    console.log('Seeding classrooms...');

    for (const classroom of classrooms) {
        const result = await prisma.classroom.upsert({
            where: { name: classroom.name },
            update: {},
            create: classroom
        });
        console.log(`Created classroom: ${result.name} (ID: ${result.id})`);
    }

    console.log('Finished seeding classrooms.');
} 