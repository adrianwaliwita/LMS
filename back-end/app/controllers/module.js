import { Module } from '../models/Module.js';
import logger from '../utils/logger.js';

export const getModuleById = async (req, res) => {
    const { id } = req.params;

    try {
        const module = await Module.getModuleById(id);

        if (!module) {
            return res.status(404).json({
                error: 'Module not found',
                message: 'No module found with the provided ID'
            });
        }

        res.json(module);
    } catch (error) {
        logger.error(`[module.getModuleById] Failed to retrieve module for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const listModules = async (req, res) => {
    const { title } = req.query;

    try {
        const modules = await Module.listModules({ title });

        res.json(modules);
    } catch (error) {
        logger.error('[module.listModules] Failed to list modules', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const createModule = async (req, res) => {
    const { title, description } = req.body;

    // Validate required fields
    if (!title || !description) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'title and description are required'
        });
    }

    try {
        const module = await Module.createModule({
            title,
            description
        });

        logger.info(`[module.createModule] Module created successfully with title: '${title}'`);
        res.status(201).json(module);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'Title already exists',
                message: 'A module with this title already exists'
            });
        }
        
        logger.error(`[module.createModule] Failed to create module with title: '${title}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const updateModule = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    // Validate that at least one field is provided for update
    if (!title && !description) {
        return res.status(400).json({
            error: 'Missing fields',
            message: 'At least one field (title, description) must be provided for update'
        });
    }

    // Validate title and description if provided
    if (!title?.trim() || !description?.trim()) {
        return res.status(400).json({
            error: 'Invalid input',
            message: `${!title?.trim() ? 'title' : 'description'} cannot be empty`
        });
    }

    try {
        const module = await Module.updateModule({ id, title, description });

        logger.info(`[module.updateModule] Module updated successfully for ID: '${id}'`);
        res.json(module);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                error: 'Module not found',
                message: 'No module found with the provided ID'
            });
        }

        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'Title already exists',
                message: 'A module with this title already exists'
            });
        }
        
        logger.error(`[module.updateModule] Failed to update module for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const deleteModule = async (req, res) => {
    const { id } = req.params;

    try {
        await Module.deleteModule(id);

        logger.info(`[module.deleteModule] Module deleted successfully for ID: '${id}'`);
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') { // Record not found
            return res.status(404).json({
                error: 'Module not found',
                message: 'No module found with the provided ID'
            });
        }
        
        logger.error(`[module.deleteModule] Failed to delete module for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
}; 