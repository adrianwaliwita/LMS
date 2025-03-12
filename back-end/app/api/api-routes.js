import { Router } from 'express';
import { verifyFirebaseToken } from './middlewares/fb-auth.js';
import { login } from '../controllers/login.js';
import usersRouter from './routes/users.js';

const apiRouter = Router();

// Auth routes
apiRouter.post('/login', login);

// Add Verify Firebase Token middleware to all routes
apiRouter.use(verifyFirebaseToken);

// Users routes
apiRouter.use('/users', usersRouter);

export default apiRouter;
