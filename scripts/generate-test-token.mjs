import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { config } from 'dotenv';

// Initialize Firebase Admin with service account from environment variables
const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL
};

// Initialize the admin SDK
initializeApp({
    credential: cert(serviceAccount)
});

// Create a test user token
async function createTestToken() {
    try {
        const auth = getAuth();
        const customToken = await auth.createCustomToken('test-user-id', {
            email: 'test@example.com',
            emailVerified: true
        });

        console.log('\nTest token generated successfully:');
        console.log('\n' + customToken + '\n');
        console.log('To test:');
        console.log('1. Copy this token');
        console.log('2. Open your app in the browser');
        console.log('3. Click "Test Login" button\n');
    } catch (error) {
        console.error('Error creating custom token:', error);
    }
}

// Load environment variables from .env.local
try {
    config({ path: '.env.local' });

    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
        throw new Error('Required environment variables are missing');
    }

    await createTestToken();
} catch (error) {
    console.error('Error:', error.message);
    console.log('\nMake sure .env.local exists and contains the required Firebase Admin SDK credentials.');
    process.exit(1);
}
