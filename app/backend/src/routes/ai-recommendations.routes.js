const express = require('express');
const router = express.Router();
const aiRecommendationsController = require('../controllers/ai-recommendations.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route   GET /api/ai-recommendations/personalized
 * @desc    Get AI-powered personalized exercise recommendations
 * @access  Private
 * @query   {
 *   workout_type: string (optional, default: 'full_body'),
 *   duration_preference: string (optional, 'short'|'medium'|'long'),
 *   equipment_available: string (optional, 'none'|'basic'|'full_gym'),
 *   energy_level: string (optional, 'low'|'medium'|'high'),
 *   time_constraint: number (optional, minutes available),
 *   focus_areas: array (optional, muscle groups to focus on),
 *   limit: number (optional, default: 10)
 * }
 * @response {
 *   success: boolean,
 *   data: {
 *     user_profile: object,
 *     ai_recommendations: array,
 *     algorithm_breakdown: object,
 *     generated_at: string
 *   }
 * }
 */
router.get('/personalized', aiRecommendationsController.getPersonalizedRecommendations);

/**
 * @route   GET /api/ai-recommendations/quick-workout
 * @desc    Get AI-generated quick workout for specific goal
 * @access  Private
 * @query   {
 *   goal: string (required, 'lose_weight'|'build_muscle'|'improve_fitness'|'maintain_weight'|'gain_weight'),
 *   duration: string (optional, 'short'|'medium'|'long'),
 *   equipment: string (optional, 'none'|'basic'|'full_gym')
 * }
 * @response {
 *   success: boolean,
 *   data: {
 *     user_profile: object,
 *     workout_plan: {
 *       goal: string,
 *       estimated_duration: number,
 *       total_exercises: number,
 *       estimated_calories: number,
 *       exercises: array[{
 *         order: number,
 *         exercise: object,
 *         ai_suggestion: {
 *           recommended_duration: number,
 *           recommended_sets: number,
 *           recommended_reps: string,
 *           rest_time: string,
 *           reason: string
 *         },
 *         confidence_score: number
 *       }]
 *     },
 *     ai_analysis: object
 *   }
 * }
 */
router.get('/quick-workout', aiRecommendationsController.getQuickWorkout);

/**
 * @route   GET /api/ai-recommendations/workout-analysis
 * @desc    Get AI analysis of user's workout patterns and suggestions
 * @access  Private
 * @response {
 *   success: boolean,
 *   data: {
 *     analysis: object,
 *     insights: array,
 *     recommendations: array
 *   }
 * }
 */
router.get('/workout-analysis', aiRecommendationsController.getWorkoutAnalysis);

/**
 * @route   GET /api/ai-recommendations/progressive-plan
 * @desc    Generate AI-powered multi-day progressive workout plan
 * @access  Private
 * @query   {
 *   plan_duration: number (optional, days, default: 7),
 *   sessions_per_week: number (optional, default: 3),
 *   progression_focus: string (optional, 'strength'|'cardio'|'balanced')
 * }
 * @response {
 *   success: boolean,
 *   data: {
 *     plan: {
 *       duration_days: number,
 *       total_sessions: number,
 *       weekly_schedule: array,
 *       daily_workouts: array[{
 *         day: number,
 *         workout_type: string,
 *         exercises: array,
 *         progression_notes: string
 *       }],
 *       ai_rationale: string
 *     }
 *   }
 * }
 */
router.get('/progressive-plan', aiRecommendationsController.getProgressiveWorkoutPlan);

/**
 * @route   POST /api/ai-recommendations/feedback
 * @desc    Submit feedback on AI recommendations for learning
 * @access  Private
 * @body    {
 *   recommendation_id: string (required),
 *   feedback_type: string (required, 'positive'|'negative'|'completed'|'skipped'),
 *   rating: number (optional, 1-5),
 *   feedback_text: string (optional),
 *   exercise_ids_used: array (optional, which exercises from recommendation were used),
 *   modifications_made: array (optional, what user changed)
 * }
 * @response {
 *   success: boolean,
 *   data: {
 *     feedback_id: string,
 *     learning_impact: string
 *   }
 * }
 */
router.post('/feedback', aiRecommendationsController.submitRecommendationFeedback);

/**
 * @route   GET /api/ai-recommendations/preview
 * @desc    Preview AI recommendation logic for a specific goal (for testing)
 * @access  Private
 * @query   {
 *   test_goal: string (required),
 *   debug: boolean (optional, show AI reasoning)
 * }
 */
router.get('/preview', async (req, res) => {
    try {
        const { test_goal, debug } = req.query;
        
        if (!test_goal) {
            return res.status(400).json({
                success: false,
                message: 'test_goal parameter is required'
            });
        }

        // Generate preview with debug information
        const preview = await require('../services/ai-recommendation.service')
            .getPersonalizedRecommendations(req.user.uid, { 
                override_goal: test_goal,
                debug_mode: debug === 'true'
            });

        res.status(200).json({
            success: true,
            message: `Preview generated for goal: ${test_goal}`,
            data: preview,
            debug_info: debug === 'true' ? {
                ai_reasoning: 'Debug mode shows AI decision process',
                algorithm_weights: preview.algorithm_breakdown,
                confidence_scores: preview.ai_recommendations.map(r => ({
                    exercise: r.name,
                    score: r.final_ai_score,
                    source: r.source
                }))
            } : null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating preview',
            error: error.message
        });
    }
});

module.exports = router;
