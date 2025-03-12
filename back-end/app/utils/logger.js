import winston from 'winston';
const { format, transports } = winston;
const { combine, timestamp, colorize, printf, errors } = format;

// Define log format
const logFormat = combine(
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack }) => {
        return `[${timestamp}] ${level}: ${message} ${stack ? `\n${stack}` : ''}`;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    handleExceptions: true,
    defaultMeta: { service: 'ashbourne-scms-backend' },
    transports: [
        new transports.Console({})
    ]
});

export default logger;
