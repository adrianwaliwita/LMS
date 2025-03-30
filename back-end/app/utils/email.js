import nodemailer from 'nodemailer';
import config from './config.js';
import logger from './logger.js';

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email.sender,
        pass: config.email.password
    }
});

/**
 * Sends an email using Gmail SMTP
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} [options.html] - HTML body (optional)
 * @param {Array<{filename: string, content: Buffer}>} [options.attachments] - Array of attachments (optional)
 * @returns {Promise<void>}
 * @throws {Error} If email configuration is missing or if sending fails
 */
export const sendEmail = async ({ to, subject, text, html, attachments }) => {
    // Check if email configuration exists
    if (!config.email.sender || !config.email.password) {
        const error = new Error('Email configuration is missing. Please set EMAIL_SENDER and EMAIL_APP_PASSWORD environment variables.');
        logger.error('[email.sendEmail] Email configuration missing', error);
        throw error;
    }

    try {
        // Prepare email options
        const mailOptions = {
            from: config.email.sender,
            to,
            subject,
            text,
            ...(html && { html }),
            ...(attachments && { attachments })
        };

        // Send email
        await transporter.sendMail(mailOptions);
        logger.info(`[email.sendEmail] Email sent successfully to: ${to}`);
    } catch (error) {
        logger.error('[email.sendEmail] Failed to send email', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

// Verify transporter configuration on module load
transporter.verify()
    .then(() => logger.info('[email] SMTP connection configured successfully'))
    .catch(error => logger.error('[email] SMTP connection configuration failed', error));