const express = require('express');
const router = express.Router();

// Import route modules
const calorieEntriesRoutes = require('./calorie-entries.routes');
const calorieBalanceRoutes = require('./calorie-balance.routes');
const exerciseLoggingRoutes = require('./exercise-logging.routes');
const aiRecommendationsRoutes = require('./ai-recommendations.routes');

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'FitU API is running!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API routes
router.use('/calorie-entries', calorieEntriesRoutes);
router.use('/calorie-balance', calorieBalanceRoutes);
router.use('/exercise-logging', exerciseLoggingRoutes);
router.use('/ai-recommendations', aiRecommendationsRoutes);

// 404 handler for unmatched API routes
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint ${req.originalUrl} not found`,
        available_endpoints: {
            health: 'GET /api/health',
            food_logging: {
                create: 'POST /api/calorie-entries',
                daily: 'GET /api/calorie-entries/daily',
                update: 'PUT /api/calorie-entries/:id',
                delete: 'DELETE /api/calorie-entries/:id'
            },
            calorie_balance: {
                daily: 'GET /api/calorie-balance/daily',
                weekly: 'GET /api/calorie-balance/weekly',
                summary: 'GET /api/calorie-balance/summary'
            },
            exercise_logging: {
                log_exercise: 'POST /api/exercise-logging',
                daily_exercises: 'GET /api/exercise-logging/daily',
                available_exercises: 'GET /api/exercise-logging/exercises',
                preview_calories: 'GET /api/exercise-logging/preview'
            },
            ai_recommendations: {
                personalized: 'GET /api/ai-recommendations/personalized',
                quick_workout: 'GET /api/ai-recommendations/quick-workout',
                workout_analysis: 'GET /api/ai-recommendations/workout-analysis',
                progressive_plan: 'GET /api/ai-recommendations/progressive-plan',
                feedback: 'POST /api/ai-recommendations/feedback',
                preview: 'GET /api/ai-recommendations/preview'
            }
        }
    });
});

module.exports = router;
