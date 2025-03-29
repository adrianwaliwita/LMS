import { Router } from 'express';
import { listClassrooms, getClassroomById, createClassroom, updateClassroom, deleteClassroom } from '../../../controllers/classroom.js';

const classroomsRouter = Router();

// Classrooms routes
classroomsRouter.get('/', listClassrooms);
classroomsRouter.get('/:id', getClassroomById);
classroomsRouter.post('/', createClassroom);
classroomsRouter.patch('/:id', updateClassroom);
classroomsRouter.delete('/:id', deleteClassroom);

export default classroomsRouter; 