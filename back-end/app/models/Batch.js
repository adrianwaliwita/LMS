import prisma from '../utils/prisma.js';
import { Course } from './Course.js';

// Batch status based on current date and batch dates
const BatchStatus = Object.freeze({
  UPCOMING: 'UPCOMING',      // Current date < enrollStartDate
  ENROLLING: 'ENROLLING',   // enrollStartDate <= Current date < enrollEndDate
  PENDING: 'PENDING',       // enrollEndDate <= Current date < batchStartDate
  ONGOING: 'ONGOING',       // batchStartDate <= Current date < batchEndDate
  COMPLETED: 'COMPLETED'    // Current date >= batchEndDate
});

class Batch {
  constructor({ id, courseId, name, enrollStartDate, enrollEndDate, batchStartDate, batchEndDate, createdAt, updatedAt, course }) {
    this.id = id;
    this.courseId = courseId;
    this.name = name;
    this.enrollStartDate = enrollStartDate;
    this.enrollEndDate = enrollEndDate;
    this.batchStartDate = batchStartDate;
    this.batchEndDate = batchEndDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.course = course ? new Course(course) : null;

    // Calculate current status
    const now = new Date();
    if (now < enrollStartDate) {
      this.status = BatchStatus.UPCOMING;
    } else if (now < enrollEndDate) {
      this.status = BatchStatus.ENROLLING;
    } else if (now < batchStartDate) {
      this.status = BatchStatus.PENDING;
    } else if (now < batchEndDate) {
      this.status = BatchStatus.ONGOING;
    } else {
      this.status = BatchStatus.COMPLETED;
    }
  }

  static async getAllBatches({ courseId, name } = {}) {
    const batches = await prisma.batch.findMany({
      where: {
        ...(courseId && { courseId: Number(courseId) }),
        ...(name && { name: { contains: name } })
      },
      include: {
        course: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return batches.map(batch => new Batch(batch));
  }

  static async getBatchById(id) {
    const batch = await prisma.batch.findUnique({
      where: { id: Number(id) },
      include: {
        course: true
      }
    });

    return batch ? new Batch(batch) : null;
  }

  static async createBatch({ courseId, name, enrollStartDate, enrollEndDate, batchStartDate, batchEndDate }) {
    // Validate course exists
    const courseExists = await prisma.course.findUnique({
      where: { id: Number(courseId) }
    });

    if (!courseExists) {
      throw new Error(`Course with ID ${courseId} does not exist`);
    }

    const batch = await prisma.batch.create({
      data: {
        courseId: Number(courseId),
        name,
        enrollStartDate: new Date(enrollStartDate),
        enrollEndDate: new Date(enrollEndDate),
        batchStartDate: new Date(batchStartDate),
        batchEndDate: new Date(batchEndDate)
      },
      include: {
        course: true
      }
    });

    return new Batch(batch);
  }

  static async updateBatch({ id, courseId, name, enrollStartDate, enrollEndDate, batchStartDate, batchEndDate }) {
    // If courseId is provided, validate it exists
    if (courseId !== undefined) {
      const courseExists = await prisma.course.findUnique({
        where: { id: Number(courseId) }
      });

      if (!courseExists) {
        throw new Error(`Course with ID ${courseId} does not exist`);
      }
    }

    const updatedBatch = await prisma.batch.update({
      where: { id: Number(id) },
      data: {
        ...(courseId !== undefined && { courseId: Number(courseId) }),
        ...(name !== undefined && { name }),
        ...(enrollStartDate !== undefined && { enrollStartDate: new Date(enrollStartDate) }),
        ...(enrollEndDate !== undefined && { enrollEndDate: new Date(enrollEndDate) }),
        ...(batchStartDate !== undefined && { batchStartDate: new Date(batchStartDate) }),
        ...(batchEndDate !== undefined && { batchEndDate: new Date(batchEndDate) })
      },
      include: {
        course: true
      }
    });

    return new Batch(updatedBatch);
  }

  static async deleteBatch(id) {
    await prisma.batch.delete({
      where: { id: Number(id) }
    });
  }
}

export { BatchStatus, Batch };