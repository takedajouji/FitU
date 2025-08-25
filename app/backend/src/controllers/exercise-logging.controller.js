const db = require('../../../models');
const UserExercises = db.UserExercises;
const Exercises = db.Exercises;
const Users = db.Users;
const { Op } = require('sequelize');

/**
 * Smart hybrid exercise logging with intelligent manual input suggestions
 */
async function logExercise(req, res) {
    try {
        const {
            exercise_id,
            duration_minutes,
            sets,
            reps,
            weight_kg,
            distance_km,
            calories_burned, // Optional: manual override
            performed_at,
            notes,
            rating
        } = req.body;

        // Get user's integer ID from Firebase UID first
        const user = await Users.findOne({
            where: { firebase_uid: req.user.uid },
            attributes: ['id']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please complete profile setup first.'
            });
        }

        // Get exercise details for auto-calculation
        const exercise = await Exercises.findByPk(exercise_id);
        if (!exercise) {
            return res.status(404).json({
                success: false,
                message: 'Exercise not found'
            });
        }

        // Check user's manual input history for smart suggestions
        const userStats = await getUserExerciseStats(user.id);
        
        // Calculate calories automatically if not manually provided
        let finalCaloriesBurned = calories_burned;
        let calculationMethod = 'automatic';
        let smartSuggestion = null;
        
        if (!calories_burned && duration_minutes && exercise.calories_per_minute) {
            // Auto-calculate: calories_per_minute × duration
            finalCaloriesBurned = Math.round(exercise.calories_per_minute * duration_minutes);
            
            // Smart suggestion logic
            smartSuggestion = generateSmartSuggestion(userStats, exercise, duration_minutes, finalCaloriesBurned);
        } else if (calories_burned) {
            finalCaloriesBurned = calories_burned;
            calculationMethod = 'manual';
        }



        const newExerciseLog = await UserExercises.create({
            user_id: user.id,
            exercise_id,
            duration_minutes,
            sets,
            reps,
            weight_kg,
            distance_km,
            calories_burned: finalCaloriesBurned || 0,
            performed_at: performed_at || new Date(),
            notes,
            rating
        });

        // Return with exercise details and smart suggestions
        const exerciseWithDetails = await UserExercises.findByPk(newExerciseLog.id, {
            include: [{
                model: Exercises,
                as: 'exercise',
                attributes: ['name', 'category', 'calories_per_minute']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Exercise logged successfully',
            data: {
                ...exerciseWithDetails.toJSON(),
                calculation_method: calculationMethod,
                preset_calories_per_min: exercise.calories_per_minute,
                smart_suggestion: smartSuggestion,
                user_stats: {
                    total_workouts: userStats.total_workouts,
                    manual_input_rate: userStats.manual_input_rate,
                    fitness_tracker_user: userStats.is_likely_tracker_user
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging exercise',
            error: error.message
        });
    }
}

/**
 * Analyze user's exercise logging patterns
 */
async function getUserExerciseStats(userId) {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentExercises = await UserExercises.findAll({
            where: {
                user_id: userId,
                performed_at: {
                    [Op.gte]: thirtyDaysAgo
                }
            },
            include: [{
                model: Exercises,
                as: 'exercise',
                attributes: ['calories_per_minute']
            }]
        });

        const totalWorkouts = recentExercises.length;
        
        if (totalWorkouts === 0) {
            return {
                total_workouts: 0,
                manual_input_rate: 0,
                is_likely_tracker_user: false,
                avg_manual_vs_preset_diff: 0
            };
        }

        // Count manual inputs vs auto-calculated
        let manualInputs = 0;
        let totalCalorieDiff = 0;
        let comparableExercises = 0;

        recentExercises.forEach(log => {
            if (log.exercise && log.exercise.calories_per_minute && log.duration_minutes) {
                const expectedCalories = log.exercise.calories_per_minute * log.duration_minutes;
                const actualCalories = log.calories_burned;
                
                // If calories differ significantly from preset, likely manual input
                const difference = Math.abs(actualCalories - expectedCalories);
                const percentDiff = (difference / expectedCalories) * 100;
                
                if (percentDiff > 5) { // More than 5% difference suggests manual input
                    manualInputs++;
                    totalCalorieDiff += difference;
                }
                comparableExercises++;
            }
        });

        const manualInputRate = (manualInputs / totalWorkouts) * 100;
        const avgDifference = comparableExercises > 0 ? totalCalorieDiff / comparableExercises : 0;
        
        return {
            total_workouts: totalWorkouts,
            manual_input_rate: Math.round(manualInputRate),
            is_likely_tracker_user: manualInputRate > 30, // 30%+ manual inputs suggests tracker use
            avg_manual_vs_preset_diff: Math.round(avgDifference)
        };
    } catch (error) {
        console.warn('Error calculating user exercise stats:', error.message);
        return {
            total_workouts: 0,
            manual_input_rate: 0,
            is_likely_tracker_user: false,
            avg_manual_vs_preset_diff: 0
        };
    }
}

/**
 * Generate smart suggestions for manual input
 */
function generateSmartSuggestion(userStats, exercise, duration, calculatedCalories) {
    const suggestions = [];
    
    // Suggest manual input for likely fitness tracker users
    if (userStats.is_likely_tracker_user) {
        suggestions.push({
            type: 'fitness_tracker_detected',
            message: 'You often use custom calorie data. Have a more accurate number from your fitness tracker?',
            confidence: 'high',
            suggested_action: 'manual_input'
        });
    }
    
    // Suggest for high-intensity exercises where individual variation matters
    if (exercise.category === 'cardio' && exercise.calories_per_minute > 10) {
        suggestions.push({
            type: 'high_intensity_cardio',
            message: `High-intensity ${exercise.category} can vary greatly by effort. Heart rate monitor data available?`,
            confidence: 'medium',
            suggested_action: 'consider_manual'
        });
    }
    
    // Suggest for strength training (very individual)
    if (exercise.category === 'strength' && duration > 20) {
        suggestions.push({
            type: 'strength_training_variation',
            message: 'Strength training calories vary by weight lifted and rest time. Know your actual burn?',
            confidence: 'medium',
            suggested_action: 'consider_manual'
        });
    }
    
    // First-time users get helpful preset info
    if (userStats.total_workouts < 5) {
        suggestions.push({
            type: 'new_user_education',
            message: `Estimated ${calculatedCalories} calories based on average rates. You can always enter custom amounts!`,
            confidence: 'info',
            suggested_action: 'preset_ok'
        });
    }
    
    return suggestions.length > 0 ? suggestions[0] : null; // Return most relevant suggestion
}

/**
 * Get daily exercise log with total calories burned
 */
async function getDailyExercises(req, res) {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Get user's integer ID from Firebase UID
        const user = await db.Users.findOne({
            where: { firebase_uid: req.user.uid },
            attributes: ['id']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const exercises = await UserExercises.findAll({
            where: {
                user_id: user.id,
                performed_at: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            },
            include: [{
                model: Exercises,
                as: 'exercise',
                attributes: ['name', 'category', 'calories_per_minute']
            }],
            order: [['performed_at', 'ASC']]
        });

        // Calculate daily totals
        const dailyTotals = exercises.reduce((totals, exercise) => {
            return {
                total_calories_burned: totals.total_calories_burned + (exercise.calories_burned || 0),
                total_duration_minutes: totals.total_duration_minutes + (exercise.duration_minutes || 0),
                total_exercises: totals.total_exercises + 1,
                exercise_sessions: totals.exercise_sessions
            };
        }, {
            total_calories_burned: 0,
            total_duration_minutes: 0,
            total_exercises: 0
        });

        res.status(200).json({
            success: true,
            data: {
                date: targetDate.toISOString().split('T')[0],
                exercises,
                daily_totals: dailyTotals
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching daily exercises',
            error: error.message
        });
    }
}

/**
 * Get all available exercises with preset calorie rates
 */
async function getAvailableExercises(req, res) {
    try {
        const { category, difficulty_level } = req.query;
        
        const whereClause = { is_active: true };
        
        if (category) {
            whereClause.category = category;
        }
        
        if (difficulty_level) {
            whereClause.difficulty_level = difficulty_level;
        }

        const exercises = await Exercises.findAll({
            where: whereClause,
            attributes: [
                'id', 'name', 'category', 'difficulty_level', 
                'calories_per_minute', 'equipment_needed', 
                'description', 'instructions'
            ],
            order: [['category', 'ASC'], ['name', 'ASC']]
        });

        // Group by category for easy mobile app consumption
        const groupedExercises = exercises.reduce((groups, exercise) => {
            const category = exercise.category;
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(exercise);
            return groups;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                exercises,
                grouped_by_category: groupedExercises,
                total_count: exercises.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching exercises',
            error: error.message
        });
    }
}

module.exports = {
    logExercise,
    getDailyExercises,
    getAvailableExercises
};
