import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the parent directory's .env file
dotenv.config({ path: join(__dirname, '../..', '.env') });

export default {
    port: process.env.PORT || 8080,
    database: {
        host: (process.env.DB_HOST || 'localhost').trim(),
        port: parseInt(process.env.DB_PORT || '3306'),
        user: (process.env.DB_USER || 'root').trim(),
        password: (process.env.DB_PASSWORD || '').trim(),
        database: (process.env.DB_NAME || 'ashbourne-scms').trim(),
    },
    firebase: {
        disableAuth: process.env.FIREBASE_DISABLE_AUTH === 'true',
        checkRevokedTokens: process.env.FIREBASE_CHECK_REVOKED_TOKENS !== 'false'
    },
    crypto: {
        masterKey: process.env.ENCRYPTION_MASTER_KEY
    }
};
