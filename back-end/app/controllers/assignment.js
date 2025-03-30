import { Assignment } from '../models/Assignment.js';
import { Announcement } from '../models/Announcement.js';
import logger from '../utils/logger.js';

export const createAssignment = async (req, res) => {
    try {
        const { batchId, moduleId, title, description, dueDate } = req.body;
        const createdBy = req.user.systemId; // From auth middleware

        // Validate required fields
        if (!batchId || !moduleId || !title || !description || !dueDate) {
            logger.info('[assignment.createAssignment] Missing required fields');
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'batchId, moduleId, title, description, and dueDate are required'
            });
        }

        // Validate title is not empty
        if (!title.trim()) {
            return res.status(400).json({
                error: 'Invalid input',
                message: 'title cannot be empty'
            });
        }

        // Validate description is not empty
        if (!description.trim()) {
            return res.status(400).json({
                error: 'Invalid input',
                message: 'description cannot be empty'
            });
        }

        // Validate due date is in the future
        const dueDateTime = new Date(dueDate);
        if (isNaN(dueDateTime.getTime())) {
            return res.status(400).json({
                error: 'Invalid input',
                message: 'dueDate must be a valid date'
            });
        }

        if (dueDateTime <= new Date()) {
            return res.status(400).json({
                error: 'Invalid input',
                message: 'dueDate must be in the future'
            });
        }

        const assignment = await Assignment.createAssignment({
            batchId,
            moduleId,
            title,
            description,
            dueDate,
            createdBy
        });

        // Create an announcement for the new assignment
        await Announcement.createAnnouncement({
            title: `New Assignment: ${title}`,
            content: `A new assignment "${title}" has been created for your batch.\n\nDue Date: ${new Date(dueDate).toLocaleString()}\n\n${description}`,
            category: 'ANNOUNCEMENT',
            createdBy,
            targetBatchId: batchId,
            isActive: true
        });

        logger.info(`[assignment.createAssignment] Created new assignment with id: ${assignment.id}`);
        return res.status(201).json(assignment);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'Duplicate assignment',
                message: 'An assignment with this title already exists for this batch and module'
            });
        }

        if (error.message.includes('Batch with ID') || error.message.includes('Module with ID')) {
            logger.info(`[assignment.createAssignment] ${error.message}`);
            return res.status(400).json({
                error: 'Invalid input',
                message: error.message
            });
        }

        logger.error('[assignment.createAssignment] Error creating assignment', error);
        return res.status(500).json({
            error: 'Server error',
            message: error.toString()
        });
    }
};

export const uploadBrief = async (req, res) => {
    try {
        const { id } = req.params;

        // Get assignment and check if it exists
        const assignment = await Assignment.getAssignmentById(id);
        
        if (!assignment) {
            logger.info(`[assignment.uploadBrief] Assignment not found with id: ${id}`);
            return res.status(404).json({
                error: 'Assignment not found',
                message: 'No assignment found with the provided ID'
            });
        }

        // Check if file is provided
        if (!req.file) {
            logger.info('[assignment.uploadBrief] No file provided');
            return res.status(400).json({
                error: 'Missing file',
                message: 'Brief file is required'
            });
        }

        // Check file type (allow pdf, doc, docx, zip)
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/zip',
            'application/x-zip-compressed'
        ];
        if (!allowedTypes.includes(req.file.mimetype)) {
            logger.info(`[assignment.uploadBrief] Invalid file type: ${req.file.mimetype}`);
            return res.status(400).json({
                error: 'Invalid file type',
                message: 'Only PDF, Word documents and ZIP files are allowed'
            });
        }

        // Upload the brief
        await assignment.uploadBrief(req.file);

        logger.info(`[assignment.uploadBrief] Successfully uploaded brief for assignment: ${id}`);
        return res.status(200).json(assignment);
    } catch (error) {
        logger.error(`[assignment.uploadBrief] Error uploading brief for assignment ${req.params.id}`, error);
        return res.status(500).json({
            error: 'Server error',
            message: error.toString()
        });
    }
};

export const downloadBrief = async (req, res) => {
    try {
        const { id } = req.params;

        // Get assignment and check if it exists
        const assignment = await Assignment.getAssignmentById(id);
        
        if (!assignment) {
            logger.info(`[assignment.downloadBrief] Assignment not found with id: ${id}`);
            return res.status(404).json({
                error: 'Assignment not found',
                message: 'No assignment found with the provided ID'
            });
        }

        // Download and decrypt the brief
        const fileBuffer = await assignment.downloadBrief();
        
        // Set response headers for file download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${assignment.briefFileName.split('/').pop()}"`);
        
        // Send the file
        res.send(fileBuffer);

        logger.info(`[assignment.downloadBrief] Successfully downloaded brief for assignment: ${id}`);
    } catch (error) {
        if (error.message.includes('Brief not uploaded for this assignment')) {
            logger.info(`[assignment.downloadBrief] ${error.message}`);
            return res.status(404).json({
                error: 'Brief not found',
                message: error.message
            });
        }
        
        logger.error(`[assignment.downloadBrief] Error downloading brief for assignment ${req.params.id}`, error);
        res.status(500).json({
            error: 'Server error',
            message: error.toString()
        });
    }
};

export const getAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await Assignment.getAssignmentById(id);

        if (!assignment) {
            return res.status(404).json({
                error: 'Assignment not found',
                message: 'No assignment found with the provided ID'
            });
        }

        logger.info(`[assignment.getAssignment] Retrieved assignment with id: ${id}`);
        return res.status(200).json(assignment);
    } catch (error) {
        logger.error(`[assignment.getAssignment] Error retrieving assignment with id: ${req.params.id}`, error);
        return res.status(500).json({
            error: 'Server error',
            message: error.toString()
        });
    }
};

export const listAssignments = async (req, res) => {
    try {
        const { batchId, moduleId } = req.query;

        // Validate filter values if provided
        if (batchId && isNaN(Number(batchId))) {
            return res.status(400).json({
                error: 'Invalid input',
                message: 'batchId must be a number'
            });
        }

        if (moduleId && isNaN(Number(moduleId))) {
            return res.status(400).json({
                error: 'Invalid input',
                message: 'moduleId must be a number'
            });
        }

        const assignments = await Assignment.getAllAssignments({ batchId, moduleId });
        
        logger.info(`[assignment.listAssignments] Retrieved ${assignments.length} assignments`);
        return res.status(200).json(assignments);
    } catch (error) {
        logger.error('[assignment.listAssignments] Error retrieving assignments', error);
        return res.status(500).json({
            error: 'Server error',
            message: error.toString()
        });
    }
};

export const makeAssignmentSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user.systemId; // From auth middleware

        // Get assignment and check if it exists
        const assignment = await Assignment.getAssignmentById(id);
        
        if (!assignment) {
            logger.info(`[assignment.submitAssignment] Assignment not found with id: ${id}`);
            return res.status(404).json({
                error: 'Assignment not found',
                message: 'No assignment found with the provided ID'
            });
        }

        // Check if assignment due date has passed
        if (new Date(assignment.dueDate) < new Date()) {
            logger.info(`[assignment.submitAssignment] Assignment ${id} submission after due date`);
            return res.status(400).json({
                error: 'Late submission',
                message: 'Assignment submission deadline has passed'
            });
        }

        // Check file type (allow pdf, doc, docx, zip)
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/zip',
            'application/x-zip-compressed'
        ];
        if (!allowedTypes.includes(req.file.mimetype)) {
            logger.info(`[assignment.submitAssignment] Invalid file type: ${req.file.mimetype}`);
            return res.status(400).json({
                error: 'Invalid file type',
                message: 'Only PDF, Word documents and ZIP files are allowed'
            });
        }

        // Submit the assignment
        const submission = await assignment.makeSubmission({
            studentId,
            file: req.file
        });

        logger.info(`[assignment.submitAssignment] Successfully submitted assignment ${id} for student ${studentId}`);
        return res.status(201).json(submission);
    } catch (error) {
        if (error.code === 'P2002') {
            logger.info(`[assignment.submitAssignment] Student ${req.user.systemId} has already submitted assignment ${req.params.id}`);
            return res.status(409).json({
                error: 'Duplicate submission',
                message: 'You have already submitted this assignment'
            });
        }

        logger.error(`[assignment.submitAssignment] Error submitting assignment ${req.params.id} for student ${req.user.systemId}`, error);
        return res.status(500).json({
            error: 'Server error',
            message: error.toString()
        });
    }
};

export const listAssignmentSubmissions = async (req, res) => {
    try {
        const { id } = req.params;

        // Get assignment and check if it exists
        const assignment = await Assignment.getAssignmentById(id);
        
        if (!assignment) {
            logger.info(`[assignment.listAssignmentSubmissions] Assignment not found with id: ${id}`);
            return res.status(404).json({
                error: 'Assignment not found',
                message: 'No assignment found with the provided ID'
            });
        }

        // Get submissions
        const submissions = await assignment.listSubmissions();
        
        logger.info(`[assignment.listAssignmentSubmissions] Retrieved ${submissions.length} submissions for assignment ${id}`);
        return res.status(200).json(submissions);
    } catch (error) {
        logger.error(`[assignment.listAssignmentSubmissions] Error retrieving submissions for assignment ${req.params.id}`, error);
        return res.status(500).json({
            error: 'Server error',
            message: error.toString()
        });
    }
};

export const downloadAssignmentSubmission = async (req, res) => {
    try {
        const { assignmentId, submissionId } = req.params;

        // Get assignment and check if it exists
        const assignment = await Assignment.getAssignmentById(assignmentId);
        
        if (!assignment) {
            logger.info(`[assignment.downloadAssignmentSubmission] Assignment not found with id: ${assignmentId}`);
            return res.status(404).json({
                error: 'Assignment not found',
                message: 'No assignment found with the provided ID'
            });
        }

        // Get and verify submission
        const submission = await assignment.getSubmissionById(submissionId);

        if (!submission) {
            logger.info(`[assignment.downloadSubmission] Submission not found with id: ${submissionId}`);
            return res.status(404).json({
                error: 'Submission not found',
                message: 'No submission found with the provided ID'
            });
        }

        // Verify access rights (only allow student to download their own submission or staff members)
        if (req.user.role > 3 && req.user.systemId !== submission.student.id) { // 3 is LECTURER role
            logger.info(`[assignment.downloadSubmission] Unauthorized access attempt by user ${req.user.systemId}`);
            return res.status(403).json({
                error: 'Unauthorized',
                message: 'You do not have permission to access this submission'
            });
        }

        // Download and decrypt the submission
        const fileBuffer = await submission.downloadFile();
        
        // Set response headers for file download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${submission.fileName.split('/').pop()}"`);
        
        // Send the file
        res.send(fileBuffer);

        logger.info(`[assignment.downloadSubmission] Successfully downloaded submission ${submissionId} for assignment ${assignmentId}`);
    } catch (error) {
        logger.error(`[assignment.downloadSubmission] Error downloading submission ${req.params.submissionId}`, error);
        return res.status(500).json({
            error: 'Server error',
            message: error.toString()
        });
    }
}; 