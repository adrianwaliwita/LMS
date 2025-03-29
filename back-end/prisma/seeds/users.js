import { UserRoles } from '../../app/models/User.js';
import crypto from 'crypto';

export async function seedUsers(prisma) {
    // Get departments for reference
    const departments = await prisma.department.findMany();
    const departmentMap = departments.reduce((acc, dept) => {
        acc[dept.name] = dept.id;
        return acc;
    }, {});

    // Get modules grouped by department for lecturer assignments
    const modules = await prisma.module.findMany({
        include: {
            courses: {
                include: {
                    course: {
                        select: {
                            departmentId: true
                        }
                    }
                }
            }
        }
    });

    // Create a map of department IDs to their modules
    const departmentModules = modules.reduce((acc, module) => {
        // Get unique department IDs for this module
        const departmentIds = [...new Set(module.courses.map(cm => cm.course.departmentId))];
        
        departmentIds.forEach(deptId => {
            if (!acc[deptId]) {
                acc[deptId] = [];
            }
            acc[deptId].push(module.id);
        });
        return acc;
    }, {});

    // Get batches grouped by department for student assignments
    const batches = await prisma.batch.findMany({
        include: {
            course: {
                select: {
                    departmentId: true
                }
            }
        }
    });

    // Create a map of department IDs to their active batches
    const departmentBatches = batches.reduce((acc, batch) => {
        const deptId = batch.course.departmentId;
        if (!acc[deptId]) {
            acc[deptId] = [];
        }
        // Only include batches that haven't ended
        if (new Date(batch.endDate) > new Date()) {
            acc[deptId].push(batch.id);
        }
        return acc;
    }, {});

    // Generate a random Firebase UID
    function generateFirebaseUid() {
        return crypto.randomBytes(14).toString('hex');
    }

    const users = [
        // ADMIN users (Role 1)
        {
            email: 'admin1@lms.edu',
            firstName: 'John',
            lastName: 'Admin',
            role: 1,
            departmentId: departmentMap['Administration']
        },
        {
            email: 'admin2@lms.edu',
            firstName: 'Sarah',
            lastName: 'Manager',
            role: 1,
            departmentId: departmentMap['Administration']
        },
        {
            email: 'admin3@lms.edu',
            firstName: 'Michael',
            lastName: 'Director',
            role: 1,
            departmentId: departmentMap['Administration']
        },

        // COORDINATOR users (Role 2)
        {
            email: 'coordinator1@lms.edu',
            firstName: 'Emma',
            lastName: 'Coordinator',
            role: 2,
            departmentId: departmentMap['School of Computing']
        },
        {
            email: 'coordinator2@lms.edu',
            firstName: 'David',
            lastName: 'Planner',
            role: 2,
            departmentId: departmentMap['School of Business']
        },
        {
            email: 'coordinator3@lms.edu',
            firstName: 'Lisa',
            lastName: 'Organizer',
            role: 2,
            departmentId: departmentMap['Department of Engineering']
        },

        // LECTURER users (Role 3)
        {
            email: 'lecturer1@lms.edu',
            firstName: 'Robert',
            lastName: 'Teacher',
            role: 3,
            departmentId: departmentMap['School of Computing']
        },
        {
            email: 'lecturer2@lms.edu',
            firstName: 'Patricia',
            lastName: 'Instructor',
            role: 3,
            departmentId: departmentMap['School of Business']
        },
        {
            email: 'lecturer3@lms.edu',
            firstName: 'James',
            lastName: 'Professor',
            role: 3,
            departmentId: departmentMap['Data Science Institute']
        },

        // STUDENT users (Role 4)
        {
            email: 'student1@lms.edu',
            firstName: 'Alice',
            lastName: 'Student',
            role: 4,
            departmentId: departmentMap['School of Computing']
        },
        {
            email: 'student2@lms.edu',
            firstName: 'Bob',
            lastName: 'Learner',
            role: 4,
            departmentId: departmentMap['School of Business']
        },
        {
            email: 'student3@lms.edu',
            firstName: 'Charlie',
            lastName: 'Scholar',
            role: 4,
            departmentId: departmentMap['Digital Arts Academy']
        }
    ];

    console.log('Seeding users...');

    // Create users in parallel using Promise.all
    const userCreationPromises = users.map(async (userData) => {
        try {
            const firebaseUid = generateFirebaseUid();
            
            // Prepare base user data
            const createData = {
                firebaseUid,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role,
                departmentId: userData.departmentId
            };

            // For students, we'll create StudentBatch record
            if (userData.role === 4) { // STUDENT
                const availableBatches = departmentBatches[userData.departmentId] || [];
                if (availableBatches.length > 0) {
                    // Assign to a random batch from their department
                    const randomBatchId = availableBatches[Math.floor(Math.random() * availableBatches.length)];
                    createData.studentBatch = {
                        create: {
                            batchId: randomBatchId
                        }
                    };
                }
            }

            // For lecturers, we'll create LecturerModule records
            if (userData.role === 3) { // LECTURER
                const departmentModuleIds = departmentModules[userData.departmentId] || [];
                if (departmentModuleIds.length > 0) {
                    // Assign 2-3 random modules from their department
                    const numModules = Math.floor(Math.random() * 2) + 2; // 2 to 3 modules
                    const shuffledModules = [...departmentModuleIds].sort(() => 0.5 - Math.random());
                    const assignedModules = shuffledModules.slice(0, numModules);
                    
                    createData.lecturerModules = {
                        create: assignedModules.map(moduleId => ({
                            moduleId: moduleId
                        }))
                    };
                }
            }

            const result = await prisma.user.upsert({
                where: { email: userData.email },
                update: {},
                create: createData,
                include: {
                    studentBatch: true,
                    lecturerModules: {
                        include: {
                            module: true
                        }
                    }
                }
            });

            return {
                success: true,
                result,
                error: null
            };
        } catch (error) {
            return {
                success: false,
                result: null,
                error,
                userData
            };
        }
    });

    // Wait for all user creation promises to resolve
    const results = await Promise.all(userCreationPromises);

    // Log results after all operations are complete
    results.forEach(({ success, result, error, userData }) => {
        if (success) {
            console.log(`Created ${UserRoles[result.role]}: ${result.firstName} ${result.lastName} (${result.email})`);
            if (result.studentBatch) {
                console.log(`  Assigned to batch ID: ${result.studentBatch.batchId}`);
            }
            if (result.lecturerModules?.length > 0) {
                console.log(`  Assigned modules: ${result.lecturerModules.map(lm => lm.module.title).join(', ')}`);
            }
        } else {
            console.error(`Failed to create user ${userData.email}:`, error);
        }
    });

    console.log('Finished seeding users.');
} 