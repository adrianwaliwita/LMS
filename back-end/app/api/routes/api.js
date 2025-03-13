import { Router } from 'express';
import { verifyFirebaseToken } from '../middlewares/fb-auth.js';
import { login } from '../../controllers/login.js';
import usersRouter from './users.js';
import modulesRouter from './modules.js';

const apiRouter = Router();

// Auth routes
apiRouter.post('/login', login);

// Add Verify Firebase Token middleware to all routes
apiRouter.use(verifyFirebaseToken);

// Other Routes
apiRouter.use('/users', usersRouter);
apiRouter.use('/modules', modulesRouter);

export default apiRouter;
