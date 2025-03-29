import { Department } from '../models/Department.js';
import logger from '../utils/logger.js';

export const getDepartmentById = async (req, res) => {
    const { id } = req.params;

    try {
        const department = await Department.getDepartmentById(id);

        if (!department) {
            return res.status(404).json({
                error: 'Department not found',
                message: 'No department found with the provided ID'
            });
        }

        res.json(department);
    } catch (error) {
        logger.error(`[department.getDepartmentById] Failed to retrieve department for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const listDepartments = async (req, res) => {
    const { name } = req.query;

    try {
        const departments = await Department.listDepartments({ name });
        res.json(departments);
    } catch (error) {
        logger.error('[department.listDepartments] Failed to list departments', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const createDepartment = async (req, res) => {
    const { name, description } = req.body;

    // Validate required fields
    if (!name || !description) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'name and description are required'
        });
    }

    // Validate name and description are not empty strings
    if (name.trim() === '' || description.trim() === '') {
        return res.status(400).json({
            error: 'Invalid input',
            message: `${name.trim() === '' ? 'name' : 'description'} cannot be empty`
        });
    }

    try {
        const department = await Department.createDepartment({
            name: name.trim(),
            description: description.trim()
        });

        logger.info(`[department.createDepartment] Department created successfully with name: '${name}'`);
        res.status(201).json(department);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'Department name already exists',
                message: 'A department with this name already exists'
            });
        }
        
        logger.error(`[department.createDepartment] Failed to create department with name: '${name}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const updateDepartment = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    // Validate that at least one field is provided for update
    if (!name && !description) {
        return res.status(400).json({
            error: 'Missing fields',
            message: 'At least one field (name or description) must be provided for update'
        });
    }

    // Validate name and description if provided
    if ((typeof name !== 'undefined' && name.trim() === '') || (typeof description !== 'undefined' && description.trim() === '')) {
        return res.status(400).json({
            error: 'Invalid input',
            message: `${name && name.trim() === '' ? 'name' : 'description'} cannot be empty`
        });
    }

    try {
        const department = await Department.updateDepartment({
            id,
            name: name?.trim(),
            description: description?.trim()
        });

        logger.info(`[department.updateDepartment] Department updated successfully for ID: '${id}'`);
        res.json(department);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                error: 'Department not found',
                message: 'No department found with the provided ID'
            });
        }

        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'Department name already exists',
                message: 'A department with this name already exists'
            });
        }
        
        logger.error(`[department.updateDepartment] Failed to update department for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const deleteDepartment = async (req, res) => {
    const { id } = req.params;

    try {
        await Department.deleteDepartment(id);

        logger.info(`[department.deleteDepartment] Department deleted successfully for ID: '${id}'`);
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                error: 'Department not found',
                message: 'No department found with the provided ID'
            });
        }
        
        logger.error(`[department.deleteDepartment] Failed to delete department for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
}; 