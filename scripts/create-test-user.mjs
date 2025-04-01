import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Initialize Firebase Admin with service account
const app = initializeApp({
    credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
});

async function createTestUser() {
    try {
        const auth = getAuth();
        const userRecord = await auth.createUser({
            email: 'test@example.com',
            password: 'testpassword123',
            emailVerified: true,
        });

        console.log('Successfully created test user:', userRecord.toJSON());
        console.log('\nTest Credentials:');
        console.log('Email: test@example.com');
        console.log('Password: testpassword123\n');
    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            console.log('\nTest user already exists.');
            console.log('You can use these credentials:');
            console.log('Email: test@example.com');
            console.log('Password: testpassword123\n');
        } else {
            console.error('Error creating test user:', error);
        }
    }
}
console.log('Creating test user...');
createTestUser();
