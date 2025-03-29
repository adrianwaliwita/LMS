import { Classroom } from '../models/Classroom.js';
import logger from '../utils/logger.js';

export const getClassroomById = async (req, res) => {
    const { id } = req.params;

    try {
        const classroom = await Classroom.getClassroomById(id);

        if (!classroom) {
            return res.status(404).json({
                error: 'Classroom not found',
                message: 'No classroom found with the provided ID'
            });
        }

        res.json(classroom);
    } catch (error) {
        logger.error(`[classroom.getClassroomById] Failed to retrieve classroom for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const listClassrooms = async (req, res) => {
    const { name } = req.query;

    try {
        const classrooms = await Classroom.listClassrooms({ name });
        res.json(classrooms);
    } catch (error) {
        logger.error('[classroom.listClassrooms] Failed to list classrooms', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const createClassroom = async (req, res) => {
    const { name, capacity } = req.body;

    // Validate required fields
    if (!name || capacity === undefined) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'name and capacity are required'
        });
    }

    // Validate name is not empty
    if (!name.trim()) {
        return res.status(400).json({
            error: 'Invalid input',
            message: 'name cannot be empty'
        });
    }

    // Validate capacity is a positive number
    if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
        return res.status(400).json({
            error: 'Invalid input',
            message: 'capacity must be a positive integer'
        });
    }

    try {
        const classroom = await Classroom.createClassroom({
            name: name.trim(),
            capacity: Number(capacity)
        });

        logger.info(`[classroom.createClassroom] Classroom created successfully with name: '${name}'`);
        res.status(201).json(classroom);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'Classroom name already exists',
                message: 'A classroom with this name already exists'
            });
        }
        
        logger.error(`[classroom.createClassroom] Failed to create classroom with name: '${name}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const updateClassroom = async (req, res) => {
    const { id } = req.params;
    const { name, capacity } = req.body;

    // Validate that at least one field is provided for update
    if (!name && capacity === undefined) {
        return res.status(400).json({
            error: 'Missing fields',
            message: 'At least one field (name or capacity) must be provided for update'
        });
    }

    // Validate name if provided
    if (name && !name.trim()) {
        return res.status(400).json({
            error: 'Invalid input',
            message: 'name cannot be empty'
        });
    }

    // Validate capacity if provided
    if (capacity !== undefined && (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0)) {
        return res.status(400).json({
            error: 'Invalid input',
            message: 'capacity must be a positive integer'
        });
    }

    try {
        const classroom = await Classroom.updateClassroom({
            id,
            name: name?.trim(),
            capacity
        });

        logger.info(`[classroom.updateClassroom] Classroom updated successfully for ID: '${id}'`);
        res.json(classroom);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                error: 'Classroom not found',
                message: 'No classroom found with the provided ID'
            });
        }

        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'Classroom name already exists',
                message: 'A classroom with this name already exists'
            });
        }
        
        logger.error(`[classroom.updateClassroom] Failed to update classroom for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const deleteClassroom = async (req, res) => {
    const { id } = req.params;

    try {
        await Classroom.deleteClassroom(id);

        logger.info(`[classroom.deleteClassroom] Classroom deleted successfully for ID: '${id}'`);
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                error: 'Classroom not found',
                message: 'No classroom found with the provided ID'
            });
        }
        
        logger.error(`[classroom.deleteClassroom] Failed to delete classroom for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
}; 