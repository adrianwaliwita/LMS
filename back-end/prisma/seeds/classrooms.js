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

    const classroomPromises = classrooms.map(async (classroom) => {
        try {
            const result = await prisma.classroom.upsert({
                where: { name: classroom.name },
                update: {},
                create: classroom
            });
            return { success: true, result };
        } catch (error) {
            return { success: false, error, classroom };
        }
    });

    const results = await Promise.all(classroomPromises);

    results.forEach(({ success, result, error, classroom }) => {
        if (success) {
            console.log(`Created classroom: ${result.name} (ID: ${result.id})`);
        } else {
            console.error(`Failed to create classroom ${classroom.name}:`, error);
        }
    });

    console.log('Finished seeding classrooms.');
} 