export async function seedCourses(prisma) {
    // First, get all department IDs by name for reference
    const departments = await prisma.department.findMany();
    const departmentMap = departments.reduce((acc, dept) => {
        acc[dept.name] = dept.id;
        return acc;
    }, {});

    // Get all module IDs by title for reference
    const modules = await prisma.module.findMany();
    const moduleMap = modules.reduce((acc, mod) => {
        acc[mod.title] = mod.id;
        return acc;
    }, {});

    const courses = [
        // IT Courses (Category 1)
        {
            title: 'Software Engineering Fundamentals',
            description: 'Introduction to software development lifecycle, design patterns, and best practices',
            category: 1, // IT
            level: 1, // Diploma
            price: 750.00,
            departmentId: departmentMap['School of Computing'],
            moduleIds: [
                moduleMap['Introduction to Programming'],
                moduleMap['Software Engineering Principles']
            ]
        },
        {
            title: 'Advanced Web Development',
            description: 'Modern web technologies including React, Node.js, and cloud deployment',
            category: 1, // IT
            level: 2, // Undergraduate
            price: 1200.00,
            departmentId: departmentMap['School of Computing'],
            moduleIds: [
                moduleMap['Web Development Fundamentals'],
                moduleMap['Database Management Systems'],
                moduleMap['Cloud Computing']
            ]
        },
        {
            title: 'Artificial Intelligence and Machine Learning',
            description: 'Advanced AI concepts, neural networks, and deep learning applications',
            category: 1, // IT
            level: 3, // Postgraduate
            price: 1500.00,
            departmentId: departmentMap['Data Science Institute'],
            moduleIds: [
                moduleMap['Artificial Intelligence'],
                moduleMap['Cloud Computing']
            ]
        },

        // Business Courses (Category 2)
        {
            title: 'Business Administration Basics',
            description: 'Foundation in business management and organizational behavior',
            category: 2, // Business
            level: 1, // Diploma
            price: 600.00,
            departmentId: departmentMap['School of Business'],
            moduleIds: [] // Add relevant modules when available
        },
        {
            title: 'Financial Management',
            description: 'Corporate finance, investment strategies, and financial analysis',
            category: 2, // Business
            level: 2, // Undergraduate
            price: 1100.00,
            departmentId: departmentMap['School of Business'],
            moduleIds: [] // Add relevant modules when available
        },
        {
            title: 'Strategic Business Leadership',
            description: 'Advanced business strategy, change management, and organizational leadership',
            category: 2, // Business
            level: 3, // Postgraduate
            price: 1400.00,
            departmentId: departmentMap['School of Business'],
            moduleIds: [] // Add relevant modules when available
        },

        // Engineering Courses (Category 3)
        {
            title: 'Engineering Principles',
            description: 'Basic engineering concepts and problem-solving methodologies',
            category: 3, // Engineering
            level: 1, // Diploma
            price: 800.00,
            departmentId: departmentMap['Department of Engineering'],
            moduleIds: [] // Add relevant modules when available
        },
        {
            title: 'Mechanical Systems Design',
            description: 'Design and analysis of mechanical systems and components',
            category: 3, // Engineering
            level: 2, // Undergraduate
            price: 1300.00,
            departmentId: departmentMap['Department of Engineering'],
            moduleIds: [] // Add relevant modules when available
        },
        {
            title: 'Advanced Robotics Engineering',
            description: 'Robotics systems design, AI integration, and automation',
            category: 3, // Engineering
            level: 3, // Postgraduate
            price: 1600.00,
            departmentId: departmentMap['Department of Engineering'],
            moduleIds: [
                moduleMap['Artificial Intelligence']
            ]
        },

        // Science Courses (Category 4)
        {
            title: 'Data Analytics Fundamentals',
            description: 'Basic concepts of data analysis and statistical methods',
            category: 4, // Science
            level: 1, // Diploma
            price: 700.00,
            departmentId: departmentMap['Data Science Institute'],
            moduleIds: [
                moduleMap['Introduction to Programming']
            ]
        },
        {
            title: 'Big Data Technologies',
            description: 'Processing and analyzing large-scale data sets using modern tools',
            category: 4, // Science
            level: 2, // Undergraduate
            price: 1250.00,
            departmentId: departmentMap['Data Science Institute'],
            moduleIds: [
                moduleMap['Database Management Systems'],
                moduleMap['Cloud Computing']
            ]
        },
        {
            title: 'Advanced Data Science',
            description: 'Advanced statistical modeling and machine learning applications',
            category: 4, // Science
            level: 3, // Postgraduate
            price: 1550.00,
            departmentId: departmentMap['Data Science Institute'],
            moduleIds: [
                moduleMap['Artificial Intelligence'],
                moduleMap['Cloud Computing']
            ]
        },

        // Art Courses (Category 5)
        {
            title: 'Digital Design Basics',
            description: 'Introduction to digital art and design principles',
            category: 5, // Art
            level: 1, // Diploma
            price: 650.00,
            departmentId: departmentMap['Digital Arts Academy'],
            moduleIds: [
                moduleMap['UI/UX Design']
            ]
        },
        {
            title: 'Interactive Media Design',
            description: 'Creating interactive digital experiences and user interfaces',
            category: 5, // Art
            level: 2, // Undergraduate
            price: 1150.00,
            departmentId: departmentMap['Digital Arts Academy'],
            moduleIds: [
                moduleMap['UI/UX Design'],
                moduleMap['Web Development Fundamentals']
            ]
        },
        {
            title: 'Advanced Digital Animation',
            description: '3D animation, motion graphics, and visual effects',
            category: 5, // Art
            level: 3, // Postgraduate
            price: 1450.00,
            departmentId: departmentMap['Digital Arts Academy'],
            moduleIds: [
                moduleMap['UI/UX Design']
            ]
        }
    ];

    console.log('Seeding courses...');

    const coursePromises = courses.map(async (course) => {
        try {
            const { moduleIds, ...courseData } = course;
            const result = await prisma.course.upsert({
                where: { title: course.title },
                update: {},
                create: {
                    ...courseData,
                    modules: {
                        create: moduleIds.map(moduleId => ({
                            module: {
                                connect: { id: moduleId }
                            }
                        }))
                    }
                },
                include: {
                    modules: {
                        include: {
                            module: true
                        }
                    }
                }
            });
            return { success: true, result };
        } catch (error) {
            return { success: false, error, course };
        }
    });

    const results = await Promise.all(coursePromises);

    results.forEach(({ success, result, error, course }) => {
        if (success) {
            console.log(`Created course: ${result.title} (ID: ${result.id}) with ${result.modules.length} modules`);
        } else {
            console.error(`Failed to create course ${course.title}:`, error);
        }
    });

    console.log('Finished seeding courses.');
} 