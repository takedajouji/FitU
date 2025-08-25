/**
 * Hybrid Firebase + MySQL Authentication Middleware
 * 
 * This middleware:
 * 1. Verifies Firebase JWT tokens using Admin SDK
 * 2. Synchronizes Firebase users with MySQL database
 * 3. Creates unified user context for both databases
 * 4. Provides security for both Firebase and MySQL operations
 */

const { auth: firebaseAuth } = require('../config/firebase-admin.config');
const { Users } = require('../../../models');

/**
 * Synchronize Firebase user with MySQL database
 * Creates or updates MySQL user record based on Firebase auth data
 */
async function syncFirebaseUserToMySQL(firebaseUser) {
    try {
        const firebaseUid = firebaseUser.uid;
        const email = firebaseUser.email;
        const emailVerified = firebaseUser.email_verified || false;

        // Check if user exists in MySQL
        let mysqlUser = await Users.findOne({ 
            where: { firebase_uid: firebaseUid }
        });

        if (!mysqlUser) {
            // Create new MySQL user record
            console.log(`Creating new MySQL user for Firebase UID: ${firebaseUid}`);
            mysqlUser = await Users.create({
                firebase_uid: firebaseUid,
                email: email,
                email_verified: emailVerified,
                first_name: firebaseUser.name?.split(' ')[0] || '',
                last_name: firebaseUser.name?.split(' ').slice(1).join(' ') || '',
                profile_picture_url: firebaseUser.picture || null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            });
        } else {
            // Update existing user if needed
            const needsUpdate = 
                mysqlUser.email !== email || 
                mysqlUser.email_verified !== emailVerified;

            if (needsUpdate) {
                console.log(`Updating MySQL user for Firebase UID: ${firebaseUid}`);
                await mysqlUser.update({
                    email: email,
                    email_verified: emailVerified,
                    updated_at: new Date()
                });
            }
        }

        return mysqlUser;
    } catch (error) {
        console.error('Error syncing Firebase user to MySQL:', error);
        throw new Error('User synchronization failed');
    }
}

/**
 * Main authentication middleware
 */
const authMiddleware = async (req, res, next) => {
    try {
        // 1. Extract Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
                code: 'NO_TOKEN'
            });
        }

        // 2. Extract JWT token
        const token = authHeader.substring(7); // Remove "Bearer " prefix
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token format.',
                code: 'INVALID_TOKEN_FORMAT'
            });
        }

        // 3. Verify JWT with Firebase Admin SDK
        let decodedToken;
        try {
            decodedToken = await firebaseAuth.verifyIdToken(token);
            console.log(`Firebase JWT verified for user: ${decodedToken.uid}`);
        } catch (firebaseError) {
            console.error('Firebase JWT verification failed:', firebaseError.message);
            
            // Handle specific Firebase auth errors
            let errorMessage = 'Invalid or expired token';
            let errorCode = 'TOKEN_VERIFICATION_FAILED';
            
            if (firebaseError.code === 'auth/id-token-expired') {
                errorMessage = 'Token has expired';
                errorCode = 'TOKEN_EXPIRED';
            } else if (firebaseError.code === 'auth/argument-error') {
                errorMessage = 'Invalid token format';
                errorCode = 'INVALID_TOKEN';
            }
            
            return res.status(401).json({
                success: false,
                message: errorMessage,
                code: errorCode
            });
        }

        // 4. Synchronize with MySQL database
        let mysqlUser;
        try {
            mysqlUser = await syncFirebaseUserToMySQL(decodedToken);
        } catch (syncError) {
            console.error('User synchronization failed:', syncError.message);
            return res.status(500).json({
                success: false,
                message: 'User synchronization failed',
                code: 'SYNC_ERROR'
            });
        }

        // 5. Create unified user context
        req.user = {
            // Firebase data
            firebaseUid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified || false,
            firebaseData: {
                name: decodedToken.name,
                picture: decodedToken.picture,
                authTime: decodedToken.auth_time,
                signInProvider: decodedToken.firebase.sign_in_provider
            },
            
            // MySQL data
            mysqlId: mysqlUser.id,
            profile: {
                firstName: mysqlUser.first_name,
                lastName: mysqlUser.last_name,
                dateOfBirth: mysqlUser.date_of_birth,
                gender: mysqlUser.gender,
                height: mysqlUser.height_cm,
                weight: mysqlUser.weight_kg,
                activityLevel: mysqlUser.activity_level,
                fitnessGoal: mysqlUser.fitness_goal,
                dailyCalorieGoal: mysqlUser.daily_calorie_goal,
                profilePicture: mysqlUser.profile_picture_url,
                isActive: mysqlUser.is_active
            },
            
            // Database access helpers
            getFirebaseRef: function(path = '') {
                return `/users/${this.firebaseUid}${path ? '/' + path : ''}`;
            },
            
            getMySQLFilters: function() {
                return { user_id: this.mysqlId };
            },
            
            // Security context
            permissions: {
                canAccessFirebase: true,
                canAccessMySQL: true,
                firebasePath: `/users/${decodedToken.uid}`,
                mysqlUserId: mysqlUser.id
            }
        };

        // 6. Security logging
        console.log(`Hybrid Auth Success:`, {
            firebaseUid: req.user.firebaseUid,
            mysqlId: req.user.mysqlId,
            email: req.user.email,
            endpoint: `${req.method} ${req.originalUrl}`,
            timestamp: new Date().toISOString()
        });

        next();

    } catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication service error',
            code: 'AUTH_SERVICE_ERROR'
        });
    }
};

module.exports = authMiddleware;
