/**
 * FitU Frontend Application
 * 
 * Main application initialization and event handling
 */

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏋️ FitU Frontend Application Starting...');
    
    initializeEventListeners();
    loadInitialData();
    
    console.log('✅ FitU Frontend Application Ready!');
});

/**
 * Set up all event listeners
 */
function initializeEventListeners() {
    
    // Authentication handlers
    setupAuthenticationHandlers();
    
    // Dashboard handlers
    setupDashboardHandlers();
    
    // Food logging handlers
    setupFoodHandlers();
    
    // Exercise logging handlers
    setupExerciseHandlers();
    
    // Calorie balance handlers
    setupBalanceHandlers();
    
    // AI recommendations handlers
    setupAIHandlers();
    
    // System testing handlers
    setupSystemHandlers();
}

/**
 * Authentication event handlers
 */
function setupAuthenticationHandlers() {
    // Google login
    const googleLoginBtn = document.getElementById('google-login');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            try {
                showLoading();
                await FirebaseAuth.signInWithGoogle();
                showMessage('Successfully signed in with Google!');
            } catch (error) {
                console.error('Google login error:', error);
                showMessage('Google login failed: ' + error.message, 'error');
            } finally {
                hideLoading();
            }
        });
    }
    
    // Email login form
    const emailLoginForm = document.getElementById('email-login-form');
    if (emailLoginForm) {
        emailLoginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            try {
                showLoading();
                
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                
                await FirebaseAuth.signInWithEmail(email, password);
                showMessage('Successfully signed in!');
                
            } catch (error) {
                console.error('Email login error:', error);
                showMessage('Login failed: ' + error.message, 'error');
            } finally {
                hideLoading();
            }
        });
    }
    
    // Show signup (for future implementation)
    const showSignupLink = document.getElementById('show-signup');
    if (showSignupLink) {
        showSignupLink.addEventListener('click', (event) => {
            event.preventDefault();
            showMessage('Account creation coming soon! Use Google login for now.', 'warning');
        });
    }
}

/**
 * Dashboard event handlers
 */
function setupDashboardHandlers() {
    const refreshDashboardBtn = document.getElementById('refresh-dashboard');
    if (refreshDashboardBtn) {
        refreshDashboardBtn.addEventListener('click', () => {
            DashboardHandlers.refreshDashboard();
        });
    }
}

/**
 * Food logging event handlers
 */
function setupFoodHandlers() {
    // Food form submission
    const foodForm = document.getElementById('food-form');
    if (foodForm) {
        foodForm.addEventListener('submit', FoodHandlers.handleFoodSubmission.bind(FoodHandlers));
    }
    
    // Refresh food entries
    const refreshFoodBtn = document.getElementById('refresh-food');
    if (refreshFoodBtn) {
        refreshFoodBtn.addEventListener('click', () => {
            FoodHandlers.refreshFoodEntries();
        });
    }
}

/**
 * Exercise logging event handlers
 */
function setupExerciseHandlers() {
    // Exercise form submission
    const exerciseForm = document.getElementById('exercise-form');
    if (exerciseForm) {
        exerciseForm.addEventListener('submit', ExerciseHandlers.handleExerciseSubmission.bind(ExerciseHandlers));
    }
    
    // Refresh exercise entries
    const refreshExerciseBtn = document.getElementById('refresh-exercises');
    if (refreshExerciseBtn) {
        refreshExerciseBtn.addEventListener('click', () => {
            ExerciseHandlers.refreshExerciseEntries();
        });
    }
}

/**
 * Calorie balance event handlers
 */
function setupBalanceHandlers() {
    const getDailyBalanceBtn = document.getElementById('get-daily-balance');
    if (getDailyBalanceBtn) {
        getDailyBalanceBtn.addEventListener('click', () => {
            BalanceHandlers.showDailyBalance();
        });
    }
    
    const getWeeklyBalanceBtn = document.getElementById('get-weekly-balance');
    if (getWeeklyBalanceBtn) {
        getWeeklyBalanceBtn.addEventListener('click', () => {
            BalanceHandlers.showWeeklyBalance();
        });
    }
    
    const getBalanceSummaryBtn = document.getElementById('get-balance-summary');
    if (getBalanceSummaryBtn) {
        getBalanceSummaryBtn.addEventListener('click', () => {
            BalanceHandlers.showBalanceSummary();
        });
    }
}

/**
 * AI recommendations event handlers
 */
function setupAIHandlers() {
    const getPersonalizedBtn = document.getElementById('get-personalized');
    if (getPersonalizedBtn) {
        getPersonalizedBtn.addEventListener('click', () => {
            AIHandlers.getPersonalizedWorkout();
        });
    }
    
    const getQuickWorkoutBtn = document.getElementById('get-quick-workout');
    if (getQuickWorkoutBtn) {
        getQuickWorkoutBtn.addEventListener('click', () => {
            AIHandlers.getQuickWorkout();
        });
    }
    
    const getProgressivePlanBtn = document.getElementById('get-progressive-plan');
    if (getProgressivePlanBtn) {
        getProgressivePlanBtn.addEventListener('click', () => {
            AIHandlers.getProgressivePlan();
        });
    }
}

/**
 * System testing event handlers
 */
function setupSystemHandlers() {
    const testHealthBtn = document.getElementById('test-health');
    if (testHealthBtn) {
        testHealthBtn.addEventListener('click', () => {
            SystemHandlers.testHealth();
        });
    }
    
    const testConnectionBtn = document.getElementById('test-connection');
    if (testConnectionBtn) {
        testConnectionBtn.addEventListener('click', () => {
            SystemHandlers.testAuth();
        });
    }
}

/**
 * Load initial data when app starts
 */
async function loadInitialData() {
    try {
        // Load available exercises for the dropdown
        await ExerciseHandlers.loadAvailableExercises();
        
        console.log('📊 Initial data loaded successfully');
        
    } catch (error) {
        console.error('Error loading initial data:', error);
        showMessage('Some initial data failed to load. You may need to refresh.', 'warning');
    }
}

/**
 * Auto-refresh data when user becomes authenticated
 */
function onUserAuthenticated() {
    console.log('👤 User authenticated, loading user-specific data...');
    
    // Auto-refresh dashboard
    setTimeout(() => {
        DashboardHandlers.refreshDashboard();
    }, 1000);
    
    // Auto-load food entries
    setTimeout(() => {
        FoodHandlers.refreshFoodEntries();
    }, 1500);
    
    // Auto-load exercise entries
    setTimeout(() => {
        ExerciseHandlers.refreshExerciseEntries();
    }, 2000);
    
    showMessage('Welcome to FitU! Your data has been loaded.');
}

/**
 * Listen for authentication state changes
 */
if (typeof firebase !== 'undefined') {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            onUserAuthenticated();
        }
    });
}

/**
 * Utility functions
 */
window.FitUApp = {
    // Expose some functions for console debugging
    refreshAll: async function() {
        showLoading();
        try {
            await DashboardHandlers.refreshDashboard();
            await FoodHandlers.refreshFoodEntries();
            await ExerciseHandlers.refreshExerciseEntries();
            showMessage('All data refreshed successfully');
        } catch (error) {
            showMessage('Error refreshing data: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    },
    
    clearAllData: function() {
        // Clear all data displays
        document.getElementById('food-entries').innerHTML = '<p class="loading">No data loaded</p>';
        document.getElementById('exercise-entries').innerHTML = '<p class="loading">No data loaded</p>';
        document.getElementById('balance-results').innerHTML = '<p class="loading">No data loaded</p>';
        document.getElementById('ai-results').innerHTML = '<p class="loading">No data loaded</p>';
        document.getElementById('system-results').innerHTML = '<p class="loading">No data loaded</p>';
        
        // Reset dashboard
        document.getElementById('net-calories').textContent = '-';
        document.getElementById('food-calories').textContent = '-';
        document.getElementById('exercise-calories').textContent = '-';
        document.getElementById('goal-status').textContent = '-';
        
        showMessage('All data cleared');
    },
    
    testAllFeatures: async function() {
        showMessage('Testing all features... check console for details');
        
        try {
            // Test health
            console.log('Testing health...');
            await SystemHandlers.testHealth();
            
            // Test auth
            console.log('Testing auth...');
            await SystemHandlers.testAuth();
            
            // Test dashboard
            console.log('Testing dashboard...');
            await DashboardHandlers.refreshDashboard();
            
            showMessage('All feature tests completed - check console for results');
            
        } catch (error) {
            console.error('Feature test error:', error);
            showMessage('Feature test failed: ' + error.message, 'error');
        }
    }
};

// Make functions available in console for debugging
console.log('🔧 Debug functions available:');
console.log('- FitUApp.refreshAll()');
console.log('- FitUApp.clearAllData()');
console.log('- FitUApp.testAllFeatures()');
console.log('- showMessage("test message", "success|error|warning")');
console.log('- FirebaseAuth object for auth testing');
console.log('- Various API objects (FoodAPI, ExerciseAPI, etc.)');

/**
 * Error handling for unhandled promises
 */
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showMessage('An unexpected error occurred. Check console for details.', 'error');
});
