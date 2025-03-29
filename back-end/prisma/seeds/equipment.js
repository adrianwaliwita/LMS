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

    const equipmentPromises = equipment.map(async (item) => {
        try {
            const result = await prisma.equipment.upsert({
                where: { name: item.name },
                update: {},
                create: item
            });
            return { success: true, result };
        } catch (error) {
            return { success: false, error, item };
        }
    });

    const results = await Promise.all(equipmentPromises);

    results.forEach(({ success, result, error, item }) => {
        if (success) {
            console.log(`Created equipment: ${result.name} (ID: ${result.id})`);
        } else {
            console.error(`Failed to create equipment ${item.name}:`, error);
        }
    });

    console.log('Finished seeding equipment.');
} 