export async function seedEquipment(prisma) {
    const equipment = [
        {
            name: 'Dell Laptop',
            description: 'Intel i7, 16GB RAM, 512GB SSD for student use',
            quantity: 25
        },
        {
            name: 'Projector HD-1080p',
            description: 'High-definition projector for lecture halls and classrooms',
            quantity: 10
        },
        {
            name: 'Drawing Tablet',
            description: 'Wacom digital drawing tablets for design classes',
            quantity: 15
        },
        {
            name: 'Conference Microphone',
            description: 'Wireless microphone system for large halls',
            quantity: 8
        },
        {
            name: 'Network Switch',
            description: '24-port Gigabit network switch for computer labs',
            quantity: 5
        }
    ];

    console.log('Seeding equipment...');

    for (const item of equipment) {
        const result = await prisma.equipment.upsert({
            where: { name: item.name },
            update: {},
            create: item
        });
        console.log(`Created equipment: ${result.name} (ID: ${result.id})`);
    }

    console.log('Finished seeding equipment.');
} 