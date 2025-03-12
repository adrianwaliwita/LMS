import { auth } from '../../firebase/firebase-admin.js';
import config from '../../utils/config.js';
import logger from '../../utils/logger.js';
/**
 * Middleware to verify Firebase ID token
 * Expects the ID token in the Authorization header as 'Bearer <token>'
 */
export const verifyFirebaseToken = async (req, res, next) => {
    if (config.firebase.disableAuth) {
        // Create a dummy user object
        req.user = {
            uid: 'dummy-user',
            email: 'dummy-user@example.com',
            role: 1 // Admin role
        };

        logger.warn('[fb-auth.verifyFirebaseToken] Firebase authentication is disabled!!');
        return next();
    }

    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'No token provided or invalid token format' 
        });
    }

    // Extract the token from the Authorization header
    const idToken = req.headers.authorization.split('Bearer ')[1];

    try {
        // Verify the token and get user data
        const decodedToken = await auth.verifyIdToken(idToken, config.firebase.checkRevokedTokens);
        
        // Add the user data to the request object
        req.user = decodedToken;

        next();
    } catch (error) {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: error.message
        });
    }
};
