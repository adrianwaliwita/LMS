import { Router } from 'express';
import { listDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from '../../../controllers/department.js';

const departmentsRouter = Router();

// Departments routes
departmentsRouter.get('/', listDepartments);
departmentsRouter.get('/:id', getDepartmentById);
departmentsRouter.post('/', createDepartment);
departmentsRouter.patch('/:id', updateDepartment);
departmentsRouter.delete('/:id', deleteDepartment);

export default departmentsRouter; 