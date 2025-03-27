import { Router } from 'express';
import multer from 'multer';
import { 
    createAssignment, 
    getAssignment,
    listAssignments,
    uploadBrief, 
    downloadBrief,
    makeAssignmentSubmission,
    listAssignmentSubmissions,
    downloadAssignmentSubmission
} from '../../../controllers/assignment.js';

// Configure multer for file upload
const uploadSingle = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).single('file');

// Custom middleware to handle single file uploads
const handleSingleFileUpload = (req, res, next) => {
    uploadSingle(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                error: 'File upload error',
                message: err.toString()
            });
        }
        
        if (!req.file) {
            return res.status(400).json({
                error: 'Missing file',
                message: 'Please provide a file to upload'
            });
        }

        next();
    });
};

const assignmentsRouter = Router();

// Assignment routes
assignmentsRouter.post('/', createAssignment);
assignmentsRouter.get('/', listAssignments);
assignmentsRouter.get('/:id', getAssignment);

// Assignment Brief routes
assignmentsRouter.post('/:id/upload-brief', handleSingleFileUpload, uploadBrief);
assignmentsRouter.get('/:id/download-brief', downloadBrief);

// Assignment Submission routes
assignmentsRouter.post('/:id/make-submission', handleSingleFileUpload, makeAssignmentSubmission);
assignmentsRouter.get('/:id/submissions', listAssignmentSubmissions);
assignmentsRouter.get('/:assignmentId/submissions/:submissionId/download', downloadAssignmentSubmission);

export default assignmentsRouter;