/**
 * UI Handlers for FitU Frontend
 * 
 * This file manages all UI interactions, form handling, and data display
 */

/**
 * Message display system
 */
function showMessage(message, type = 'success') {
    const container = document.getElementById('message-container');
    
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    container.appendChild(messageEl);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, 5000);
}

/**
 * Loading overlay controls
 */
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

/**
 * Dashboard handlers
 */
const DashboardHandlers = {
    async refreshDashboard() {
        try {
            showLoading();
            
            // Get today's calorie balance
            const balance = await CalorieBalanceAPI.getDailyBalance();
            
            // Update dashboard stats
            document.getElementById('net-calories').textContent = 
                APIHelpers.formatCalories(balance.data.net_calories) + ' cal';
            
            document.getElementById('food-calories').textContent = 
                APIHelpers.formatCalories(balance.data.food_calories) + ' cal';
            
            document.getElementById('exercise-calories').textContent = 
                APIHelpers.formatCalories(balance.data.exercise_calories) + ' cal';
            
            // Goal status
            const goalStatus = balance.data.status;
            const statusEl = document.getElementById('goal-status');
            
            switch (goalStatus) {
                case 'UNDER_GOAL':
                    statusEl.textContent = '✅ Under Goal';
                    statusEl.style.color = '#28a745';
                    break;
                case 'OVER_GOAL':
                    statusEl.textContent = '⚠️ Over Goal';
                    statusEl.style.color = '#dc3545';
                    break;
                case 'NO_GOAL_SET':
                    statusEl.textContent = '📊 No Goal Set';
                    statusEl.style.color = '#6c757d';
                    break;
                default:
                    statusEl.textContent = '📊 Tracking';
                    statusEl.style.color = '#6c757d';
            }
            
            showMessage('Dashboard updated successfully');
            
        } catch (error) {
            console.error('Dashboard refresh error:', error);
            showMessage('Failed to refresh dashboard: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    }
};

/**
 * Food logging handlers
 */
const FoodHandlers = {
    async handleFoodSubmission(event) {
        event.preventDefault();
        
        try {
            showLoading();
            
            const form = event.target;
            const formData = new FormData(form);
            
            const foodData = APIHelpers.formatFoodEntry({
                food_name: formData.get('food_name'),
                calories_per_serving: formData.get('calories_per_serving'),
                servings_consumed: formData.get('servings_consumed'),
                meal_type: formData.get('meal_type'),
                protein_g: formData.get('protein_g'),
                carbs_g: formData.get('carbs_g'),
                fat_g: formData.get('fat_g')
            });
            
            const result = await FoodAPI.logFood(foodData);
            
            showMessage('Food logged successfully!');
            form.reset();
            
            // Refresh food entries
            await this.refreshFoodEntries();
            
        } catch (error) {
            console.error('Food logging error:', error);
            showMessage('Failed to log food: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    },
    
    async refreshFoodEntries() {
        try {
            const entries = await FoodAPI.getDailyEntries();
            const container = document.getElementById('food-entries');
            
            if (!entries.data || entries.data.length === 0) {
                container.innerHTML = '<p class="loading">No food entries for today</p>';
                return;
            }
            
            const entriesHTML = entries.data.map(entry => `
                <div class="entry-item">
                    <div class="entry-header">
                        ${entry.food_name} (${entry.meal_type})
                    </div>
                    <div class="entry-details">
                        ${APIHelpers.formatCalories(entry.calories_per_serving * entry.servings_consumed)} calories
                        • ${entry.servings_consumed} serving(s)
                        • ${APIHelpers.formatMacros(entry.protein_g, entry.carbs_g, entry.fat_g)}
                        <br>
                        <small>Logged at: ${new Date(entry.consumed_at || entry.created_at).toLocaleTimeString()}</small>
                    </div>
                </div>
            `).join('');
            
            container.innerHTML = entriesHTML;
            
        } catch (error) {
            console.error('Error refreshing food entries:', error);
            document.getElementById('food-entries').innerHTML = 
                '<p class="loading">Error loading food entries</p>';
        }
    }
};

/**
 * Exercise logging handlers
 */
const ExerciseHandlers = {
    async loadAvailableExercises() {
        try {
            const exercises = await ExerciseAPI.getAvailableExercises();
            const select = document.getElementById('exercise-select');
            
            if (!exercises.data || exercises.data.length === 0) {
                select.innerHTML = '<option value="">No exercises available</option>';
                return;
            }
            
            const optionsHTML = exercises.data.map(exercise => 
                `<option value="${exercise.id}">${exercise.name} (${exercise.category})</option>`
            ).join('');
            
            select.innerHTML = '<option value="">Select exercise</option>' + optionsHTML;
            
        } catch (error) {
            console.error('Error loading exercises:', error);
            showMessage('Failed to load exercises: ' + error.message, 'error');
        }
    },
    
    async handleExerciseSubmission(event) {
        event.preventDefault();
        
        try {
            showLoading();
            
            const form = event.target;
            const formData = new FormData(form);
            
            const exerciseData = APIHelpers.formatExerciseEntry({
                exercise_id: formData.get('exercise_id'),
                duration_minutes: formData.get('duration_minutes'),
                sets: formData.get('sets'),
                reps: formData.get('reps'),
                weight_kg: formData.get('weight_kg'),
                calories_burned: formData.get('calories_burned'),
                notes: formData.get('notes')
            });
            
            const result = await ExerciseAPI.logExercise(exerciseData);
            
            showMessage('Exercise logged successfully!');
            form.reset();
            
            // Refresh exercise entries
            await this.refreshExerciseEntries();
            
        } catch (error) {
            console.error('Exercise logging error:', error);
            showMessage('Failed to log exercise: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    },
    
    async refreshExerciseEntries() {
        try {
            const entries = await ExerciseAPI.getDailyExercises();
            const container = document.getElementById('exercise-entries');
            
            if (!entries.data || entries.data.length === 0) {
                container.innerHTML = '<p class="loading">No exercise entries for today</p>';
                return;
            }
            
            const entriesHTML = entries.data.map(entry => `
                <div class="entry-item">
                    <div class="entry-header">
                        ${entry.Exercise ? entry.Exercise.name : 'Unknown Exercise'}
                    </div>
                    <div class="entry-details">
                        Duration: ${entry.duration_minutes} minutes
                        • Calories: ${APIHelpers.formatCalories(entry.calories_burned)}
                        ${entry.sets ? `• Sets: ${entry.sets}` : ''}
                        ${entry.reps ? `• Reps: ${entry.reps}` : ''}
                        ${entry.weight_kg ? `• Weight: ${entry.weight_kg}kg` : ''}
                        <br>
                        ${entry.notes ? `Notes: ${entry.notes}<br>` : ''}
                        <small>Logged at: ${new Date(entry.performed_at || entry.created_at).toLocaleTimeString()}</small>
                    </div>
                </div>
            `).join('');
            
            container.innerHTML = entriesHTML;
            
        } catch (error) {
            console.error('Error refreshing exercise entries:', error);
            document.getElementById('exercise-entries').innerHTML = 
                '<p class="loading">Error loading exercise entries</p>';
        }
    }
};

/**
 * Calorie balance handlers
 */
const BalanceHandlers = {
    async showDailyBalance() {
        try {
            showLoading();
            
            const balance = await CalorieBalanceAPI.getDailyBalance();
            const container = document.getElementById('balance-results');
            
            const html = `
                <h3>📅 Today's Calorie Balance</h3>
                <div class="json-display">${JSON.stringify(balance.data, null, 2)}</div>
            `;
            
            container.innerHTML = html;
            
        } catch (error) {
            console.error('Error getting daily balance:', error);
            showMessage('Failed to get daily balance: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    },
    
    async showWeeklyBalance() {
        try {
            showLoading();
            
            const balance = await CalorieBalanceAPI.getWeeklyBalance();
            const container = document.getElementById('balance-results');
            
            const html = `
                <h3>📈 Weekly Calorie Trends</h3>
                <div class="json-display">${JSON.stringify(balance.data, null, 2)}</div>
            `;
            
            container.innerHTML = html;
            
        } catch (error) {
            console.error('Error getting weekly balance:', error);
            showMessage('Failed to get weekly balance: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    },
    
    async showBalanceSummary() {
        try {
            showLoading();
            
            const balance = await CalorieBalanceAPI.getBalanceSummary();
            const container = document.getElementById('balance-results');
            
            const html = `
                <h3>📋 Calorie Balance Summary</h3>
                <div class="json-display">${JSON.stringify(balance.data, null, 2)}</div>
            `;
            
            container.innerHTML = html;
            
        } catch (error) {
            console.error('Error getting balance summary:', error);
            showMessage('Failed to get balance summary: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    }
};

/**
 * AI recommendations handlers
 */
const AIHandlers = {
    async getPersonalizedWorkout() {
        try {
            showLoading();
            
            const goal = document.getElementById('fitness-goal').value;
            const duration = document.getElementById('workout-duration').value;
            
            const recommendations = await AIAPI.getPersonalizedWorkout(goal, duration);
            const container = document.getElementById('ai-results');
            
            const html = `
                <h3>🎯 Personalized Workout Recommendations</h3>
                <div class="json-display">${JSON.stringify(recommendations.data, null, 2)}</div>
            `;
            
            container.innerHTML = html;
            
        } catch (error) {
            console.error('Error getting personalized workout:', error);
            showMessage('Failed to get personalized workout: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    },
    
    async getQuickWorkout() {
        try {
            showLoading();
            
            const duration = document.getElementById('workout-duration').value;
            
            const recommendations = await AIAPI.getQuickWorkout(duration);
            const container = document.getElementById('ai-results');
            
            const html = `
                <h3>⚡ Quick Workout Suggestions</h3>
                <div class="json-display">${JSON.stringify(recommendations.data, null, 2)}</div>
            `;
            
            container.innerHTML = html;
            
        } catch (error) {
            console.error('Error getting quick workout:', error);
            showMessage('Failed to get quick workout: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    },
    
    async getProgressivePlan() {
        try {
            showLoading();
            
            const goal = document.getElementById('fitness-goal').value;
            
            const recommendations = await AIAPI.getProgressivePlan(goal);
            const container = document.getElementById('ai-results');
            
            const html = `
                <h3>📈 Progressive Workout Plan</h3>
                <div class="json-display">${JSON.stringify(recommendations.data, null, 2)}</div>
            `;
            
            container.innerHTML = html;
            
        } catch (error) {
            console.error('Error getting progressive plan:', error);
            showMessage('Failed to get progressive plan: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    }
};

/**
 * System testing handlers
 */
const SystemHandlers = {
    async testHealth() {
        try {
            showLoading();
            
            const health = await HealthAPI.getHealth();
            const container = document.getElementById('system-results');
            
            const html = `
                <h3>🏥 System Health Check</h3>
                <div class="json-display">${JSON.stringify(health, null, 2)}</div>
            `;
            
            container.innerHTML = html;
            showMessage('Health check completed');
            
        } catch (error) {
            console.error('Health check error:', error);
            showMessage('Health check failed: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    },
    
    async testAuth() {
        try {
            showLoading();
            
            const user = FirebaseAuth.getCurrentUser();
            const token = FirebaseAuth.getCurrentToken();
            
            const authInfo = {
                isAuthenticated: !!user,
                userEmail: user ? user.email : null,
                hasToken: !!token,
                tokenPreview: token ? token.substring(0, 50) + '...' : null
            };
            
            const container = document.getElementById('system-results');
            
            const html = `
                <h3>🔗 Authentication Status</h3>
                <div class="json-display">${JSON.stringify(authInfo, null, 2)}</div>
            `;
            
            container.innerHTML = html;
            showMessage('Authentication check completed');
            
        } catch (error) {
            console.error('Auth check error:', error);
            showMessage('Auth check failed: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    }
};

// Export handlers
window.DashboardHandlers = DashboardHandlers;
window.FoodHandlers = FoodHandlers;
window.ExerciseHandlers = ExerciseHandlers;
window.BalanceHandlers = BalanceHandlers;
window.AIHandlers = AIHandlers;
window.SystemHandlers = SystemHandlers;
window.showMessage = showMessage;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
