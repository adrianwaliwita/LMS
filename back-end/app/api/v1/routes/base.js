import { Router } from 'express';
import { serveApiDocs, setupApiDocs } from '../middlewares/docs.js';
import { verifyFirebaseToken } from '../middlewares/fb-auth.js';
import { auth } from '../../../controllers/auth.js';
import usersRouter from './users.js';
import modulesRouter from './modules.js';
import coursesRouter from './courses.js';
import batchesRouter from './batches.js';

const v1Router = Router();

// Documentation route (no auth required)
v1Router.use('/docs', serveApiDocs);
v1Router.get('/docs', setupApiDocs);

// Auth routes
v1Router.post('/auth', auth);

// Add Verify Firebase Token middleware to all routes
v1Router.use(verifyFirebaseToken);

// Other Routes
v1Router.use('/users', usersRouter);
v1Router.use('/modules', modulesRouter);
v1Router.use('/courses', coursesRouter);
v1Router.use('/batches', batchesRouter);

export default v1Router;
