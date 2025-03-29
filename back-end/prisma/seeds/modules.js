export async function seedModules(prisma) {
    const modules = [
        {
            title: 'Introduction to Programming',
            description: 'Fundamentals of programming concepts, algorithms, and problem-solving techniques'
        },
        {
            title: 'Database Management Systems',
            description: 'Design, implementation, and management of relational databases'
        },
        {
            title: 'Web Development Fundamentals',
            description: 'Basic concepts of web development including HTML, CSS, and JavaScript'
        },
        {
            title: 'Software Engineering Principles',
            description: 'Software development lifecycle, design patterns, and best practices'
        },
        {
            title: 'Network Security',
            description: 'Network security concepts, protocols, and implementation strategies'
        },
        {
            title: 'Mobile App Development',
            description: 'Development of mobile applications for iOS and Android platforms'
        },
        {
            title: 'Cloud Computing',
            description: 'Cloud architecture, services, and deployment models'
        },
        {
            title: 'Artificial Intelligence',
            description: 'Machine learning algorithms, neural networks, and AI applications'
        },
        {
            title: 'DevOps Practices',
            description: 'Continuous integration, deployment, and infrastructure automation'
        },
        {
            title: 'UI/UX Design',
            description: 'User interface design principles and user experience optimization'
        }
    ];

    console.log('Seeding modules...');

    const modulePromises = modules.map(async (module) => {
        try {
            const result = await prisma.module.upsert({
                where: { title: module.title },
                update: {},
                create: module
            });
            return { success: true, result };
        } catch (error) {
            return { success: false, error, module };
        }
    });

    const results = await Promise.all(modulePromises);

    results.forEach(({ success, result, error, module }) => {
        if (success) {
            console.log(`Created module: ${result.title} (ID: ${result.id})`);
        } else {
            console.error(`Failed to create module ${module.title}:`, error);
        }
    });

    console.log('Finished seeding modules.');
}