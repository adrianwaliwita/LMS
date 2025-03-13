import { auth as clientAuth } from '../firebase/firebase-client.js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import logger from '../utils/logger.js';

export const auth = async (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are strings and not empty
    if (typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ error: "Email is required and must be a string" });
    }

    if (typeof password !== 'string' || !password.trim()) {
        return res.status(400).json({ error: "Password is required and must be a string" });
    }

    try {
        // Sign in user with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);

        // Get the ID token
        const idToken = await userCredential.user.getIdTokenResult();

        logger.info(`[auth] User authenticated successfully: '${email}'`);
        res.json({ 
            token: idToken.token,
            user: {
                systemId: idToken.claims.systemId,
                firebaseUid: userCredential.user.uid,
                email: userCredential.user.email,
                role: idToken.claims.role
            }
        });
    } catch (error) {
        logger.error(`[auth] Authentication failed for email '${email}'. Error: ${error.message}`);
        res.status(401).json({ 
            error: "Invalid credentials", 
            message: error.toString() 
        });
    }
};
