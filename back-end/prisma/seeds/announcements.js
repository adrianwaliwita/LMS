import { AnnouncementCategory } from '@prisma/client';

export async function seedAnnouncements(prisma) {
    // Get active batches
    const batches = await prisma.batch.findMany({
        where: {
            endDate: {
                gt: new Date()
            }
        }
    });

    // Get users by role for announcement creators
    const users = await prisma.user.findMany({
        where: {
            role: {
                in: [1, 2, 3] // ADMIN, COORDINATOR, LECTURER roles can create announcements
            }
        }
    });

    // Prepare announcement data
    const announcements = [
        // Active announcements
        {
            title: 'Welcome to the New Semester',
            content: 'Welcome to all students! We hope you have a great learning experience.',
            category: AnnouncementCategory.ANNOUNCEMENT,
            isActive: true,
            // Will be assigned to a random batch
        },
        {
            title: 'System Maintenance Notice',
            content: 'The LMS will be undergoing maintenance this weekend. Please plan accordingly.',
            category: AnnouncementCategory.ANNOUNCEMENT,
            isActive: true,
            targetBatchId: null // Global announcement
        },
        {
            title: 'Annual Tech Symposium',
            content: 'Join us for our annual technology symposium featuring industry experts.',
            category: AnnouncementCategory.EVENT,
            isActive: true,
            // Will be assigned to a random batch
        },
        {
            title: 'Library Resources Update',
            content: 'New digital resources have been added to the library. Check them out!',
            category: AnnouncementCategory.ANNOUNCEMENT,
            isActive: true,
            targetBatchId: null // Global announcement
        },
        {
            title: 'Guest Lecture Series',
            content: 'Distinguished professors from leading universities will be conducting guest lectures.',
            category: AnnouncementCategory.EVENT,
            isActive: true,
            // Will be assigned to a random batch
        },
        {
            title: 'Student Achievement Awards',
            content: 'Nominations are now open for the annual student achievement awards.',
            category: AnnouncementCategory.ANNOUNCEMENT,
            isActive: true,
            targetBatchId: null // Global announcement
        },
        {
            title: 'Career Fair 2024',
            content: 'Annual career fair with opportunities from leading tech companies.',
            category: AnnouncementCategory.EVENT,
            isActive: true,
            // Will be assigned to a random batch
        },

        // Inactive announcements
        {
            title: 'Outdated Policy Notice',
            content: 'This announcement contains outdated policy information.',
            category: AnnouncementCategory.ANNOUNCEMENT,
            isActive: false,
            targetBatchId: null // Global announcement
        },
        {
            title: 'Past Workshop Event',
            content: 'This workshop has already been conducted.',
            category: AnnouncementCategory.EVENT,
            isActive: false,
            // Will be assigned to a random batch
        },
        {
            title: 'Expired Registration Notice',
            content: 'The registration period for this event has ended.',
            category: AnnouncementCategory.ANNOUNCEMENT,
            isActive: false,
            // Will be assigned to a random batch
        }
    ];

    console.log('Seeding announcements...');

    // Create announcements in parallel using Promise.all
    const announcementCreationPromises = announcements.map(async (announcementData) => {
        try {
            // Randomly assign a creator from eligible users
            const creator = users[Math.floor(Math.random() * users.length)];

            // For announcements that need a batch, randomly assign one
            let targetBatchId = announcementData.targetBatchId;
            if (targetBatchId === undefined && batches.length > 0) {
                const randomBatch = batches[Math.floor(Math.random() * batches.length)];
                targetBatchId = randomBatch.id;
            }

            const result = await prisma.announcement.create({
                data: {
                    title: announcementData.title,
                    content: announcementData.content,
                    category: announcementData.category,
                    isActive: announcementData.isActive,
                    targetBatchId: targetBatchId,
                    createdBy: creator.id
                },
                include: {
                    batch: true,
                    creator: true
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
                announcementData
            };
        }
    });

    // Wait for all announcement creation promises to resolve
    const results = await Promise.all(announcementCreationPromises);

    // Log results after all operations are complete
    results.forEach(({ success, result, error, announcementData }) => {
        if (success) {
            console.log(`Created announcement: ${result.title}`);
            console.log(`  Status: ${result.isActive ? 'Active' : 'Inactive'}`);
            console.log(`  Category: ${result.category}`);
            console.log(`  Created by: ${result.creator.firstName} ${result.creator.lastName}`);
            if (result.batch) {
                console.log(`  Target batch: ${result.batch.name}`);
            } else {
                console.log('  Global announcement');
            }
        } else {
            console.error(`Failed to create announcement "${announcementData.title}":`, error);
        }
    });

    console.log('Finished seeding announcements.');
} 