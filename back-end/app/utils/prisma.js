import { PrismaClient } from '@prisma/client';
import logger from './logger.js';

const prisma = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'event',
            level: 'error',
        },
        {
            emit: 'event',
            level: 'info',
        },
        {
            emit: 'event',
            level: 'warn',
        },
    ],
});

// Log queries in development
prisma.$on('query', (e) => {
    logger.debug(`[prisma:query] ${e.query}`);
});

prisma.$on('error', (e) => {
    logger.error(`[prisma:error] ${e.message}`);
});

prisma.$on('info', (e) => {
    logger.info(`[prisma:info] ${e.message}`);
});

prisma.$on('warn', (e) => {
    logger.warn(`[prisma:warn] ${e.message}`);
});

export default prisma; 