const aiRecommendationService = require('../services/ai-recommendation.service');
const db = require('../../../models');

/**
 * AI-Powered Exercise Recommendations Controller
 */

/**
 * Get personalized AI exercise recommendations
 */
async function getPersonalizedRecommendations(req, res) {
    try {
        const {
            workout_type = 'full_body',
            duration_preference = 'medium',
            equipment_available = 'none',
            energy_level = 'medium',
            time_constraint = null,
            focus_areas = []
        } = req.query;

        const options = {
            workout_type,
            duration_preference,
            equipment_available,
            energy_level,
            time_constraint: time_constraint ? parseInt(time_constraint) : null,
            focus_areas: Array.isArray(focus_areas) ? focus_areas : [focus_areas].filter(Boolean),
            limit: parseInt(req.query.limit) || 10
        };

        const recommendations = await aiRecommendationService.getPersonalizedRecommendations(
            req.user.uid, 
            options
        );

        res.status(200).json({
            success: true,
            message: 'AI recommendations generated successfully',
            data: recommendations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating AI recommendations',
            error: error.message
        });
    }
}

/**
 * Get quick workout recommendations for specific goals
 */
async function getQuickWorkout(req, res) {
    try {
        const { goal, duration, equipment } = req.query;
        
        if (!goal) {
            return res.status(400).json({
                success: false,
                message: 'Goal parameter is required (lose_weight, build_muscle, improve_fitness, etc.)'
            });
        }

        // Override user's stored goal temporarily for this recommendation
        const options = {
            override_goal: goal,
            duration_preference: duration || 'short',
            equipment_available: equipment || 'none',
            limit: 5
        };

        const quickWorkout = await aiRecommendationService.getPersonalizedRecommendations(
            req.user.uid,
            options
        );

        // Format as a quick workout plan
        const workoutPlan = {
            goal: goal,
            estimated_duration: calculateWorkoutDuration(quickWorkout.ai_recommendations),
            total_exercises: quickWorkout.ai_recommendations.length,
            estimated_calories: calculateWorkoutCalories(quickWorkout.ai_recommendations),
            exercises: quickWorkout.ai_recommendations.map((exercise, index) => ({
                order: index + 1,
                exercise: {
                    id: exercise.id,
                    name: exercise.name,
                    category: exercise.category,
                    difficulty: exercise.difficulty_level,
                    calories_per_minute: exercise.calories_per_minute
                },
                ai_suggestion: {
                    recommended_duration: suggestDuration(exercise, goal),
                    recommended_sets: suggestSets(exercise, goal),
                    recommended_reps: suggestReps(exercise, goal),
                    rest_time: suggestRestTime(exercise),
                    reason: exercise.recommendation_reason
                },
                confidence_score: exercise.confidence
            }))
        };

        res.status(200).json({
            success: true,
            message: `Quick ${goal.replace('_', ' ')} workout generated`,
            data: {
                user_profile: quickWorkout.user_profile,
                workout_plan: workoutPlan,
                ai_analysis: quickWorkout.algorithm_breakdown
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating quick workout',
            error: error.message
        });
    }
}

/**
 * Get AI analysis of user's workout patterns
 */
async function getWorkoutAnalysis(req, res) {
    try {
        const analysis = await aiRecommendationService.analyzeUserWorkoutPatterns(req.user.uid);

        res.status(200).json({
            success: true,
            data: {
                analysis,
                insights: analysis.ai_insights,
                recommendations: analysis.improvement_suggestions
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error analyzing workout patterns',
            error: error.message
        });
    }
}

/**
 * Get progressive workout plan (multi-day AI generated plan)
 */
async function getProgressiveWorkoutPlan(req, res) {
    try {
        const { 
            plan_duration = 7, // days
            sessions_per_week = 3,
            progression_focus = 'balanced'
        } = req.query;

        const planOptions = {
            duration_days: parseInt(plan_duration),
            sessions_per_week: parseInt(sessions_per_week),
            focus: progression_focus
        };

        const workoutPlan = await aiRecommendationService.generateProgressiveWorkoutPlan(
            req.user.uid,
            planOptions
        );

        res.status(200).json({
            success: true,
            message: `${plan_duration}-day progressive workout plan generated`,
            data: workoutPlan
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating progressive workout plan',
            error: error.message
        });
    }
}

/**
 * Submit feedback on AI recommendations (for learning)
 */
async function submitRecommendationFeedback(req, res) {
    try {
        const {
            recommendation_id,
            feedback_type, // 'positive', 'negative', 'completed', 'skipped'
            rating, // 1-5
            feedback_text,
            exercise_ids_used,
            modifications_made
        } = req.body;

        // Store feedback for AI learning
        const feedback = await aiRecommendationService.recordUserFeedback(req.user.uid, {
            recommendation_id,
            feedback_type,
            rating,
            feedback_text,
            exercise_ids_used,
            modifications_made,
            timestamp: new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Feedback recorded successfully',
            data: {
                feedback_id: feedback.id,
                learning_impact: 'AI will use this feedback to improve future recommendations'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error recording feedback',
            error: error.message
        });
    }
}

// Helper functions
function calculateWorkoutDuration(exercises) {
    const avgDurationPerExercise = 8; // minutes
    return exercises.length * avgDurationPerExercise;
}

function calculateWorkoutCalories(exercises) {
    return exercises.reduce((total, exercise) => {
        const duration = suggestDuration(exercise, 'general');
        return total + (exercise.calories_per_minute * duration);
    }, 0);
}

function suggestDuration(exercise, goal) {
    const baseDurations = {
        cardio: { lose_weight: 15, build_muscle: 10, improve_fitness: 12 },
        strength: { lose_weight: 8, build_muscle: 12, improve_fitness: 10 },
        flexibility: { lose_weight: 5, build_muscle: 5, improve_fitness: 8 },
        functional: { lose_weight: 12, build_muscle: 10, improve_fitness: 10 }
    };

    return baseDurations[exercise.category]?.[goal] || 10;
}

function suggestSets(exercise, goal) {
    if (exercise.category === 'cardio') return null;
    
    const setSuggestions = {
        lose_weight: 3,
        build_muscle: 4,
        improve_fitness: 3,
        maintain_weight: 2
    };

    return setSuggestions[goal] || 3;
}

function suggestReps(exercise, goal) {
    if (exercise.category === 'cardio') return null;

    const repSuggestions = {
        lose_weight: '12-15',
        build_muscle: '6-10',
        improve_fitness: '8-12',
        maintain_weight: '10-12'
    };

    return repSuggestions[goal] || '8-12';
}

function suggestRestTime(exercise) {
    const restTimes = {
        cardio: '30 seconds',
        strength: '60-90 seconds',
        flexibility: '15 seconds',
        functional: '45 seconds'
    };

    return restTimes[exercise.category] || '60 seconds';
}

module.exports = {
    getPersonalizedRecommendations,
    getQuickWorkout,
    getWorkoutAnalysis,
    getProgressiveWorkoutPlan,
    submitRecommendationFeedback
};
