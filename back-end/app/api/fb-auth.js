import { auth } from '../firebase/firebase-admin.js';

/**
 * Middleware to verify Firebase ID token
 * Expects the ID token in the Authorization header as 'Bearer <token>'
 */
export const verifyFirebaseToken = async (req, res, next) => {
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
        const decodedToken = await auth.verifyIdToken(idToken);
        
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
