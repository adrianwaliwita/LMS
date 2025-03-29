import { auth } from '../firebase/firebase-admin.js';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';
import { Department } from './Department.js';
import { Batch } from './Batch.js';
import { Module } from './Module.js';

const UserRoles = Object.freeze({
    0: 'TERMINATED',
    1: 'ADMIN',
    2: 'COORDINATOR',
    3: 'LECTURER',
    4: 'STUDENT'
});

class User {
    constructor({ id, firebaseUid, email, firstName, lastName, role, createdAt, updatedAt, department, studentBatch, lecturerModules }) {
        this.id = id;
        this.firebaseUid = firebaseUid;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.roleName = UserRoles[role];
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.department = new Department(department);

        // Optional fields for "Student" role
        this.enrolledBatch = null;
        if (role === 4) { // STUDENT
            this.enrolledBatch = studentBatch?.batch ? new Batch(studentBatch.batch) : null;
        }
        
        // Optional fields for "Lecturer" role
        this.assignedModules = null;
        if (role === 3) { // LECTURER
            this.assignedModules = lecturerModules?.map(m => new Module(m.module)) || [];
        }
    }

    static async getUserById(id) {
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            include: {
                department: true,
                studentBatch: {
                    include: {
                        batch: true
                    }
                },
                lecturerModules: {
                    include: {
                        module: true
                    }
                }
            }
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
            },
            include: {
                department: true,
                studentBatch: {
                    include: {
                        batch: true
                    }
                },
                lecturerModules: {
                    include: {
                        module: true
                    }
                }
            }
        });

        return users.map(user => new User(user));
    }

    static generateSecurePassword() {
        // Generate a random password with:
        // - At least 1 uppercase letter
        // - At least 1 lowercase letter
        // - At least 1 number
        // - At least 1 special character
        // - Total length of 12 characters
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const numberChars = '0123456789';
        const specialChars = '!@#$%^&*';
        
        // Ensure at least one of each type
        const password = [
            uppercaseChars[crypto.randomInt(uppercaseChars.length)],
            lowercaseChars[crypto.randomInt(lowercaseChars.length)],
            numberChars[crypto.randomInt(numberChars.length)],
            specialChars[crypto.randomInt(specialChars.length)]
        ];
        
        // Fill the rest with random characters from all types
        const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
        for (let i = password.length; i < 12; i++) {
            password.push(allChars[crypto.randomInt(allChars.length)]);
        }
        
        // Shuffle the password array
        for (let i = password.length - 1; i > 0; i--) {
            const j = crypto.randomInt(i + 1);
            [password[i], password[j]] = [password[j], password[i]];
        }
        
        return password.join('');
    }

    static async createUser({ email, firstName, lastName, role, departmentId, enrolledBatchId, assignedModuleIds }) {
        let firebaseUser;
        try {
            // Generate a secure password
            const generatedPassword = User.generateSecurePassword();

            firebaseUser = await auth.createUser({
                email,
                password: generatedPassword,
                displayName: `${firstName} ${lastName}`
            });

            const user = await prisma.$transaction(async (tx) => {
                const newUser = await tx.user.create({
                    data: {
                        firebaseUid: firebaseUser.uid,
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        role: Number(role),
                        departmentId: departmentId ? Number(departmentId) : null
                    }
                });

                // If user is a student, create StudentBatch record
                if (role === 4 && enrolledBatchId) { // 4 is STUDENT role
                    await tx.studentBatch.create({
                        data: {
                            userId: newUser.id,
                            batchId: Number(enrolledBatchId)
                        }
                    });
                }

                // If user is a lecturer, create LecturerModule records
                if (role === 3 && assignedModuleIds?.length > 0) { // 3 is LECTURER role
                    await tx.lecturerModule.createMany({
                        data: assignedModuleIds.map(moduleId => ({
                            userId: newUser.id,
                            moduleId: Number(moduleId)
                        }))
                    });
                }

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

    static async updateUser({ id, firstName, lastName, role, departmentId }) {
        const user = await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: Number(id) },
                data: {
                    firstName,
                    lastName,
                    role: role !== undefined ? Number(role) : undefined,
                    departmentId: departmentId !== undefined ? Number(departmentId) : undefined
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
