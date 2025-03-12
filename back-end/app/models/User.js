import { auth } from '../firebase/firebase-admin.js';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';

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

    static async createUser({ email, password, firstName, lastName, role }) {
        let firebaseUser;
        try {
            firebaseUser = await auth.createUser({
                email,
                password,
                displayName: `${firstName} ${lastName}`
            });

            // Set custom claims for role
            await auth.setCustomUserClaims(firebaseUser.uid, { role });

            const user = await prisma.user.create({
                data: {
                    firebaseUid: firebaseUser.uid,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    role: role
                }
            });

            return new User(user);
        } catch (error) {
            // If Firebase user was created but database insert failed, delete the Firebase user
            if (error.code !== 'auth/email-already-exists' && firebaseUser?.uid) {
                try {
                    await auth.deleteUser(firebaseUser.uid);
                } catch (deleteError) {
                    logger.error(
                        `[User.createUser] Failed to cleanup Firebase user after database error for UID: ${firebaseUser.uid}. Error: ${deleteError.message}`
                    );
                }
            }

            throw error;
        }
    }

    static async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email_address: email }
        });
    }

    static async findByFirebaseUid(firebaseUid) {
        return await prisma.user.findUnique({
            where: { firebase_uid: firebaseUid }
        });
    }
}

export default User; 