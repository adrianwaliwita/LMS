import prisma from '../utils/prisma.js';
import { Course } from './Course.js';

// Batch status based on current date and batch dates
const BatchStatus = Object.freeze({
  UPCOMING: 'UPCOMING',      // Current date < startDate
  ONGOING: 'ONGOING',       // startDate <= Current date < endDate
  COMPLETED: 'COMPLETED'    // Current date >= endDate
});

class Batch {
  constructor({ id, name, startDate, endDate, createdAt, updatedAt, course }) {
    this.id = id; 
    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.course = course ? new Course(course) : null;

    // Calculate current status
    const now = new Date();
    if (now < startDate) {
      this.status = BatchStatus.UPCOMING;
    } else if (now < endDate) {
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

  static async createBatch({ courseId, name, startDate, endDate }) {
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
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      },
      include: {
        course: true
      }
    });

    return new Batch(batch);
  }

  static async updateBatch({ id, courseId, name, startDate, endDate }) {
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
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) })
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