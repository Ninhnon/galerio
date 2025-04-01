import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin with service account
// You need to download your service account key from Firebase Console:
// Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = {
    // Replace this with your service account details
    "type": "service_account",
    "project_id": "YOUR_PROJECT_ID",
    "private_key_id": "YOUR_PRIVATE_KEY_ID",
    "private_key": "YOUR_PRIVATE_KEY",
    "client_email": "YOUR_CLIENT_EMAIL",
    "client_id": "YOUR_CLIENT_ID",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "YOUR_CERT_URL"
};

// Initialize the admin SDK
initializeApp({
    credential: cert(serviceAccount)
});

// Create a test user token
async function createTestToken() {
    try {
        // Create a custom token for testing
        // You can customize these claims based on your needs
        const auth = getAuth();
        const customToken = await auth.createCustomToken('test-user-id', {
            email: 'test@example.com',
            emailVerified: true
        });

        console.log('Test token generated successfully:');
        console.log(customToken);
    } catch (error) {
        console.error('Error creating custom token:', error);
    }
}

createTestToken();
