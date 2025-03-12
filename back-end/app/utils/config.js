import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the parent directory's .env file
dotenv.config({ path: join(__dirname, '../..', '.env') });

export default {
    port: process.env.PORT || 5000,
    database: {
        host: (process.env.DB_HOST || 'localhost').trim(),
        port: parseInt(process.env.DB_PORT || '3306'),
        user: (process.env.DB_USER || 'root').trim(),
        password: (process.env.DB_PASSWORD || '').trim(),
        database: (process.env.DB_NAME || 'ashbourne-scms').trim(),
    }
};
