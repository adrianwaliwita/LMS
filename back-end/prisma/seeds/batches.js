export async function seedBatches(prisma) {
    // Get all courses
    const courses = await prisma.course.findMany({
        select: {
            id: true,
            title: true,
            level: true
        }
    });

    console.log('Seeding batches...');

    // Helper function to generate batch name
    function generateBatchName(courseTitle, startDate, batchNumber) {
        const year = startDate.getFullYear();
        const month = String(startDate.getMonth() + 1).padStart(2, '0');
        // Create an abbreviation from the course title
        const abbreviation = courseTitle
            .split(' ')
            .map(word => word[0].toUpperCase())
            .join('');
        
        return `${abbreviation}-${year}${month}-B${batchNumber}`;
    }

    // Helper function to calculate end date based on course level
    function calculateEndDate(startDate, level) {
        const endDate = new Date(startDate);
        // Diploma (level 1): 1 year
        // Undergraduate (level 2): 3 years
        // Postgraduate (level 3): 2 years
        const durationInYears = level === 1 ? 1 : level === 2 ? 3 : 2;
        endDate.setFullYear(endDate.getFullYear() + durationInYears);
        return endDate;
    }

    // Create batch data for all courses
    const batchData = courses.flatMap(course => {
        return Array.from({ length: 5 }, (_, i) => {
            const startDate = new Date(2024, i * 3, 1); // Start on first of every 3rd month
            const endDate = calculateEndDate(startDate, course.level);
            const batchName = generateBatchName(course.title, startDate, i + 1);

            return {
                courseId: course.id,
                name: batchName,
                startDate,
                endDate,
                courseTitle: course.title // for error reporting
            };
        });
    });

    const batchPromises = batchData.map(async (batch) => {
        try {
            const result = await prisma.batch.upsert({
                where: {
                    courseId_name: {
                        courseId: batch.courseId,
                        name: batch.name
                    }
                },
                update: {},
                create: {
                    courseId: batch.courseId,
                    name: batch.name,
                    startDate: batch.startDate,
                    endDate: batch.endDate
                }
            });
            return { success: true, result, courseTitle: batch.courseTitle };
        } catch (error) {
            return { success: false, error, batch };
        }
    });

    const results = await Promise.all(batchPromises);

    results.forEach(({ success, result, error, batch, courseTitle }) => {
        if (success) {
            console.log(`Created batch: ${result.name} for course: ${courseTitle}`);
        } else {
            console.error(`Failed to create batch ${batch.name} for course ${batch.courseTitle}:`, error);
        }
    });

    console.log('Finished seeding batches.');
} 