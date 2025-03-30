import prisma from '../utils/prisma.js';
import { Batch } from './Batch.js';
import { Module } from './Module.js';
import { User } from './User.js';
import { Classroom } from './Classroom.js';

class Lecture {
    constructor({ id, batch, module, title, scheduledFrom, scheduledTo, lecturerAllocation, classroomAllocations, equipmentAllocations }) {
        this.id = id;
        this.batch = batch ? new Batch(batch) : null;
        this.module = module ? new Module(module) : null;
        this.title = title;
        this.scheduledFrom = scheduledFrom;
        this.scheduledTo = scheduledTo;
        this.lecturer = lecturerAllocation ? new User(lecturerAllocation.lecturer) : null;
        this.classrooms = classroomAllocations.map(allocation => new Classroom(allocation.classroom));
        this.reservedEquipment = equipmentAllocations.reduce((acc, allocation) => {
            acc.push({
                id: allocation.equipment.id,
                name: allocation.equipment.name,
                quantity: allocation.reservedQuantity
            });
            return acc;
        }, []);
    }

    static async getLectureById(id) {
        const lecture = await prisma.lecture.findUnique({
            where: { id: Number(id) },
            include: {
                batch: true,
                module: true,
                lecturerAllocation: {
                    include: {
                        lecturer: true
                    }
                },
                classroomAllocations: {
                    include: {
                        classroom: true
                    }
                },
                equipmentAllocations: {
                    include: {
                        equipment: true
                    }
                }
            }
        });

        return lecture ? new Lecture(lecture) : null;
    }

    static async listLectures({ batchId, moduleId, lecturerId }) {
        const lectures = await prisma.lecture.findMany({
            where: {
                AND: [
                    // Filter for lectures that are in progress or scheduled for future
                    {
                        scheduledTo: {
                            gte: new Date()
                        }
                    },
                    batchId ? { batchId: Number(batchId) } : {},
                    moduleId ? { moduleId: Number(moduleId) } : {},
                    lecturerId ? {
                        lecturerAllocation: {
                            lecturerId: Number(lecturerId)
                        }
                    } : {}
                ]
            },
            include: {
                batch: true,
                module: true,
                lecturerAllocation: {
                    include: {
                        lecturer: true
                    }
                },
                classroomAllocations: {
                    include: {
                        classroom: true
                    }
                },
                equipmentAllocations: {
                    include: {
                        equipment: true
                    }
                }
            },
            orderBy: {
                scheduledFrom: 'asc'
            }
        });

        return lectures.map(lecture => new Lecture(lecture));
    }

    static async createLecture({ batchId, moduleId, title, scheduledFrom, scheduledTo, lecturerId, classroomIds, equipment }) {
        // Validate that scheduledFrom and scheduledTo are aligned with 30-minute slots
        const fromDateTime = new Date(scheduledFrom);
        const toDateTime = new Date(scheduledTo);

        // Check if minutes are aligned with 30-minute slots (should be either 0 or 30)
        if (fromDateTime.getMinutes() % 30 !== 0 || toDateTime.getMinutes() % 30 !== 0) {
            throw new Error('Lecture times must be aligned with 30-minute slots (e.g., 9:00, 9:30, 10:00, etc.)');
        }

        // Calculate time slots (0-47, where each slot is 30 minutes)
        // For example: 9:00 = slot 18, 9:30 = slot 19, 10:00 = slot 20, etc.
        const fromTimeSlot = (fromDateTime.getHours() * 2) + Math.floor(fromDateTime.getMinutes() / 30);
        const toTimeSlot = (toDateTime.getHours() * 2) + Math.floor(toDateTime.getMinutes() / 30);

        // Validate time slots are within valid range (0-47)
        if (fromTimeSlot < 0 || fromTimeSlot > 47 || toTimeSlot < 0 || toTimeSlot > 47) {
            throw new Error('Time slots must be between 0 (00:00) and 47 (23:30)');
        }

        // Validate that classroom IDs are not empty
        if (!classroomIds || classroomIds.length === 0) {
            throw new Error('Classroom IDs are required');
        }

        // Create the lecture and all its related allocations in a transaction
        const lecture = await prisma.$transaction(async (tx) => {
            // Create the base lecture first
            const createdLecture = await tx.lecture.create({
                data: {
                    batchId: Number(batchId),
                    moduleId: Number(moduleId),
                    title,
                    scheduledFrom: fromDateTime,
                    scheduledTo: toDateTime
                }
            });

            // Set date to midnight UTC for allocation queries
            const allocationDate = new Date(fromDateTime);
            allocationDate.setUTCHours(0, 0, 0, 0);

            // Create all allocations in parallel
            const allocations = [
                // Lecturer allocation
                tx.lectureLecturerAllocation.create({
                    data: {
                        lectureId: createdLecture.id,
                        lecturerId: Number(lecturerId),
                        date: allocationDate,
                        fromTimeSlot,
                        toTimeSlot
                    }
                }),

                // Classroom allocations
                tx.lectureClassroomAllocation.createMany({
                    data: classroomIds.map(classroomId => ({
                        lectureId: createdLecture.id,
                        classroomId: Number(classroomId),
                        date: allocationDate,
                        fromTimeSlot,
                        toTimeSlot
                    }))
                })
            ];

            // Add equipment allocations if provided
            if (equipment?.length > 0) {
                allocations.push(
                    tx.lectureEquipmentAllocation.createMany({
                        data: equipment.map(eq => ({
                            lectureId: createdLecture.id,
                            equipmentId: Number(eq.equipmentId),
                            reservedQuantity: Number(eq.quantity),
                            date: allocationDate,
                            fromTimeSlot,
                            toTimeSlot
                        }))
                    })
                );
            }

            // Execute all allocations in parallel
            await Promise.all(allocations);

            return createdLecture;
        });

        return this.getLectureById(lecture.id);
    }

    static async updateLecture(id, { title, scheduledFrom, scheduledTo, lecturerId, classroomIds, equipment }) {
        // Validate that scheduledFrom and scheduledTo are aligned with 30-minute slots
        let isTimesUpdated = false;
        if (scheduledFrom !== undefined) {
            const fromDateTime = new Date(scheduledFrom);
            if (fromDateTime.getMinutes() % 30 !== 0) {
                throw new Error('Start time must be aligned with 30-minute slots (e.g., 9:00, 9:30, 10:00, etc.)');
            }
            isTimesUpdated = true;
        }
        if (scheduledTo !== undefined) {
            const toDateTime = new Date(scheduledTo);
            if (toDateTime.getMinutes() % 30 !== 0) {
                throw new Error('End time must be aligned with 30-minute slots (e.g., 9:00, 9:30, 10:00, etc.)');
            }
            isTimesUpdated = true;
        }

        // Update the lecture and all its related allocations in a transaction
        const lecture = await prisma.$transaction(async (tx) => {
            // Update only provided fields in the base lecture
            const updatedLecture = await tx.lecture.update({
                where: { id: Number(id) },
                data: {
                    title: title !== undefined ? title : undefined,
                    scheduledFrom: scheduledFrom !== undefined ? new Date(scheduledFrom) : undefined,
                    scheduledTo: scheduledTo !== undefined ? new Date(scheduledTo) : undefined
                }
            });

            // Find time slots and date for allocation queries
            const fromDateTime = new Date(updatedLecture.scheduledFrom);
            const toDateTime = new Date(updatedLecture.scheduledTo);

            // Check if minutes are aligned with 30-minute slots (should be either 0 or 30)
            if (fromDateTime.getMinutes() % 30 !== 0 || toDateTime.getMinutes() % 30 !== 0) {
                throw new Error('Lecture times must be aligned with 30-minute slots (e.g., 9:00, 9:30, 10:00, etc.)');
            }

            // Calculate time slots (0-47, where each slot is 30 minutes)
            const fromTimeSlot = (fromDateTime.getHours() * 2) + Math.floor(fromDateTime.getMinutes() / 30);
            const toTimeSlot = (toDateTime.getHours() * 2) + Math.floor(toDateTime.getMinutes() / 30);

            // Validate time slots are within valid range (0-47)
            if (fromTimeSlot < 0 || fromTimeSlot > 47 || toTimeSlot < 0 || toTimeSlot > 47) {
                throw new Error('Time slots must be between 0 (00:00) and 47 (23:30)');
            }

            // Set date to midnight UTC for allocation queries
            const allocationDate = new Date(fromDateTime);
            allocationDate.setUTCHours(0, 0, 0, 0);

            // Update lecturer allocation if provided
            if (lecturerId !== undefined) {
                await tx.lectureLecturerAllocation.update({
                    where: { lectureId: updatedLecture.id },
                    data: {
                        lecturerId: Number(lecturerId),
                        date: allocationDate,
                        fromTimeSlot,
                        toTimeSlot
                    }
                });
            }
            else if (isTimesUpdated) {
                await tx.lectureLecturerAllocation.update({
                    where: { lectureId: updatedLecture.id },
                    data: { date: allocationDate, fromTimeSlot, toTimeSlot }
                });
            }

            // Update classroom allocations if provided
            if (classroomIds !== undefined) {
                // Delete existing classroom allocations
                await tx.lectureClassroomAllocation.deleteMany({
                    where: { lectureId: updatedLecture.id }
                });

                // Create new classroom allocations
                await tx.lectureClassroomAllocation.createMany({
                    data: classroomIds.map(classroomId => ({
                        lectureId: updatedLecture.id,
                        classroomId: Number(classroomId),
                        date: allocationDate,
                        fromTimeSlot,
                        toTimeSlot
                    }))
                });
            }
            else if (isTimesUpdated) {
                await tx.lectureClassroomAllocation.updateMany({
                    where: { lectureId: updatedLecture.id },
                    data: { date: allocationDate, fromTimeSlot, toTimeSlot }
                });
            }

            // Update equipment allocations if provided
            if (equipment !== undefined) {
                // Delete existing equipment allocations
                await tx.lectureEquipmentAllocation.deleteMany({
                    where: { lectureId: updatedLecture.id }
                });

                // Create new equipment allocations
                await tx.lectureEquipmentAllocation.createMany({
                    data: equipment.map(eq => ({
                        lectureId: updatedLecture.id,
                        equipmentId: Number(eq.equipmentId),
                        reservedQuantity: Number(eq.quantity),
                        date: allocationDate,
                        fromTimeSlot,
                        toTimeSlot
                    }))
                });
            }
            else if (isTimesUpdated) {
                await tx.lectureEquipmentAllocation.updateMany({
                    where: { lectureId: updatedLecture.id },
                    data: { date: allocationDate, fromTimeSlot, toTimeSlot }
                });
            }

            return updatedLecture;
        });

        return this.getLectureById(lecture.id);
    }

    static async deleteLecture(id) {
        // Delete lecture and all its related allocations (will be cascaded by Prisma)
        await prisma.lecture.delete({
            where: { id: Number(id) }
        });
    }
}

export default Lecture; 