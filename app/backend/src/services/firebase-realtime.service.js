/**
 * Firebase Realtime Database Service
 * 
 * Handles all Firebase Realtime Database operations for the FitU backend
 * Works in conjunction with the hybrid authentication system
 */

const { database } = require('../config/firebase-admin.config');

class FirebaseRealtimeService {
    
    /**
     * User Preferences Management
     */
    
    // Get user preferences
    async getUserPreferences(firebaseUid) {
        try {
            const ref = database.ref(`users/${firebaseUid}/preferences`);
            const snapshot = await ref.once('value');
            return snapshot.val() || this.getDefaultPreferences();
        } catch (error) {
            console.error('Error getting user preferences:', error);
            throw new Error('Failed to get user preferences');
        }
    }
    
    // Update user preferences
    async updateUserPreferences(firebaseUid, preferences) {
        try {
            const ref = database.ref(`users/${firebaseUid}/preferences`);
            await ref.update(preferences);
            return { success: true, preferences };
        } catch (error) {
            console.error('Error updating user preferences:', error);
            throw new Error('Failed to update user preferences');
        }
    }
    
    // Get default preferences for new users
    getDefaultPreferences() {
        return {
            theme: 'auto',
            notifications: {
                workoutReminders: true,
                mealReminders: true,
                progressUpdates: true,
                reminderTimes: {
                    breakfast: '08:00',
                    lunch: '12:00',
                    dinner: '18:00',
                    workout: '17:00'
                }
            },
            units: {
                weight: 'kg',
                distance: 'km',
                temperature: 'celsius'
            }
        };
    }
    
    /**
     * App State Management
     */
    
    // Get current workout session
    async getCurrentWorkout(firebaseUid) {
        try {
            const ref = database.ref(`users/${firebaseUid}/appState/currentWorkout`);
            const snapshot = await ref.once('value');
            return snapshot.val();
        } catch (error) {
            console.error('Error getting current workout:', error);
            throw new Error('Failed to get current workout');
        }
    }
    
    // Start workout session
    async startWorkoutSession(firebaseUid, workoutData) {
        try {
            const sessionId = Date.now().toString();
            const workoutSession = {
                sessionId,
                startTime: Date.now(),
                exercises: workoutData.exercises || [],
                estimatedDuration: workoutData.estimatedDuration || 0,
                status: 'active'
            };
            
            const ref = database.ref(`users/${firebaseUid}/appState/currentWorkout`);
            await ref.set(workoutSession);
            
            return { success: true, sessionId, workoutSession };
        } catch (error) {
            console.error('Error starting workout session:', error);
            throw new Error('Failed to start workout session');
        }
    }
    
    // End workout session
    async endWorkoutSession(firebaseUid) {
        try {
            const ref = database.ref(`users/${firebaseUid}/appState/currentWorkout`);
            const snapshot = await ref.once('value');
            const workoutData = snapshot.val();
            
            if (workoutData) {
                // Move to completed workouts queue for MySQL sync
                await this.queueWorkoutForSync(firebaseUid, {
                    ...workoutData,
                    endTime: Date.now(),
                    status: 'completed'
                });
                
                // Clear current workout
                await ref.remove();
            }
            
            return { success: true, completedWorkout: workoutData };
        } catch (error) {
            console.error('Error ending workout session:', error);
            throw new Error('Failed to end workout session');
        }
    }
    
    /**
     * Sync Queue Management
     */
    
    // Queue food entry for MySQL sync
    async queueFoodEntryForSync(firebaseUid, foodEntry) {
        try {
            const entryId = Date.now().toString();
            const ref = database.ref(`users/${firebaseUid}/syncQueue/foodEntries/${entryId}`);
            
            await ref.set({
                ...foodEntry,
                queuedAt: Date.now(),
                syncStatus: 'pending'
            });
            
            return { success: true, entryId };
        } catch (error) {
            console.error('Error queuing food entry:', error);
            throw new Error('Failed to queue food entry');
        }
    }
    
    // Queue exercise for MySQL sync
    async queueExerciseForSync(firebaseUid, exercise) {
        try {
            const exerciseId = Date.now().toString();
            const ref = database.ref(`users/${firebaseUid}/syncQueue/exercises/${exerciseId}`);
            
            await ref.set({
                ...exercise,
                queuedAt: Date.now(),
                syncStatus: 'pending'
            });
            
            return { success: true, exerciseId };
        } catch (error) {
            console.error('Error queuing exercise:', error);
            throw new Error('Failed to queue exercise');
        }
    }
    
    // Queue workout for MySQL sync
    async queueWorkoutForSync(firebaseUid, workout) {
        try {
            const workoutId = Date.now().toString();
            const ref = database.ref(`users/${firebaseUid}/syncQueue/workouts/${workoutId}`);
            
            await ref.set({
                ...workout,
                queuedAt: Date.now(),
                syncStatus: 'pending'
            });
            
            return { success: true, workoutId };
        } catch (error) {
            console.error('Error queuing workout:', error);
            throw new Error('Failed to queue workout');
        }
    }
    
    // Get pending sync items
    async getPendingSyncItems(firebaseUid) {
        try {
            const ref = database.ref(`users/${firebaseUid}/syncQueue`);
            const snapshot = await ref.once('value');
            const syncQueue = snapshot.val() || {};
            
            return {
                foodEntries: syncQueue.foodEntries || {},
                exercises: syncQueue.exercises || {},
                workouts: syncQueue.workouts || {}
            };
        } catch (error) {
            console.error('Error getting pending sync items:', error);
            throw new Error('Failed to get pending sync items');
        }
    }
    
    // Mark sync item as completed
    async markSyncCompleted(firebaseUid, itemType, itemId) {
        try {
            const ref = database.ref(`users/${firebaseUid}/syncQueue/${itemType}/${itemId}`);
            await ref.remove();
            return { success: true };
        } catch (error) {
            console.error('Error marking sync completed:', error);
            throw new Error('Failed to mark sync completed');
        }
    }
    
    /**
     * Sync Status Management
     */
    
    // Update sync status
    async updateSyncStatus(firebaseUid, status) {
        try {
            const ref = database.ref(`users/${firebaseUid}/appState/syncStatus`);
            await ref.update({
                lastSync: Date.now(),
                pendingOperations: status.pendingOperations || 0,
                isOnline: status.isOnline || true,
                lastError: status.lastError || null
            });
            
            return { success: true };
        } catch (error) {
            console.error('Error updating sync status:', error);
            throw new Error('Failed to update sync status');
        }
    }
    
    // Get sync status
    async getSyncStatus(firebaseUid) {
        try {
            const ref = database.ref(`users/${firebaseUid}/appState/syncStatus`);
            const snapshot = await ref.once('value');
            return snapshot.val() || {
                lastSync: null,
                pendingOperations: 0,
                isOnline: false,
                lastError: null
            };
        } catch (error) {
            console.error('Error getting sync status:', error);
            throw new Error('Failed to get sync status');
        }
    }
    
    /**
     * Configuration Management
     */
    
    // Update user configuration
    async updateUserConfig(firebaseUid, config) {
        try {
            const ref = database.ref(`users/${firebaseUid}/config`);
            await ref.update(config);
            return { success: true, config };
        } catch (error) {
            console.error('Error updating user config:', error);
            throw new Error('Failed to update user config');
        }
    }
    
    // Get user configuration
    async getUserConfig(firebaseUid) {
        try {
            const ref = database.ref(`users/${firebaseUid}/config`);
            const snapshot = await ref.once('value');
            return snapshot.val() || {};
        } catch (error) {
            console.error('Error getting user config:', error);
            throw new Error('Failed to get user config');
        }
    }
    
    /**
     * Utility Methods
     */
    
    // Initialize user data structure in Firebase
    async initializeUserData(firebaseUid) {
        try {
            const userRef = database.ref(`users/${firebaseUid}`);
            const snapshot = await userRef.once('value');
            
            if (!snapshot.exists()) {
                const initialData = {
                    preferences: this.getDefaultPreferences(),
                    appState: {
                        syncStatus: {
                            lastSync: null,
                            pendingOperations: 0,
                            isOnline: true,
                            lastError: null
                        }
                    },
                    config: {
                        featureFlags: {},
                        appVersion: '1.0.0',
                        cacheKeys: {}
                    },
                    syncQueue: {
                        foodEntries: {},
                        exercises: {},
                        workouts: {}
                    }
                };
                
                await userRef.set(initialData);
                console.log(`🔥 Initialized Firebase data for user: ${firebaseUid}`);
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error initializing user data:', error);
            throw new Error('Failed to initialize user data');
        }
    }
    
    // Clean up old data
    async cleanupOldData(firebaseUid, daysOld = 30) {
        try {
            const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
            const syncQueueRef = database.ref(`users/${firebaseUid}/syncQueue`);
            
            // Remove old completed sync items
            const snapshot = await syncQueueRef.once('value');
            const syncQueue = snapshot.val() || {};
            
            const updates = {};
            
            Object.keys(syncQueue).forEach(itemType => {
                Object.keys(syncQueue[itemType] || {}).forEach(itemId => {
                    const item = syncQueue[itemType][itemId];
                    if (item.queuedAt < cutoffTime && item.syncStatus === 'completed') {
                        updates[`${itemType}/${itemId}`] = null;
                    }
                });
            });
            
            if (Object.keys(updates).length > 0) {
                await syncQueueRef.update(updates);
                console.log(`🧹 Cleaned up ${Object.keys(updates).length} old sync items for user: ${firebaseUid}`);
            }
            
            return { success: true, cleanedItems: Object.keys(updates).length };
        } catch (error) {
            console.error('Error cleaning up old data:', error);
            throw new Error('Failed to clean up old data');
        }
    }
}

module.exports = new FirebaseRealtimeService();
