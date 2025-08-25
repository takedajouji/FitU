/**
 * Firebase Admin SDK Configuration
 * Server-side Firebase configuration for backend operations
 * 
 * This is separate from the client-side firebase.config.js
 * Used for: JWT verification, user management, server-side DB operations
 */

const admin = require('firebase-admin');
require('dotenv').config();

// Check if we have Firebase service account credentials
const hasFirebaseCredentials = 
    process.env.FIREBASE_CLIENT_EMAIL && 
    process.env.FIREBASE_PRIVATE_KEY && 
    process.env.FIREBASE_PROJECT_ID;

// Firebase Admin SDK configuration
const firebaseAdminConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID || "fitu-9d970",
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://fitu-9d970-default-rtdb.firebaseio.com",
    
    // Use credentials if available, otherwise try application default
    credential: hasFirebaseCredentials 
        ? admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          })
        : admin.credential.applicationDefault()
};

// Initialize Firebase Admin SDK
let app;
try {
    if (admin.apps.length === 0) {
        // Check credentials before initialization
        if (!hasFirebaseCredentials) {
            console.warn('Firebase service account credentials not found in environment variables');
            console.warn('Required: FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID');
            console.log('Attempting to initialize with application default credentials...');
        }
        
        app = admin.initializeApp(firebaseAdminConfig);
        
        if (hasFirebaseCredentials) {
            console.log('Firebase Admin SDK initialized with service account credentials');
        } else {
            console.log('Firebase Admin SDK initialized with application default credentials');
            console.log('Some features may be limited without service account credentials');
        }
    } else {
        app = admin.app(); // Use existing app
    }
} catch (error) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    
    if (!hasFirebaseCredentials) {
        console.error('Firebase service account credentials required for full functionality');
        console.error('Please set FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and FIREBASE_PROJECT_ID environment variables');
    }
    
    throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
}

// Export Firebase Admin services
const auth = admin.auth();
const database = admin.database();

module.exports = {
    admin,
    auth,
    database,
    app
};

/**
 * Setup Instructions:
 * 
 * 1. For Development:
 *    - Install Firebase CLI: npm install -g firebase-tools
 *    - Login: firebase login
 *    - This will use Application Default Credentials
 * 
 * 2. For Production:
 *    - Generate service account key from Firebase Console
 *    - Set environment variables:
 *      FIREBASE_PROJECT_ID=fitu-9d970
 *      FIREBASE_CLIENT_EMAIL=your-service-account@fitu-9d970.iam.gserviceaccount.com
 *      FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 * 
 * 3. Security:
 *    - Never commit service account keys to version control
 *    - Use environment variables for all sensitive data
 *    - Rotate keys regularly in production
 */
