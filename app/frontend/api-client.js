/**
 * API Client for FitU Backend
 * 
 * This file handles all API communications with the FitU backend server
 */

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Base API request function with authentication
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get auth token if user is logged in
    let headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    try {
        const token = await FirebaseAuth.getAuthToken();
        headers['Authorization'] = `Bearer ${token}`;
    } catch (error) {
        // If not authenticated, continue without token (for public endpoints)
        console.log('No auth token available:', error.message);
    }
    
    const config = {
        method: 'GET',
        ...options,
        headers
    };
    
    try {
        const response = await fetch(url, config);
        
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`API returned non-JSON response: ${text}`);
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `API request failed: ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error(`API request failed for ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Health Check API
 */
const HealthAPI = {
    async getHealth() {
        return await apiRequest('/health');
    }
};

/**
 * Food Logging API
 */
const FoodAPI = {
    /**
     * Log a food entry
     */
    async logFood(foodData) {
        return await apiRequest('/calorie-entries', {
            method: 'POST',
            body: JSON.stringify(foodData)
        });
    },
    
    /**
     * Get daily food entries
     */
    async getDailyEntries(date = null) {
        const dateParam = date ? `?date=${date}` : '';
        return await apiRequest(`/calorie-entries/daily${dateParam}`);
    },
    
    /**
     * Update a food entry
     */
    async updateEntry(entryId, updateData) {
        return await apiRequest(`/calorie-entries/${entryId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    },
    
    /**
     * Delete a food entry
     */
    async deleteEntry(entryId) {
        return await apiRequest(`/calorie-entries/${entryId}`, {
            method: 'DELETE'
        });
    }
};

/**
 * Exercise Logging API
 */
const ExerciseAPI = {
    /**
     * Get available exercises
     */
    async getAvailableExercises() {
        return await apiRequest('/exercise-logging/exercises');
    },
    
    /**
     * Log an exercise
     */
    async logExercise(exerciseData) {
        return await apiRequest('/exercise-logging', {
            method: 'POST',
            body: JSON.stringify(exerciseData)
        });
    },
    
    /**
     * Get daily exercise logs
     */
    async getDailyExercises(date = null) {
        const dateParam = date ? `?date=${date}` : '';
        return await apiRequest(`/exercise-logging/daily${dateParam}`);
    },
    
    /**
     * Preview calorie burn for an exercise
     */
    async previewCalories(exerciseId, duration) {
        return await apiRequest(`/exercise-logging/preview?exercise_id=${exerciseId}&duration_minutes=${duration}`);
    }
};

/**
 * Calorie Balance API
 */
const CalorieBalanceAPI = {
    /**
     * Get daily calorie balance
     */
    async getDailyBalance(date = null) {
        const dateParam = date ? `?date=${date}` : '';
        return await apiRequest(`/calorie-balance/daily${dateParam}`);
    },
    
    /**
     * Get weekly calorie trends
     */
    async getWeeklyBalance() {
        return await apiRequest('/calorie-balance/weekly');
    },
    
    /**
     * Get calorie balance summary
     */
    async getBalanceSummary() {
        return await apiRequest('/calorie-balance/summary');
    }
};

/**
 * AI Recommendations API
 */
const AIAPI = {
    /**
     * Get personalized workout recommendations
     */
    async getPersonalizedWorkout(goal = 'improve_fitness', duration = 30) {
        return await apiRequest(`/ai-recommendations/personalized?goal=${goal}&duration=${duration}`);
    },
    
    /**
     * Get quick workout suggestions
     */
    async getQuickWorkout(duration = 15) {
        return await apiRequest(`/ai-recommendations/quick-workout?duration=${duration}`);
    },
    
    /**
     * Get workout analysis
     */
    async getWorkoutAnalysis() {
        return await apiRequest('/ai-recommendations/workout-analysis');
    },
    
    /**
     * Get progressive workout plan
     */
    async getProgressivePlan(goal = 'improve_fitness') {
        return await apiRequest(`/ai-recommendations/progressive-plan?goal=${goal}`);
    },
    
    /**
     * Submit workout feedback
     */
    async submitFeedback(feedbackData) {
        return await apiRequest('/ai-recommendations/feedback', {
            method: 'POST',
            body: JSON.stringify(feedbackData)
        });
    },
    
    /**
     * Preview recommendations
     */
    async previewRecommendations(goal = 'improve_fitness') {
        return await apiRequest(`/ai-recommendations/preview?goal=${goal}`);
    }
};

/**
 * Helper functions for data formatting
 */
const APIHelpers = {
    /**
     * Format food entry data
     */
    formatFoodEntry(formData) {
        return {
            food_name: formData.food_name,
            calories_per_serving: parseInt(formData.calories_per_serving),
            servings_consumed: parseFloat(formData.servings_consumed),
            meal_type: formData.meal_type,
            protein_g: formData.protein_g ? parseFloat(formData.protein_g) : 0,
            carbs_g: formData.carbs_g ? parseFloat(formData.carbs_g) : 0,
            fat_g: formData.fat_g ? parseFloat(formData.fat_g) : 0,
            fiber_g: 0, // Default
            sugar_g: 0, // Default
            sodium_mg: 0 // Default
        };
    },
    
    /**
     * Format exercise entry data
     */
    formatExerciseEntry(formData) {
        const data = {
            exercise_id: parseInt(formData.exercise_id),
            duration_minutes: parseInt(formData.duration_minutes)
        };
        
        // Optional fields
        if (formData.sets) data.sets = parseInt(formData.sets);
        if (formData.reps) data.reps = parseInt(formData.reps);
        if (formData.weight_kg) data.weight_kg = parseFloat(formData.weight_kg);
        if (formData.calories_burned) data.calories_burned = parseInt(formData.calories_burned);
        if (formData.notes) data.notes = formData.notes;
        if (formData.rating) data.rating = parseInt(formData.rating);
        
        return data;
    },
    
    /**
     * Format date for API requests
     */
    formatDate(date = new Date()) {
        return date.toISOString().split('T')[0];
    },
    
    /**
     * Format calories display
     */
    formatCalories(calories) {
        return Math.round(calories || 0);
    },
    
    /**
     * Format macros display
     */
    formatMacros(protein, carbs, fat) {
        return `P: ${Math.round(protein || 0)}g | C: ${Math.round(carbs || 0)}g | F: ${Math.round(fat || 0)}g`;
    }
};

// Export APIs for global use
window.HealthAPI = HealthAPI;
window.FoodAPI = FoodAPI;
window.ExerciseAPI = ExerciseAPI;
window.CalorieBalanceAPI = CalorieBalanceAPI;
window.AIAPI = AIAPI;
window.APIHelpers = APIHelpers;
