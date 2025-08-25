/**
 * Firebase Configuration for FitU Frontend
 * 
 * This file initializes Firebase for client-side authentication and real-time database
 */

// Firebase configuration (matches your backend config)
const firebaseConfig = {
    apiKey: "AIzaSyDpYRqMZQUF__xzvumILxvmpAwmkqs75TI",
    authDomain: "fitu-9d970.firebaseapp.com",
    projectId: "fitu-9d970",
    storageBucket: "fitu-9d970.firebasestorage.app",
    messagingSenderId: "1052175181761",
    appId: "1:1052175181761:web:b2c821c77a6edcdbaf7140",
    measurementId: "G-YBK4YM0H33",
    databaseURL: "https://fitu-9d970-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const database = firebase.database();

// Authentication state management
let currentUser = null;
let currentToken = null;

/**
 * Get the current Firebase ID token for API requests
 */
async function getAuthToken() {
    if (!auth.currentUser) {
        throw new Error('No user logged in');
    }
    
    try {
        const token = await auth.currentUser.getIdToken();
        currentToken = token;
        return token;
    } catch (error) {
        console.error('Error getting auth token:', error);
        throw error;
    }
}

/**
 * Sign in with Google
 */
async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    try {
        const result = await auth.signInWithPopup(provider);
        return result.user;
    } catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
    }
}

/**
 * Sign in with email and password
 */
async function signInWithEmail(email, password) {
    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        return result.user;
    } catch (error) {
        console.error('Email sign-in error:', error);
        throw error;
    }
}

/**
 * Create account with email and password
 */
async function createAccountWithEmail(email, password) {
    try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        return result.user;
    } catch (error) {
        console.error('Account creation error:', error);
        throw error;
    }
}

/**
 * Sign out
 */
async function signOut() {
    try {
        await auth.signOut();
        currentUser = null;
        currentToken = null;
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
}

/**
 * Listen for authentication state changes
 */
auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    
    if (user) {
        console.log('User signed in:', user.email);
        
        // Get fresh token
        try {
            currentToken = await user.getIdToken();
            
            // Show main content
            showMainContent();
            
            // Update UI with user info
            updateAuthUI(user);
            
        } catch (error) {
            console.error('Error getting token:', error);
            showMessage('Error getting authentication token', 'error');
        }
    } else {
        console.log('User signed out');
        currentToken = null;
        
        // Show login screen
        showLoginScreen();
        
        // Update UI
        updateAuthUI(null);
    }
});

/**
 * Update authentication UI
 */
function updateAuthUI(user) {
    const userInfo = document.getElementById('user-info');
    const authButton = document.getElementById('auth-button');
    
    if (user) {
        userInfo.textContent = `Logged in as: ${user.email}`;
        authButton.textContent = 'Logout';
        authButton.onclick = () => {
            signOut().catch(error => {
                showMessage('Error signing out: ' + error.message, 'error');
            });
        };
    } else {
        userInfo.textContent = 'Not logged in';
        authButton.textContent = 'Login';
        authButton.onclick = () => showLoginScreen();
    }
}

/**
 * Show/hide UI sections
 */
function showMainContent() {
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('login-screen').style.display = 'none';
}

function showLoginScreen() {
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
}

/**
 * Firebase Realtime Database helpers
 */
const FirebaseDB = {
    /**
     * Get user preferences
     */
    async getUserPreferences() {
        if (!currentUser) throw new Error('No user logged in');
        
        const snapshot = await database.ref(`users/${currentUser.uid}/preferences`).once('value');
        return snapshot.val();
    },
    
    /**
     * Update user preferences
     */
    async updateUserPreferences(preferences) {
        if (!currentUser) throw new Error('No user logged in');
        
        await database.ref(`users/${currentUser.uid}/preferences`).update(preferences);
    },
    
    /**
     * Get sync status
     */
    async getSyncStatus() {
        if (!currentUser) throw new Error('No user logged in');
        
        const snapshot = await database.ref(`users/${currentUser.uid}/appState/syncStatus`).once('value');
        return snapshot.val();
    },
    
    /**
     * Listen for sync status changes
     */
    onSyncStatusChange(callback) {
        if (!currentUser) return;
        
        database.ref(`users/${currentUser.uid}/appState/syncStatus`).on('value', (snapshot) => {
            callback(snapshot.val());
        });
    }
};

// Export for use in other files
window.FirebaseAuth = {
    getAuthToken,
    signInWithGoogle,
    signInWithEmail,
    createAccountWithEmail,
    signOut,
    getCurrentUser: () => currentUser,
    getCurrentToken: () => currentToken
};

window.FirebaseDB = FirebaseDB;
