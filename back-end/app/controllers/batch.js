import { Batch } from '../models/Batch.js';
import logger from '../utils/logger.js';

export const listBatches = async (req, res) => {
  try {
    const filters = {
      courseId: req.query.courseId,
      name: req.query.name
    };

    const batches = await Batch.getAllBatches(filters);
    logger.info(`[batch.listBatches] Retrieved ${batches.length} batches`);
    return res.status(200).json(batches);
  } catch (error) {
    logger.error('[batch.listBatches] Error retrieving batches', error);
    return res.status(500).json({ error: 'Server error', message: error.toString() });
  }
};

export const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await Batch.getBatchById(id);

    if (!batch) {
      logger.info(`[batch.getBatchById] Batch not found with id: ${id}`);
      return res.status(404).json({ error: 'Batch not found', message: 'No batch found with the provided ID' });
    }

    logger.info(`[batch.getBatchById] Retrieved batch with id: ${id}`);
    return res.status(200).json(batch);
  } catch (error) {
    logger.error(`[batch.getBatchById] Error retrieving batch with id: ${req.params.id}`, error);
    return res.status(500).json({ error: 'Server error', message: error.toString() });
  }
};

export const createBatch = async (req, res) => {
  try {
    const { courseId, name, startDate, endDate } = req.body;

    // Validate required fields
    if (!courseId || !name || !startDate || !endDate) {
      logger.info('[batch.createBatch] Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'courseId, name, startDate, and endDate are required'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date order
    if (end <= start) {
      return res.status(400).json({
        error: 'Invalid dates',
        message: 'End date must be after start date'
      });
    }

    const batch = await Batch.createBatch({
      courseId,
      name,
      startDate,
      endDate
    });

    logger.info(`[batch.createBatch] Created new batch with id: ${batch.id}`);
    return res.status(201).json(batch);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'Duplicate batch', 
        message: `A batch with this name already exists for this course` 
      });
    }

    if (error.message.includes('Course with ID') && error.message.includes('does not exist')) {
      logger.info(`[batch.createBatch] ${error.message}`);
      return res.status(400).json({ error: 'Invalid course ID', message: error.message });
    }

    logger.error('[batch.createBatch] Error creating batch', error);
    return res.status(500).json({ error: 'Server error', message: error.toString() });
  }
};

export const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId, name, startDate, endDate } = req.body;

    // Validate at least one field is provided
    if (!courseId && !name && !startDate && !endDate) {
      logger.info('[batch.updateBatch] No fields provided for update');
      return res.status(400).json({
        error: 'Missing fields',
        message: 'At least one field must be provided for update'
      });
    }

    // Validate dates if both are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        return res.status(400).json({
          error: 'Invalid dates',
          message: 'End date must be after start date'
        });
      }
    }

    // If only one date is provided, validate against existing dates
    if ((startDate || endDate) && !(startDate && endDate)) {
      const currentBatch = await Batch.getBatchById(id);
      if (!currentBatch) {
        return res.status(404).json({ error: 'Batch not found', message: 'No batch found with the provided ID' });
      }

      const start = startDate ? new Date(startDate) : currentBatch.startDate;
      const end = endDate ? new Date(endDate) : currentBatch.endDate;

      if (end <= start) {
        return res.status(400).json({
          error: 'Invalid dates',
          message: 'End date must be after start date'
        });
      }
    }

    const updatedBatch = await Batch.updateBatch({
      id,
      courseId,
      name,
      startDate,
      endDate
    });

    logger.info(`[batch.updateBatch] Updated batch with id: ${id}`);
    return res.status(200).json(updatedBatch);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'Duplicate batch', 
        message: `A batch with this name already exists for this course` 
      });
    }

    if (error.code === 'P2025') {
      logger.info(`[batch.updateBatch] Batch not found with id: ${req.params.id}`);
      return res.status(404).json({ error: 'Batch not found', message: 'No batch found with the provided ID' });
    }
    
    if (error.message.includes('Course with ID') && error.message.includes('does not exist')) {
      logger.info(`[batch.updateBatch] ${error.message}`);
      return res.status(400).json({ error: 'Invalid course ID', message: error.message });
    }

    logger.error(`[batch.updateBatch] Error updating batch with id: ${req.params.id}`, error);
    return res.status(500).json({ error: 'Server error', message: error.toString() });
  }
};

export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    await Batch.deleteBatch(id);

    logger.info(`[batch.deleteBatch] Deleted batch with id: ${id}`);
    return res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      logger.info(`[batch.deleteBatch] Batch not found with id: ${req.params.id}`);
      return res.status(404).json({ error: 'Batch not found', message: 'No batch found with the provided ID' });
    }

    logger.error(`[batch.deleteBatch] Error deleting batch with id: ${req.params.id}`, error);
    return res.status(500).json({ error: 'Server error', message: error.toString() });
  }
};