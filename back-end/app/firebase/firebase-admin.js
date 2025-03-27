import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
const app = initializeApp({
    credential: applicationDefault(),
    storageBucket: 'ashbourne-scms.firebasestorage.app'
});

// Initialize Auth and Storage
const auth = getAuth(app);
const storage = getStorage(app);

export { auth, storage }; 