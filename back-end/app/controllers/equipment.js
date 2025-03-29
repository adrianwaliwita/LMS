import { Equipment } from '../models/Equipment.js';
import logger from '../utils/logger.js';

export const getEquipmentById = async (req, res) => {
    const { id } = req.params;

    try {
        const equipment = await Equipment.getEquipmentById(id);

        if (!equipment) {
            return res.status(404).json({
                error: 'Equipment not found',
                message: 'No equipment found with the provided ID'
            });
        }

        res.json(equipment);
    } catch (error) {
        logger.error(`[equipment.getEquipmentById] Failed to retrieve equipment for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const listEquipment = async (req, res) => {
    const { name } = req.query;

    try {
        const equipment = await Equipment.listEquipment({ name });
        res.json(equipment);
    } catch (error) {
        logger.error('[equipment.listEquipment] Failed to list equipment', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const createEquipment = async (req, res) => {
    const { name, description, quantity } = req.body;

    // Validate required fields
    if (!name || !description || quantity === undefined) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'name, description, and quantity are required'
        });
    }

    // Validate name and description are not empty
    if (!name.trim() || !description.trim()) {
        return res.status(400).json({
            error: 'Invalid input',
            message: `${!name.trim() ? 'name' : 'description'} cannot be empty`
        });
    }

    // Validate quantity is a positive number
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
        return res.status(400).json({
            error: 'Invalid input',
            message: 'quantity must be a non-negative integer'
        });
    }

    try {
        const equipment = await Equipment.createEquipment({
            name: name.trim(),
            description: description.trim(),
            quantity: Number(quantity)
        });

        logger.info(`[equipment.createEquipment] Equipment created successfully with name: '${name}'`);
        res.status(201).json(equipment);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'Equipment name already exists',
                message: 'An equipment with this name already exists'
            });
        }
        
        logger.error(`[equipment.createEquipment] Failed to create equipment with name: '${name}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const updateEquipment = async (req, res) => {
    const { id } = req.params;
    const { name, description, quantity } = req.body;

    // Validate that at least one field is provided for update
    if (!name && !description && quantity === undefined) {
        return res.status(400).json({
            error: 'Missing fields',
            message: 'At least one field (name, description, or quantity) must be provided for update'
        });
    }

    // Validate name and description if provided
    if ((name && !name.trim()) || (description && !description.trim())) {
        return res.status(400).json({
            error: 'Invalid input',
            message: `${name && !name.trim() ? 'name' : 'description'} cannot be empty`
        });
    }

    // Validate quantity if provided
    if (quantity !== undefined && (!Number.isInteger(Number(quantity)) || Number(quantity) < 0)) {
        return res.status(400).json({
            error: 'Invalid input',
            message: 'quantity must be a non-negative integer'
        });
    }

    try {
        const equipment = await Equipment.updateEquipment({
            id,
            name: name?.trim(),
            description: description?.trim(),
            quantity
        });

        logger.info(`[equipment.updateEquipment] Equipment updated successfully for ID: '${id}'`);
        res.json(equipment);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                error: 'Equipment not found',
                message: 'No equipment found with the provided ID'
            });
        }

        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'Equipment name already exists',
                message: 'An equipment with this name already exists'
            });
        }
        
        logger.error(`[equipment.updateEquipment] Failed to update equipment for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const deleteEquipment = async (req, res) => {
    const { id } = req.params;

    try {
        await Equipment.deleteEquipment(id);

        logger.info(`[equipment.deleteEquipment] Equipment deleted successfully for ID: '${id}'`);
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                error: 'Equipment not found',
                message: 'No equipment found with the provided ID'
            });
        }
        
        logger.error(`[equipment.deleteEquipment] Failed to delete equipment for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
}; 