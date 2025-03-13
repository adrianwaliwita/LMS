import { Router } from 'express';
import { listModules, getModuleById, createModule, updateModule, deleteModule } from '../../../controllers/module.js';

const modulesRouter = Router();

// Modules routes
modulesRouter.get('/', listModules);
modulesRouter.get('/:id', getModuleById);
modulesRouter.post('/', createModule);
modulesRouter.patch('/:id', updateModule);
modulesRouter.delete('/:id', deleteModule);

export default modulesRouter; 