import { Router } from 'express';
import { verifyFirebaseToken } from './fb-auth.js';
import { login } from '../controllers/login.js';
import { createUser } from '../controllers/user.js';

const router = Router();

// Auth routes
router.post('/login', login);

// Users routes
router.post('/users', verifyFirebaseToken, createUser);

export default router;
