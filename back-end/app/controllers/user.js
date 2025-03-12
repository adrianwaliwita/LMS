import User from '../models/User.js';
import logger from '../utils/logger.js';

export const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.getUserById(id);

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'No user found with the provided ID'
            });
        }

        res.json(user);
    } catch (error) {
        logger.error(`[user.getUserById] Failed to retrieve user for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
}; 

export const listUsers = async (req, res) => {
    const { role, email } = req.query;

    try {
        const users = await User.listUsers({ role, email });

        res.json(users);
    } catch (error) {
        logger.error('[user.listUsers] Failed to list users', error);

        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const createUser = async (req, res) => {
    const { email, password, firstName, lastName, role } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || role === undefined) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'email, password, firstName, lastName, and role are required'
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: 'Invalid email',
            message: 'Please provide a valid email address'
        });
    }

    // Validate password strength
    if (password.length < 6) {
        return res.status(400).json({
            error: 'Weak password',
            message: 'Password must be at least 6 characters long'
        });
    }

    // Validate role
    const validRoles = [0, 1, 2, 3, 4]; // (0: Terminated, 1: Admin, 2: Coodinator, 3: Lecturer, 4: Student) 
    if (!validRoles.includes(Number(role))) {
        return res.status(400).json({
            error: 'Invalid role',
            message: 'Role must be 0 (Terminated), 1 (Admin), 2 (Coordinator), 3 (Lecturer), or 4 (Student)'
        });
    }

    try {
        const user = await User.createUser({
            email,
            password,
            firstName,
            lastName,
            role: Number(role)
        });

        logger.info(`[user.createUser] User created successfully for email: '${email}'`);
        res.status(201).json(user);
    } catch (error) {
        // Handle specific error cases
        if (error.code === 'auth/email-already-exists') {
            return res.status(409).json({
                error: 'Email already exists',
                message: 'A user with this email already exists'
            });
        }
        
        logger.error(`[user.createUser] Failed to create user for email: '${email}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, role } = req.body;

    // Validate role
    const validRoles = [0, 1, 2, 3, 4]; // (0: Terminated, 1: Admin, 2: Coodinator, 3: Lecturer, 4: Student) 
    if (!validRoles.includes(Number(role))) {
        return res.status(400).json({
            error: 'Invalid role',
            message: 'Role must be 0 (Terminated), 1 (Admin), 2 (Coordinator), 3 (Lecturer), or 4 (Student)'
        });
    }
    
    try {
        const user = await User.updateUser({ id, firstName, lastName, role });

        logger.info(`[user.updateUser] User updated successfully for ID: '${id}'`);
        res.json(user);
    } catch (error) {
        if (error.code === 'P2025') { // Record not found
            return res.status(404).json({
                error: 'User not found',
                message: 'No user found with the provided ID'
            });
        }
        
        logger.error(`[user.updateUser] Failed to update user for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update user'
        });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await User.deleteUser(id);

        logger.info(`[user.deleteUser] User deleted successfully for ID: '${id}'`);
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') { // Record not found
            return res.status(404).json({
                error: 'User not found',
                message: 'No user found with the provided ID'
            });
        }
        
        logger.error(`[user.deleteUser] Failed to delete user for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};
