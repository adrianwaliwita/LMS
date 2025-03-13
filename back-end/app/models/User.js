import { auth } from '../firebase/firebase-admin.js';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';

const UserRoles = Object.freeze({
    0: 'TERMINATED',
    1: 'ADMIN',
    2: 'COORDINATOR',
    3: 'LECTURER',
    4: 'STUDENT'
});

class User {
    constructor({ id, firebaseUid, email, firstName, lastName, role, createdAt, updatedAt }) {
        this.id = id;
        this.firebaseUid = firebaseUid;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static async getUserById(id) {
        const user = await prisma.user.findUnique({
            where: { id: Number(id) }
        });

        return user ? new User(user) : null;
    }
    
    static async listUsers({ role, email }) {
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    role ? { role: Number(role) } : {},
                    email ? { email: { contains: email } } : {}
                ]
            }
        });

        return users.map(user => new User(user));
    }

    static async createUser({ email, password, firstName, lastName, role }) {
        let firebaseUser;
        try {
            firebaseUser = await auth.createUser({
                email,
                password,
                displayName: `${firstName} ${lastName}`
            });

            const user = await prisma.$transaction(async (tx) => {
                const newUser = await tx.user.create({
                    data: {
                        firebaseUid: firebaseUser.uid,
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        role: role
                    }
                });

                // Set custom claims for user
                await auth.setCustomUserClaims(firebaseUser.uid, {
                    role: role,
                    systemId: newUser.id
                });

                return newUser;
            });

            return new User(user);
        } catch (error) {
            // If Firebase user was created but database insert failed, delete the Firebase user
            if (error.code !== 'auth/email-already-exists' && firebaseUser?.uid) {
                try {
                    await auth.deleteUser(firebaseUser.uid);
                } catch (deleteError) {
                    logger.error(
                        `[User.createUser] Failed to cleanup Firebase user after database error for UID: '${firebaseUser.uid}'`,
                        deleteError
                    );
                }
            }

            throw error;
        }
    }

    static async updateUser({ id, firstName, lastName, role }) {
        const user = await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: Number(id) },
                data: {
                    firstName,
                    lastName,
                    role: role !== undefined ? Number(role) : undefined
                }
            });

            // Update Firebase custom claims if role is changed
            if (role !== undefined) {
                await auth.setCustomUserClaims(updatedUser.firebaseUid, { 
                    role: Number(role),
                    systemId: updatedUser.id
                });

                // Revoke all refresh tokens for the user
                await auth.revokeRefreshTokens(updatedUser.firebaseUid);
                
                logger.info(`[User.updateUser] Firebase custom claims updated and tokens revoked for user ID: '${id}'`);
            }

            return updatedUser;
        });

        return new User(user);
    }

    static async deleteUser(id) {
        // Delete user from database
        const deletedUser = await prisma.user.delete({
            where: { id: Number(id) }
        });

        // Delete user from Firebase
        await auth.deleteUser(deletedUser.firebaseUid);
    }
}

export { UserRoles, User };
