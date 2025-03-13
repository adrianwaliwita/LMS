import { Router } from 'express';
import { listUsers, getUserById, createUser, updateUser, deleteUser } from '../../../controllers/user.js';

const usersRouter = Router();

// Users routes
usersRouter.get('/', listUsers);
usersRouter.get('/:id', getUserById);
usersRouter.post('/', createUser);
usersRouter.patch('/:id', updateUser);
usersRouter.delete('/:id', deleteUser);

export default usersRouter;
