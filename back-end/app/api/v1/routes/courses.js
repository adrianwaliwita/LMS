import { Router } from 'express';
import { listCourses, getCourseById, createCourse, updateCourse, deleteCourse } from '../../../controllers/course.js';

const coursesRouter = Router();

// Course routes
coursesRouter.get('/', listCourses);
coursesRouter.get('/:id', getCourseById);
coursesRouter.post('/', createCourse);
coursesRouter.patch('/:id', updateCourse);
coursesRouter.delete('/:id', deleteCourse);

export default coursesRouter; 