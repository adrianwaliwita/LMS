import { Router } from 'express';
import { createLecture, getLectureById, listLectures, deleteLecture, listAvailableResources, updateLecture } from '../../../controllers/lecture.js';

const lecturesRouter = Router();

// Lecture routes
lecturesRouter.get('/', listLectures);
lecturesRouter.get('/available-resources', listAvailableResources);
lecturesRouter.get('/:id', getLectureById);
lecturesRouter.post('/', createLecture);
lecturesRouter.patch('/:id', updateLecture);
lecturesRouter.delete('/:id', deleteLecture);

export default lecturesRouter;