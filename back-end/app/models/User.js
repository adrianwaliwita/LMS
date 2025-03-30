import { auth } from '../firebase/firebase-admin.js';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';
import { Department } from './Department.js';
import { Batch } from './Batch.js';
import { Module } from './Module.js';
import { sendEmail } from '../utils/email.js';

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
        this.department = department ? new Department(department) : null;

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
            uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)],
            lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)],
            numberChars[Math.floor(Math.random() * numberChars.length)],
            specialChars[Math.floor(Math.random() * specialChars.length)]
        ];
        
        // Fill the rest with random characters from all types
        const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
        for (let i = password.length; i < 12; i++) {
            password.push(allChars[Math.floor(Math.random() * allChars.length)]);
        }
        
        // Shuffle the password array
        for (let i = password.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
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
                            lecturerId: newUser.id,
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

            // Send welcome email
            const roleNames = {
                1: 'Administrator',
                2: 'Coordinator',
                3: 'Lecturer',
                4: 'Student'
            };

            const emailHtml = `
                <h2>Welcome to the AshBourne University Smart Campus Management System (SCMS)!</h2>
                <p>Dear ${firstName} ${lastName},</p>
                <p>Your account has been created successfully as a ${roleNames[role]}. Here are your login credentials:</p>
                <ul>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Password:</strong> ${generatedPassword}</li>
                </ul>
                <p>To access the system:</p>
                <ol>
                    <li>Visit our login page</li>
                    <li>Enter your email address and the password provided above</li>
                    <li>You will be logged in to the system immediately after your first login</li>
                </ol>
                <p><strong>Important:</strong> Please change your password immediately after your first login for security purposes.</p>
                <p>If you have any questions or need assistance, please contact your coordinator.</p>
                <p>Best regards,<br>AshBourne University.</p>
            `;

            await sendEmail({
                to: email,
                subject: 'Welcome to AshBourne University SCMS - Your Account Details',
                html: emailHtml
            });

            logger.info(`[User.createUser] Welcome email sent to user: ${email}`);

            return User.getUserById(user.id);
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

            logger.error('[User.createUser] Failed to create user or send welcome email', error);
            throw error;
        }
    }

    static async updateUser({ id, firstName, lastName, role, departmentId, password }) {
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

            // Update Firebase password if provided
            if (password) {
                await auth.updateUser(updatedUser.firebaseUid, {
                    password: password
                });
                logger.info(`[User.updateUser] Password updated for user ID: '${id}'`);
            }

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

        return User.getUserById(user.id);
    }

    static async deleteUser(id) {
        // Delete user from database
        const deletedUser = await prisma.user.delete({
            where: { id: Number(id) }
        });

        // Delete user from Firebase
        await auth.deleteUser(deletedUser.firebaseUid);
    }

    static async resetPassword(email) {
        try {
            // Get user details
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                throw new Error('No user found with this email address');
            }

            // Generate a new secure password
            const newPassword = User.generateSecurePassword();

            // Update password in Firebase
            await auth.updateUser(user.firebaseUid, {
                password: newPassword
            });

            // Send password reset email
            const emailHtml = `
                <h2>AshBourne University Smart Campus Management System (SCMS) - Password Reset</h2>
                <p>Dear ${user.firstName} ${user.lastName},</p>
                <p>Your password has been reset successfully. Here are your new login credentials:</p>
                <ul>
                    <li><strong>Email:</strong> ${user.email}</li>
                    <li><strong>Password:</strong> ${newPassword}</li>
                </ul>
                <p>To access the system:</p>
                <ol>
                    <li>Visit our login page</li>
                    <li>Enter your email address and the new password provided above</li>
                    <li>You will be logged in to the system immediately</li>
                </ol>
                <p><strong>Important:</strong> Please change your password immediately after you login for security purposes.</p>
                <p>If you have any questions or need assistance, please contact your coordinator.</p>
                <p>Best regards,<br>AshBourne University.</p>
            `;

            await sendEmail({
                to: user.email,
                subject: 'AshBourne University SCMS - Password Reset',
                html: emailHtml
            });

            logger.info(`[User.resetPassword] Password reset email sent to user: ${email}`);

            // Revoke all refresh tokens for the user to force re-login
            await auth.revokeRefreshTokens(user.firebaseUid);
            
            return true;
        } catch (error) {
            logger.error('[User.resetPassword] Failed to reset password', error);
            throw error;
        }
    }
}

export { UserRoles, User };
