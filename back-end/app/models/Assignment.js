import prisma from '../utils/prisma.js';
import { storage } from '../firebase/firebase-admin.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import logger from '../utils/logger.js';
import { Batch } from './Batch.js';
import { Module } from './Module.js';
import { User } from './User.js';

class Assignment {
    constructor({ id, batch, module, title, description, briefFileName, dueDate, creator, createdAt, updatedAt }) {
        this.id = id;
        this.batch = batch ? new Batch(batch) : null;
        this.module = module ? new Module(module) : null;
        this.title = title;
        this.description = description;
        this.briefFileName = briefFileName;
        this.isBriefUploaded = (briefFileName != null);
        this.dueDate = dueDate;
        this.creator = creator ? new User(creator) : null;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static async createAssignment({ batchId, moduleId, title, description, dueDate, createdBy }) {
        // Validate batch exists
        const batchExists = await prisma.batch.findUnique({
            where: { id: Number(batchId) }
        });

        if (!batchExists) {
            throw new Error(`Batch with ID ${batchId} does not exist`);
        }

        // Validate module exists
        const moduleExists = await prisma.module.findUnique({
            where: { id: Number(moduleId) }
        });

        if (!moduleExists) {
            throw new Error(`Module with ID ${moduleId} does not exist`);
        }

        // Create assignment
        const assignment = await prisma.assignment.create({
            data: {
                batchId: Number(batchId),
                moduleId: Number(moduleId),
                title,
                description,
                dueDate: new Date(dueDate),
                createdBy: Number(createdBy)
            },
            include: {
                batch: true,
                module: true,
                creator: true
            }
        });

        return new Assignment(assignment);
    }

    static async getAssignmentById(id) {
        const assignment = await prisma.assignment.findUnique({
            where: { id: Number(id) },
            include: {
                batch: true,
                module: true,
                creator: true
            }
        });

        return assignment ? new Assignment(assignment) : null;
    }

    static async getAllAssignments({ batchId, moduleId }) {
        try {
            const assignments = await prisma.assignment.findMany({
                where: {
                    AND: [
                        batchId ? { batchId: Number(batchId) } : {},
                        moduleId ? { moduleId: Number(moduleId) } : {}
                    ]
                },
                include: {
                    batch: true,
                    module: true,
                    creator: true
                },
                orderBy: {
                    dueDate: 'asc'
                }
            });

            return assignments.map(assignment => new Assignment(assignment));
        } catch (error) {
            logger.error('[Assignment.getAllAssignments] Error retrieving assignments', error);
            throw error;
        }
    }

    async uploadBrief(file) {
        // Encrypt file content
        const encryptedContent = encrypt(file.buffer.toString('base64'));

        // Generate filename
        const filename = `assignments/${this.id}/assignment_brief_${file.originalname}`;

        // Upload to Firebase Storage
        const bucket = storage.bucket();
        const fileRef = bucket.file(filename);

        await fileRef.save(encryptedContent, {
            metadata: {
                contentType: file.mimetype,
                metadata: {
                    encrypted: "true"
                }
            }
        });

        // Update assignment with brief filename
        await prisma.assignment.update({
            where: { id: this.id },
            data: { briefFileName: filename },
            include: {
                batch: true,
                module: true,
                creator: true
            }
        });

        // Update current instance with new data
        this.briefFileName = filename;
        this.isBriefUploaded = true;
    }

    async downloadBrief() {
        if (!this.isBriefUploaded) {
            throw new Error('Brief not uploaded for this assignment');
        }

        // Download from Firebase Storage
        const bucket = storage.bucket();
        const fileRef = bucket.file(this.briefFileName);
        const [fileRawContent] = await fileRef.download();
        let fileContent = fileRawContent.toString();

        // Decrypt the content if it is encrypted
        const [metadata] = await fileRef.getMetadata();
        if (metadata.metadata?.encrypted) {
            // Decrypt the content
            fileContent = decrypt(fileContent);
        }

        // Convert back to buffer
        return Buffer.from(fileContent, 'base64');
    }

    async makeSubmission({ studentId, file }) {
        // Encrypt file content
        const encryptedContent = encrypt(file.buffer.toString('base64'));

        // Generate filename
        const filename = `assignments/${this.id}/submissions/${studentId}_${file.originalname}`;

        // Upload to Firebase Storage
        const bucket = storage.bucket();
        const fileRef = bucket.file(filename);

        await fileRef.save(encryptedContent, {
            metadata: {
                contentType: file.mimetype,
                metadata: {
                    encrypted: "true"
                }
            }
        });

        // Create submission record
        const submission = await prisma.assignmentSubmission.create({
            data: {
                assignmentId: this.id,
                studentId: Number(studentId),
                fileName: filename
            },
            include: {
                assignment: true,
                student: true
            }
        });

        return new AssignmentSubmission(submission);
    }

    async listSubmissions() {
        const submissions = await prisma.assignmentSubmission.findMany({
            where: {
                assignmentId: this.id
            },
            include: {
                assignment: true,
                student: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return submissions.map(submission => new AssignmentSubmission(submission));
    }

    async getSubmissionById(submissionId) {
        const submission = await prisma.assignmentSubmission.findFirst({
            where: {
                AND: [
                    { id: Number(submissionId) },
                    { assignmentId: this.id }
                ]
            },
            include: {
                assignment: true,
                student: true
            }
        });

        return submission ? new AssignmentSubmission(submission) : null;
    }
}

class AssignmentSubmission {
    constructor({ id, assignment, student, fileName, createdAt, updatedAt }) {
        this.id = id;
        this.assignment = new Assignment(assignment);
        this.student = new User(student);
        this.fileName = fileName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    async downloadFile() {
        // Download from Firebase Storage
        const bucket = storage.bucket();
        const fileRef = bucket.file(this.fileName);
        const [fileRawContent] = await fileRef.download();
        let fileContent = fileRawContent.toString();

        // Decrypt the content if it is encrypted
        const [metadata] = await fileRef.getMetadata();
        if (metadata.metadata?.encrypted) {
            // Decrypt the content
            fileContent = decrypt(fileContent);
        }

        // Convert back to buffer
        return Buffer.from(fileContent, 'base64');
    }
}

export { Assignment, AssignmentSubmission }; 