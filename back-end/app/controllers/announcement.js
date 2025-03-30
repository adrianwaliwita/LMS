import { Announcement, AnnouncementCategory } from '../models/Announcement.js';
import logger from '../utils/logger.js';

export const getAnnouncementById = async (req, res) => {
    const { id } = req.params;

    try {
        const announcement = await Announcement.getAnnouncementById(id);

        if (!announcement) {
            return res.status(404).json({
                error: 'Announcement not found',
                message: 'No announcement found with the provided ID'
            });
        }

        res.json(announcement);
    } catch (error) {
        logger.error(`[announcement.getAnnouncementById] Failed to retrieve announcement for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const listAnnouncements = async (req, res) => {
    const { targetBatchId, category } = req.query;
    let isActive = req.query.isActive;

    // TODO: Only return global and related batch announcements for students.

    // Only return active announcements if 'isActive' is not provided
    if (isActive === undefined) {
        isActive = true;
    }
    else {
        // If isActive is provided, convert it to a boolean
        isActive = isActive !== 'false';
    }


    try {
        const announcements = await Announcement.listAnnouncements({ 
            targetBatchId, 
            category, 
            isActive
        });

        res.json(announcements);
    } catch (error) {
        logger.error('[announcement.listAnnouncements] Failed to list announcements', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const createAnnouncement = async (req, res) => {
    const { title, content, category, targetBatchId } = req.body;
    let isActive = req.body.isActive;
    const createdBy = req.user.systemId; // Get the user's system ID from the authenticated user

    // Validate required fields
    if (!title || !content) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'title and content are required'
        });
    }

    // Validate title and content
    if (!title.trim() || !content.trim()) {
        return res.status(400).json({
            error: 'Invalid input',
            message: `${!title.trim() ? 'title' : 'content'} cannot be empty`
        });
    }

    // Validate category if provided
    if (category && !Object.values(AnnouncementCategory).includes(category)) {
        return res.status(400).json({
            error: 'Invalid category',
            message: `category must be one of: ${Object.values(AnnouncementCategory).join(', ')}`
        });
    }

    // Validate targetBatchId if provided
    if (targetBatchId !== undefined && (!Number.isInteger(Number(targetBatchId)) || Number(targetBatchId) <= 0)) {
        return res.status(400).json({
            error: 'Invalid batch ID',
            message: 'targetBatchId must be a positive integer'
        });
    }

    // If isActive is provided, convert it to a boolean if not already
    if (isActive !== undefined) {
        if (typeof isActive !== 'boolean') {
            isActive = isActive !== 'false';
        }
    }
    else {
        isActive = true;
    }

    try {
        const announcement = await Announcement.createAnnouncement({
            title,
            content,
            category,
            createdBy,
            targetBatchId,
            isActive
        });

        logger.info(`[announcement.createAnnouncement] Announcement created successfully with title: '${title}'`);
        res.status(201).json(announcement);
    } catch (error) {
        if (error.code === 'P2003' && error.meta?.field_name === 'target_batch_id') {
            return res.status(400).json({
                error: 'Invalid batch',
                message: 'The specified batch does not exist'
            });
        }

        logger.error(`[announcement.createAnnouncement] Failed to create announcement with title: '${title}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const updateAnnouncement = async (req, res) => {
    const { id } = req.params;
    const { title, content, category, targetBatchId } = req.body;
    let isActive = req.body.isActive;

    // Validate that at least one field is provided for update
    if (!title && !content && !category && isActive === undefined && targetBatchId === undefined) {
        return res.status(400).json({
            error: 'Missing fields',
            message: 'At least one field must be provided for update'
        });
    }

    // Validate title and content if provided
    if (title !== undefined && !title.trim() || content !== undefined && !content.trim()) {
        return res.status(400).json({
            error: 'Invalid input',
            message: `${!title?.trim() ? 'title' : 'content'} cannot be empty`
        });
    }

    // Validate category if provided
    if (category !== undefined && !Object.values(AnnouncementCategory).includes(category)) {
        return res.status(400).json({
            error: 'Invalid category',
            message: `category must be one of: ${Object.values(AnnouncementCategory).join(', ')}`
        });
    }

    // Validate targetBatchId if provided
    if (targetBatchId !== undefined && targetBatchId !== null && (!Number.isInteger(Number(targetBatchId)) || Number(targetBatchId) <= 0)) {
        return res.status(400).json({
            error: 'Invalid batch ID',
            message: 'targetBatchId must be a positive integer'
        });
    }

    // If isActive is provided, convert it to a boolean if not already
    if (isActive !== undefined) {
        if (typeof isActive !== 'boolean') {
            isActive = isActive !== 'false';
        }
    }

    try {
        const announcement = await Announcement.updateAnnouncement(id, {
            title,
            content,
            category,
            isActive,
            targetBatchId
        });

        logger.info(`[announcement.updateAnnouncement] Announcement updated successfully for ID: '${id}'`);
        res.json(announcement);
    } catch (error) {
        if (error.code === 'P2025') { // Record not found
            return res.status(404).json({
                error: 'Announcement not found',
                message: 'No announcement found with the provided ID'
            });
        }

        if (error.code === 'P2003' && error.meta?.field_name === 'target_batch_id') {
            return res.status(400).json({
                error: 'Invalid batch',
                message: 'The specified batch does not exist'
            });
        }

        logger.error(`[announcement.updateAnnouncement] Failed to update announcement for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const deleteAnnouncement = async (req, res) => {
    const { id } = req.params;

    try {
        await Announcement.deleteAnnouncement(id);

        logger.info(`[announcement.deleteAnnouncement] Announcement deleted successfully for ID: '${id}'`);
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') { // Record not found
            return res.status(404).json({
                error: 'Announcement not found',
                message: 'No announcement found with the provided ID'
            });
        }

        logger.error(`[announcement.deleteAnnouncement] Failed to delete announcement for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
}; 