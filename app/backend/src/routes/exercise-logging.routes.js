const express = require('express');
const router = express.Router();
const exerciseLoggingController = require('../controllers/exercise-logging.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route   POST /api/exercise-logging
 * @desc    Log an exercise session with smart calorie calculation
 * @access  Private
 * @body    {
 *   exercise_id: number (required),
 *   duration_minutes: number (optional),
 *   sets: number (optional),
 *   reps: number (optional),
 *   weight_kg: number (optional),
 *   distance_km: number (optional),
 *   calories_burned: number (optional - manual override),
 *   performed_at: datetime (optional, default: now),
 *   notes: string (optional),
 *   rating: number (optional, 1-5 stars)
 * }
 * @response {
 *   success: boolean,
 *   data: {
 *     ...exercise_log,
 *     calculation_method: string (automatic|manual),
 *     preset_calories_per_min: number,
 *     smart_suggestion: object|null,
 *     user_stats: {
 *       total_workouts: number,
 *       manual_input_rate: number,
 *       fitness_tracker_user: boolean
 *     }
 *   }
 * }
 */
router.post('/', exerciseLoggingController.logExercise);

/**
 * @route   GET /api/exercise-logging/daily
 * @desc    Get daily exercise log with total calories burned
 * @access  Private
 * @query   date: string (optional, format: YYYY-MM-DD, default: today)
 */
router.get('/daily', exerciseLoggingController.getDailyExercises);

/**
 * @route   GET /api/exercise-logging/exercises
 * @desc    Get all available exercises with preset calorie rates
 * @access  Private
 * @query   category: string (optional), difficulty_level: string (optional)
 */
router.get('/exercises', exerciseLoggingController.getAvailableExercises);

/**
 * @route   GET /api/exercise-logging/preview
 * @desc    Preview calorie burn for an exercise without logging it
 * @access  Private
 * @query   exercise_id: number (required), duration_minutes: number (required)
 */
router.get('/preview', async (req, res) => {
    try {
        const { exercise_id, duration_minutes } = req.query;
        
        if (!exercise_id || !duration_minutes) {
            return res.status(400).json({
                success: false,
                message: 'exercise_id and duration_minutes are required'
            });
        }

        const db = require('../../../models');
        const exercise = await db.Exercises.findByPk(exercise_id);
        
        if (!exercise) {
            return res.status(404).json({
                success: false,
                message: 'Exercise not found'
            });
        }

        const estimatedCalories = exercise.calories_per_minute 
            ? Math.round(exercise.calories_per_minute * duration_minutes)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                exercise: {
                    id: exercise.id,
                    name: exercise.name,
                    category: exercise.category,
                    calories_per_minute: exercise.calories_per_minute
                },
                duration_minutes: parseInt(duration_minutes),
                estimated_calories: estimatedCalories,
                calculation: `${exercise.calories_per_minute} cal/min × ${duration_minutes} min = ${estimatedCalories} calories`,
                suggestion: 'This is an estimate. You can always enter your actual calories burned when logging!'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error previewing exercise calories',
            error: error.message
        });
    }
});

module.exports = router;
