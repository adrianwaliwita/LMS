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
    return res.status(500).json({ error: 'Server error', message: 'Failed to retrieve batches' });
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
    return res.status(500).json({ error: 'Server error', message: 'Failed to retrieve batch' });
  }
};

export const createBatch = async (req, res) => {
  try {
    const { courseId, name, enrollStartDate, enrollEndDate, batchStartDate, batchEndDate } = req.body;

    // Validate required fields
    if (!courseId || !name || !enrollStartDate || !enrollEndDate || !batchStartDate || !batchEndDate) {
      logger.info('[batch.createBatch] Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'courseId, name, enrollStartDate, enrollEndDate, batchStartDate, and batchEndDate are required'
      });
    }

    // Validate dates
    const now = new Date();
    const enrollStart = new Date(enrollStartDate);
    const enrollEnd = new Date(enrollEndDate);
    const batchStart = new Date(batchStartDate);
    const batchEnd = new Date(batchEndDate);

    // Validate date order
    if (enrollEnd <= enrollStart) {
      return res.status(400).json({
        error: 'Invalid dates',
        message: 'Enrollment end date must be after enrollment start date'
      });
    }

    if (batchEnd <= batchStart) {
      return res.status(400).json({
        error: 'Invalid dates',
        message: 'Batch end date must be after batch start date'
      });
    }

    if (batchStart < enrollEnd) {
      return res.status(400).json({
        error: 'Invalid dates',
        message: 'Batch start date must be after enrollment end date'
      });
    }

    const batch = await Batch.createBatch({
      courseId,
      name,
      enrollStartDate,
      enrollEndDate,
      batchStartDate,
      batchEndDate
    });

    logger.info(`[batch.createBatch] Created new batch with id: ${batch.id}`);
    return res.status(201).json(batch);
  } catch (error) {
    if (error.message.includes('Course with ID') && error.message.includes('does not exist')) {
      logger.info(`[batch.createBatch] ${error.message}`);
      return res.status(400).json({ error: 'Invalid course ID', message: error.message });
    }

    logger.error('[batch.createBatch] Error creating batch', error);
    return res.status(500).json({ error: 'Server error', message: 'Failed to create batch' });
  }
};

export const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId, name, enrollStartDate, enrollEndDate, batchStartDate, batchEndDate } = req.body;

    // Validate at least one field is provided
    if (!courseId && !name && !enrollStartDate && !enrollEndDate && !batchStartDate && !batchEndDate) {
      logger.info('[batch.updateBatch] No fields provided for update');
      return res.status(400).json({
        error: 'Missing fields',
        message: 'At least one field must be provided for update'
      });
    }

    // Validate dates if provided
    if (enrollStartDate && enrollEndDate) {
      const enrollStart = new Date(enrollStartDate);
      const enrollEnd = new Date(enrollEndDate);
      if (enrollEnd <= enrollStart) {
        return res.status(400).json({
          error: 'Invalid dates',
          message: 'Enrollment end date must be after enrollment start date'
        });
      }
    }

    if (batchStartDate && batchEndDate) {
      const batchStart = new Date(batchStartDate);
      const batchEnd = new Date(batchEndDate);
      if (batchEnd <= batchStart) {
        return res.status(400).json({
          error: 'Invalid dates',
          message: 'Batch end date must be after batch start date'
        });
      }
    }

    // Get current batch to validate date changes
    if ((enrollEndDate || batchStartDate) && !(enrollEndDate && batchStartDate)) {
      const currentBatch = await Batch.getBatchById(id);
      if (!currentBatch) {
        return res.status(404).json({ error: 'Batch not found', message: 'No batch found with the provided ID' });
      }

      const enrollEnd = enrollEndDate ? new Date(enrollEndDate) : currentBatch.enrollEndDate;
      const batchStart = batchStartDate ? new Date(batchStartDate) : currentBatch.batchStartDate;

      if (batchStart < enrollEnd) {
        return res.status(400).json({
          error: 'Invalid dates',
          message: 'Batch start date must be after enrollment end date'
        });
      }
    }

    const updatedBatch = await Batch.updateBatch({
      id,
      courseId,
      name,
      enrollStartDate,
      enrollEndDate,
      batchStartDate,
      batchEndDate
    });

    logger.info(`[batch.updateBatch] Updated batch with id: ${id}`);
    return res.status(200).json(updatedBatch);
  } catch (error) {
    if (error.code === 'P2025') {
      logger.info(`[batch.updateBatch] Batch not found with id: ${req.params.id}`);
      return res.status(404).json({ error: 'Batch not found', message: 'No batch found with the provided ID' });
    }
    
    if (error.message.includes('Course with ID') && error.message.includes('does not exist')) {
      logger.info(`[batch.updateBatch] ${error.message}`);
      return res.status(400).json({ error: 'Invalid course ID', message: error.message });
    }

    logger.error(`[batch.updateBatch] Error updating batch with id: ${req.params.id}`, error);
    return res.status(500).json({ error: 'Server error', message: 'Failed to update batch' });
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
    return res.status(500).json({ error: 'Server error', message: 'Failed to delete batch' });
  }
}; 