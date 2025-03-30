import Lecture from '../models/Lecture.js';
import logger from '../utils/logger.js';
import prisma from '../utils/prisma.js';
import { User } from '../models/User.js';

export const listAvailableResources = async (req, res) => {
    const { batchId, moduleId, fromDateTime: fromDateTimeString, toDateTime: toDateTimeString } = req.query;

    // Validate required fields
    if (!batchId || !moduleId || !fromDateTimeString || !toDateTimeString) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'batchId, moduleId, fromDateTime, and toDateTime are required'
        });
    }

    // Validate IDs are positive integers
    if (!Number.isInteger(Number(batchId)) || Number(batchId) <= 0) {
        return res.status(400).json({
            error: 'Invalid batch ID',
            message: 'batchId must be a positive integer'
        });
    }

    if (!Number.isInteger(Number(moduleId)) || Number(moduleId) <= 0) {
        return res.status(400).json({
            error: 'Invalid module ID',
            message: 'moduleId must be a positive integer'
        });
    }

    // Validate dates
    const fromDateTime = new Date(fromDateTimeString);
    const toDateTime = new Date(toDateTimeString);

    if (isNaN(fromDateTime.getTime()) || isNaN(toDateTime.getTime())) {
        return res.status(400).json({
            error: 'Invalid dates',
            message: 'fromDateTime and toDateTime must be valid dates'
        });
    }

    if (fromDateTime >= toDateTime) {
        return res.status(400).json({
            error: 'Invalid date range',
            message: 'startDatetime must be before endDatetime'
        });
    }

    // Check if minutes are aligned with 30-minute slots
    if (fromDateTime.getMinutes() % 30 !== 0 || toDateTime.getMinutes() % 30 !== 0) {
        return res.status(400).json({
            error: 'Invalid time slots',
            message: 'Times must be aligned with 30-minute slots (e.g., 9:00, 9:30, 10:00, etc.)'
        });
    }

    // Calculate time slots
    const fromTimeSlot = (fromDateTime.getHours() * 2) + Math.floor(fromDateTime.getMinutes() / 30);
    const toTimeSlot = (toDateTime.getHours() * 2) + Math.floor(toDateTime.getMinutes() / 30);

    try {
        // Get batch details for student count
        const batch = await prisma.batch.findUnique({
            where: { id: Number(batchId) },
            include: {
                _count: {
                    select: { students: true }
                }
            }
        });

        if (!batch) {
            return res.status(400).json({
                error: 'Invalid batch',
                message: 'The specified batch does not exist'
            });
        }

        const studentCount = batch._count.students;

        // Get module details to verify it exists
        const module = await prisma.module.findUnique({
            where: { id: Number(moduleId) },
            include: {
                lecturers: {
                    include: {
                        lecturer: true
                    }
                }
            }
        });

        if (!module) {
            return res.status(400).json({
                error: 'Invalid module',
                message: 'The specified module does not exist'
            });
        }

        const allocationDate = new Date(fromDateTime);
        allocationDate.setUTCHours(0, 0, 0, 0);

        // 1. Find available lecturers
        const busyLecturerIds = await prisma.lectureLecturerAllocation.findMany({
            where: {
                date: allocationDate,
                OR: [
                    {
                        AND: [
                            { fromTimeSlot: { lte: fromTimeSlot } },
                            { toTimeSlot: { gte: fromTimeSlot } }
                        ]
                    },
                    {
                        AND: [
                            { fromTimeSlot: { lte: toTimeSlot } },
                            { toTimeSlot: { gte: toTimeSlot } }
                        ]
                    }
                ]
            },
            select: {
                lecturerId: true
            }
        });

        const busyLecturerIdSet = new Set(busyLecturerIds.map(l => l.lecturerId));
        const availableLecturers = module.lecturers
            .filter(lm => !busyLecturerIdSet.has(lm.lecturer.id))
            .map(lm => new User(lm.lecturer));

        // 2. Find available classrooms
        const busyClassroomIds = await prisma.lectureClassroomAllocation.findMany({
            where: {
                date: allocationDate,
                OR: [
                    {
                        AND: [
                            { fromTimeSlot: { lte: fromTimeSlot } },
                            { toTimeSlot: { gte: fromTimeSlot } }
                        ]
                    },
                    {
                        AND: [
                            { fromTimeSlot: { lte: toTimeSlot } },
                            { toTimeSlot: { gte: toTimeSlot } }
                        ]
                    }
                ]
            },
            select: {
                classroomId: true
            }
        });

        const busyClassroomIdSet = new Set(busyClassroomIds.map(c => c.classroomId));
        const availableClassrooms = await prisma.classroom.findMany({
            where: {
                AND: [
                    { id: { notIn: Array.from(busyClassroomIdSet) } },
                    { capacity: { gte: studentCount } }
                ]
            },
            select: {
                id: true,
                name: true,
                capacity: true
            }
        });

        // 3. Find available equipment
        const equipmentAllocations = await prisma.lectureEquipmentAllocation.findMany({
            where: {
                date: allocationDate,
                OR: [
                    {
                        AND: [
                            { fromTimeSlot: { lte: fromTimeSlot } },
                            { toTimeSlot: { gte: fromTimeSlot } }
                        ]
                    },
                    {
                        AND: [
                            { fromTimeSlot: { lte: toTimeSlot } },
                            { toTimeSlot: { gte: toTimeSlot } }
                        ]
                    }
                ]
            },
            select: {
                equipmentId: true,
                reservedQuantity: true
            }
        });

        // Calculate reserved quantities
        const reservedQuantities = equipmentAllocations.reduce((acc, curr) => {
            acc[curr.equipmentId] = (acc[curr.equipmentId] || 0) + curr.reservedQuantity;
            return acc;
        }, {});

        // Get all equipment and calculate available quantities
        const allEquipment = await prisma.equipment.findMany({
            select: {
                id: true,
                name: true,
                quantity: true
            }
        });

        const availableEquipment = allEquipment
            .map(equipment => ({
                id: equipment.id,
                name: equipment.name,
                description: equipment.description,
                availableQuantity: equipment.quantity - (reservedQuantities[equipment.id] || 0)
            }))
            .filter(equipment => equipment.availableQuantity > 0);

        // Return all available resources
        res.json({
            lecturers: availableLecturers,
            classrooms: availableClassrooms,
            equipment: availableEquipment
        });

    } catch (error) {
        logger.error('[lecture.listAvailableResources] Failed to list available resources', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const getLectureById = async (req, res) => {
    const { id } = req.params;

    try {
        const lecture = await Lecture.getLectureById(id);

        if (!lecture) {
            return res.status(404).json({
                error: 'Lecture not found',
                message: 'No lecture found with the provided ID'
            });
        }

        res.json(lecture);
    } catch (error) {
        logger.error(`[lecture.getLectureById] Failed to retrieve lecture for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const listLectures = async (req, res) => {
    const { batchId, moduleId, lecturerId } = req.query;

    // TODO: need to list lectures only valid for current student.

    try {
        const lectures = await Lecture.listLectures({ batchId, moduleId, lecturerId });

        res.json(lectures);
    } catch (error) {
        logger.error('[lecture.listLectures] Failed to list lectures', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const createLecture = async (req, res) => {
    const { batchId, moduleId, title, scheduledFrom, scheduledTo, lecturerId, classroomIds, equipment } = req.body;

    // Validate required fields
    if (!batchId || !moduleId || !title || !scheduledFrom || !scheduledTo || !lecturerId || !classroomIds) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'batchId, moduleId, title, scheduledFrom, scheduledTo, lecturerId, and classroomIds are required'
        });
    }

    // Validate IDs are positive integers
    if (!Number.isInteger(Number(batchId)) || Number(batchId) <= 0) {
        return res.status(400).json({
            error: 'Invalid batch ID',
            message: 'batchId must be a positive integer'
        });
    }

    if (!Number.isInteger(Number(moduleId)) || Number(moduleId) <= 0) {
        return res.status(400).json({
            error: 'Invalid module ID',
            message: 'moduleId must be a positive integer'
        });
    }

    if (!Number.isInteger(Number(lecturerId)) || Number(lecturerId) <= 0) {
        return res.status(400).json({
            error: 'Invalid lecturer ID',
            message: 'lecturerId must be a positive integer'
        });
    }

    // Validate title
    if (!title.trim()) {
        return res.status(400).json({
            error: 'Invalid title',
            message: 'title cannot be empty'
        });
    }

    // Validate dates
    const fromDate = new Date(scheduledFrom);
    const toDate = new Date(scheduledTo);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return res.status(400).json({
            error: 'Invalid dates',
            message: 'scheduledFrom and scheduledTo must be valid dates'
        });
    }

    if (fromDate >= toDate) {
        return res.status(400).json({
            error: 'Invalid date range',
            message: 'scheduledFrom must be before scheduledTo'
        });
    }

    // Validate classroom IDs array
    if (!Array.isArray(classroomIds) || classroomIds.length === 0) {
        return res.status(400).json({
            error: 'Invalid classroom IDs',
            message: 'classroomIds must be a non-empty array'
        });
    }

    // Validate each classroom ID
    if (!classroomIds.every(id => Number.isInteger(Number(id)) && Number(id) > 0)) {
        return res.status(400).json({
            error: 'Invalid classroom IDs',
            message: 'All classroomIds must be positive integers'
        });
    }

    // Validate equipment if provided
    if (equipment) {
        if (!Array.isArray(equipment)) {
            return res.status(400).json({
                error: 'Invalid equipment',
                message: 'equipment must be an array'
            });
        }

        // Validate each equipment item
        for (const item of equipment) {
            if (!item.equipmentId || !item.quantity) {
                return res.status(400).json({
                    error: 'Invalid equipment item',
                    message: 'Each equipment item must have equipmentId and quantity'
                });
            }

            if (!Number.isInteger(Number(item.equipmentId)) || Number(item.equipmentId) <= 0) {
                return res.status(400).json({
                    error: 'Invalid equipment ID',
                    message: 'equipmentId must be a positive integer'
                });
            }

            if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
                return res.status(400).json({
                    error: 'Invalid quantity',
                    message: 'quantity must be a positive integer'
                });
            }
        }
    }

    try {
        const lecture = await Lecture.createLecture({
            batchId,
            moduleId,
            title,
            scheduledFrom,
            scheduledTo,
            lecturerId,
            classroomIds,
            equipment
        });

        logger.info(`[lecture.createLecture] Lecture created successfully with title: '${title}'`);
        res.status(201).json(lecture);
    } catch (error) {
        // Handle specific error cases
        if (error.message.includes('30-minute slots')) {
            return res.status(400).json({
                error: 'Invalid time slots',
                message: error.message
            });
        }

        if (error.code === 'P2002') {
            // Unique constraint violation
            return res.status(409).json({
                error: 'Scheduling conflict',
                message: 'A lecture already exists for this batch and module at the specified time'
            });
        }

        if (error.code === 'P2003') {
            // Foreign key constraint failed
            let errorMessage = 'Invalid reference';
            if (error.meta?.field_name === 'batch_id') {
                errorMessage = 'The specified batch does not exist';
            } else if (error.meta?.field_name === 'module_id') {
                errorMessage = 'The specified module does not exist';
            } else if (error.meta?.field_name === 'lecturer_id') {
                errorMessage = 'The specified lecturer does not exist';
            } else if (error.meta?.field_name === 'classroom_id') {
                errorMessage = 'One or more specified classrooms do not exist';
            } else {
                errorMessage = 'One or more specified equipment do not exist';
            }

            return res.status(400).json({
                error: 'Invalid reference',
                message: errorMessage
            });
        }

        logger.error(`[lecture.createLecture] Failed to create lecture with title: '${title}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const updateLecture = async (req, res) => {
    const { id } = req.params;
    const { title, scheduledFrom, scheduledTo, lecturerId, classroomIds, equipment } = req.body;

    // Validate that at least one field is provided for update
    if (!title && !scheduledFrom && !scheduledTo && !lecturerId && !classroomIds && !equipment) {
        return res.status(400).json({
            error: 'Missing fields',
            message: 'At least one field (title, scheduledFrom, scheduledTo, lecturerId, classroomIds, or equipment) must be provided for update'
        });
    }

    // Validate title if provided
    if (title !== undefined && !title.trim()) {
        return res.status(400).json({
            error: 'Invalid title',
            message: 'title cannot be empty'
        });
    }

    // Validate dates if either is provided
    if (scheduledFrom || scheduledTo) {
        if (!scheduledFrom || !scheduledTo) {
            return res.status(400).json({
                error: 'Missing date field',
                message: 'Both scheduledFrom and scheduledTo must be provided when updating lecture times'
            });
        }

        const fromDate = new Date(scheduledFrom);
        const toDate = new Date(scheduledTo);

        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return res.status(400).json({
                error: 'Invalid dates',
                message: 'scheduledFrom and scheduledTo must be valid dates'
            });
        }

        if (fromDate >= toDate) {
            return res.status(400).json({
                error: 'Invalid date range',
                message: 'scheduledFrom must be before scheduledTo'
            });
        }
    }

    // Validate lecturer ID if provided
    if (lecturerId !== undefined) {
        if (!Number.isInteger(Number(lecturerId)) || Number(lecturerId) <= 0) {
            return res.status(400).json({
                error: 'Invalid lecturer ID',
                message: 'lecturerId must be a positive integer'
            });
        }
    }

    // Validate classroom IDs if provided
    if (classroomIds !== undefined) {
        if (!Array.isArray(classroomIds) || classroomIds.length === 0) {
            return res.status(400).json({
                error: 'Invalid classroom IDs',
                message: 'classroomIds must be a non-empty array'
            });
        }

        if (!classroomIds.every(id => Number.isInteger(Number(id)) && Number(id) > 0)) {
            return res.status(400).json({
                error: 'Invalid classroom IDs',
                message: 'All classroomIds must be positive integers'
            });
        }
    }

    // Validate equipment if provided
    if (equipment !== undefined) {
        if (!Array.isArray(equipment)) {
            return res.status(400).json({
                error: 'Invalid equipment',
                message: 'equipment must be an array'
            });
        }

        for (const item of equipment) {
            if (!item.equipmentId || !item.quantity) {
                return res.status(400).json({
                    error: 'Invalid equipment item',
                    message: 'Each equipment item must have equipmentId and quantity'
                });
            }

            if (!Number.isInteger(Number(item.equipmentId)) || Number(item.equipmentId) <= 0) {
                return res.status(400).json({
                    error: 'Invalid equipment ID',
                    message: 'equipmentId must be a positive integer'
                });
            }

            if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
                return res.status(400).json({
                    error: 'Invalid quantity',
                    message: 'quantity must be a positive integer'
                });
            }
        }
    }

    try {
        const lecture = await Lecture.updateLecture(id, {
            title,
            scheduledFrom,
            scheduledTo,
            lecturerId,
            classroomIds,
            equipment
        });

        logger.info(`[lecture.updateLecture] Lecture updated successfully for ID: '${id}'`);
        res.json(lecture);
    } catch (error) {
        // Handle specific error cases
        if (error.code === 'P2025') { // Record not found
            return res.status(404).json({
                error: 'Lecture not found',
                message: 'No lecture found with the provided ID'
            });
        }

        if (error.message.includes('30-minute slots')) {
            return res.status(400).json({
                error: 'Invalid time slots',
                message: error.message
            });
        }

        if (error.code === 'P2003') {
            // Foreign key constraint failed
            let errorMessage = 'Invalid reference';
            if (error.meta?.field_name === 'lecturer_id') {
                errorMessage = 'The specified lecturer does not exist';
            } else if (error.meta?.field_name === 'classroom_id') {
                errorMessage = 'One or more specified classrooms do not exist';
            } else {
                errorMessage = 'One or more specified equipment do not exist';
            }
            
            return res.status(400).json({
                error: 'Invalid reference',
                message: errorMessage
            });
        }

        logger.error(`[lecture.updateLecture] Failed to update lecture for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const deleteLecture = async (req, res) => {
    const { id } = req.params;

    try {
        await Lecture.deleteLecture(id);

        logger.info(`[lecture.deleteLecture] Lecture deleted successfully for ID: '${id}'`);
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') { // Record not found
            return res.status(404).json({
                error: 'Lecture not found',
                message: 'No lecture found with the provided ID'
            });
        }

        logger.error(`[lecture.deleteLecture] Failed to delete lecture for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};