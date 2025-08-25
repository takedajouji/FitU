const db = require('../../../models');
const Users = db.Users;
const Exercises = db.Exercises;
const UserExercises = db.UserExercises;
const { Op } = require('sequelize');

/**
 * AI-Powered Exercise Recommendation System
 * 
 * This service uses multiple AI algorithms to provide personalized exercise recommendations:
 * 1. Goal-Based Recommendations
 * 2. Progressive Overload AI
 * 3. Behavioral Learning AI
 * 4. Balance & Recovery AI
 * 5. Adaptive Difficulty AI
 */
class AIRecommendationService {

    /**
     * Get personalized exercise recommendations for a user
     * @param {string} firebaseUid - User's Firebase UID
     * @param {Object} options - Recommendation options
     * @returns {Promise<Object>} AI-generated recommendations
     */
    async getPersonalizedRecommendations(firebaseUid, options = {}) {
        try {
            // Get user profile and fitness data
            const user = await this.getUserFitnessProfile(firebaseUid);
            if (!user) {
                throw new Error('User not found');
            }

            // Get user's exercise history for AI learning
            const exerciseHistory = await this.getUserExerciseHistory(user.id);
            
            // Run multiple AI algorithms
            const [
                goalBasedRecs,
                progressiveRecs,
                behavioralRecs,
                balanceRecs,
                adaptiveRecs
            ] = await Promise.all([
                this.getGoalBasedRecommendations(user, exerciseHistory, options),
                this.getProgressiveOverloadRecommendations(user, exerciseHistory),
                this.getBehavioralRecommendations(user, exerciseHistory),
                this.getBalanceAndRecoveryRecommendations(user, exerciseHistory),
                this.getAdaptiveDifficultyRecommendations(user, exerciseHistory, options)
            ]);

            // AI Fusion: Combine all recommendations with weighted scoring
            const fusedRecommendations = await this.fuseRecommendations({
                goalBased: goalBasedRecs,
                progressive: progressiveRecs,
                behavioral: behavioralRecs,
                balance: balanceRecs,
                adaptive: adaptiveRecs
            }, user);

            return {
                success: true,
                user_profile: {
                    fitness_level: user.fitness_level,
                    primary_goal: user.fitness_goal,
                    experience_score: this.calculateExperienceScore(exerciseHistory)
                },
                ai_recommendations: fusedRecommendations,
                algorithm_breakdown: {
                    goal_based_weight: 0.35,
                    progressive_weight: 0.25,
                    behavioral_weight: 0.20,
                    balance_weight: 0.15,
                    adaptive_weight: 0.05
                },
                generated_at: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`AI Recommendation Error: ${error.message}`);
        }
    }

    /**
     * 1. GOAL-BASED AI RECOMMENDATIONS
     * Recommends exercises based on user's fitness goals
     */
    async getGoalBasedRecommendations(user, exerciseHistory, options) {
        const goalMappings = {
            'lose_weight': {
                priorities: ['cardio', 'functional'],
                intensity: 'high',
                duration_preference: 'medium_long',
                calorie_focus: true
            },
            'build_muscle': {
                priorities: ['strength'],
                intensity: 'high',
                duration_preference: 'medium',
                progression_focus: true
            },
            'improve_fitness': {
                priorities: ['cardio', 'functional', 'strength'],
                intensity: 'medium',
                duration_preference: 'medium',
                balanced: true
            },
            'maintain_weight': {
                priorities: ['cardio', 'strength', 'flexibility'],
                intensity: 'medium',
                duration_preference: 'short_medium',
                maintenance: true
            },
            'gain_weight': {
                priorities: ['strength'],
                intensity: 'high',
                duration_preference: 'medium_long',
                strength_focus: true
            }
        };

        const goalConfig = goalMappings[user.fitness_goal] || goalMappings['improve_fitness'];
        
        // Get exercises matching the goal priorities
        const exercises = await Exercises.findAll({
            where: {
                category: { [Op.in]: goalConfig.priorities },
                is_active: true
            }
        });

        // AI Scoring based on goal alignment
        const scoredExercises = exercises.map(exercise => {
            let score = 0;
            
            // Base score from category priority
            const categoryIndex = goalConfig.priorities.indexOf(exercise.category);
            score += (goalConfig.priorities.length - categoryIndex) * 20;
            
            // Calorie burn scoring for weight loss
            if (goalConfig.calorie_focus && exercise.calories_per_minute > 8) {
                score += 25;
            }
            
            // Strength focus scoring
            if (goalConfig.strength_focus && exercise.category === 'strength') {
                score += 30;
            }
            
            // Difficulty level matching
            const userLevel = user.activity_level || 'moderately_active';
            const levelMap = {
                'sedentary': 'beginner',
                'lightly_active': 'beginner',
                'moderately_active': 'intermediate',
                'very_active': 'intermediate',
                'extremely_active': 'advanced'
            };
            
            if (exercise.difficulty_level === levelMap[userLevel]) {
                score += 15;
            }

            return {
                ...exercise.toJSON(),
                ai_score: score,
                recommendation_reason: this.generateGoalBasedReason(exercise, goalConfig)
            };
        });

        return scoredExercises
            .sort((a, b) => b.ai_score - a.ai_score)
            .slice(0, options.limit || 8);
    }

    /**
     * 2. PROGRESSIVE OVERLOAD AI
     * Analyzes user's progress and recommends harder variations
     */
    async getProgressiveOverloadRecommendations(user, exerciseHistory) {
        if (exerciseHistory.length < 3) {
            return []; // Need more data for progression analysis
        }

        const progressions = [];
        
        // Analyze each exercise type for progression opportunities
        const exerciseGroups = this.groupExercisesByType(exerciseHistory);
        
        for (const [exerciseId, sessions] of Object.entries(exerciseGroups)) {
            const progression = this.analyzeProgression(sessions);
            
            if (progression.ready_for_advancement) {
                const nextLevel = await this.findProgressionExercise(exerciseId, progression);
                if (nextLevel) {
                    progressions.push({
                        ...nextLevel,
                        ai_score: 85 + progression.confidence_score,
                        progression_type: progression.type,
                        current_performance: progression.current_level,
                        recommendation_reason: `Ready to progress from ${progression.current_exercise_name}`
                    });
                }
            }
        }

        return progressions.slice(0, 5);
    }

    /**
     * 3. BEHAVIORAL LEARNING AI
     * Learns from user preferences and behaviors
     */
    async getBehavioralRecommendations(user, exerciseHistory) {
        if (exerciseHistory.length < 5) {
            return []; // Need more behavioral data
        }

        // Analyze user preferences
        const preferences = this.analyzeBehavioralPatterns(exerciseHistory);
        
        // Find similar exercises to ones they enjoy
        const likedExercises = exerciseHistory
            .filter(session => session.rating >= 4)
            .map(session => session.exercise_id);

        if (likedExercises.length === 0) {
            return [];
        }

        const similarExercises = await this.findSimilarExercises(likedExercises, preferences);
        
        return similarExercises.map(exercise => ({
            ...exercise,
            ai_score: 70 + preferences.confidence,
            recommendation_reason: `Similar to exercises you rated highly`,
            behavioral_match: preferences.preferred_categories
        }));
    }

    /**
     * 4. BALANCE & RECOVERY AI
     * Ensures balanced muscle group targeting and recovery
     */
    async getBalanceAndRecoveryRecommendations(user, exerciseHistory) {
        // Analyze recent workouts (last 7 days)
        const recentWorkouts = exerciseHistory.filter(session => {
            const daysDiff = (new Date() - new Date(session.performed_at)) / (1000 * 60 * 60 * 24);
            return daysDiff <= 7;
        });

        // Identify underworked muscle groups
        const muscleGroupBalance = this.analyzeMuscleGroupBalance(recentWorkouts);
        const underworkedGroups = muscleGroupBalance.underworked;

        if (underworkedGroups.length === 0) {
            return [];
        }

        // Find exercises targeting underworked muscle groups
        const balancingExercises = await Exercises.findAll({
            where: {
                is_active: true
            }
        });

        const recommendations = balancingExercises
            .filter(exercise => {
                const targetedGroups = this.extractMuscleGroups(exercise);
                return targetedGroups.some(group => underworkedGroups.includes(group));
            })
            .map(exercise => ({
                ...exercise.toJSON(),
                ai_score: 75,
                recommendation_reason: `Targets underworked muscle groups: ${underworkedGroups.join(', ')}`,
                balance_benefit: underworkedGroups
            }));

        return recommendations.slice(0, 4);
    }

    /**
     * 5. ADAPTIVE DIFFICULTY AI
     * Adjusts recommendations based on current fitness state
     */
    async getAdaptiveDifficultyRecommendations(user, exerciseHistory, options) {
        // Analyze recent performance to gauge current fitness state
        const recentPerformance = this.analyzeRecentPerformance(exerciseHistory);
        
        let difficultyAdjustment = 0;
        
        if (recentPerformance.trending_up) {
            difficultyAdjustment = 1; // Suggest harder exercises
        } else if (recentPerformance.trending_down) {
            difficultyAdjustment = -1; // Suggest easier exercises
        }

        // Factor in user's current energy/motivation (if provided)
        if (options.energy_level) {
            if (options.energy_level === 'low') difficultyAdjustment -= 1;
            if (options.energy_level === 'high') difficultyAdjustment += 1;
        }

        // Get exercises with adaptive difficulty
        const targetDifficulty = this.adjustDifficultyLevel(user.activity_level, difficultyAdjustment);
        
        const adaptiveExercises = await Exercises.findAll({
            where: {
                difficulty_level: targetDifficulty,
                is_active: true
            },
            limit: 5
        });

        return adaptiveExercises.map(exercise => ({
            ...exercise.toJSON(),
            ai_score: 60,
            recommendation_reason: `Adapted to your current fitness state`,
            difficulty_adjustment: difficultyAdjustment
        }));
    }

    /**
     * AI FUSION: Combine all recommendations intelligently
     */
    async fuseRecommendations(recommendations, user) {
        const allRecs = [
            ...recommendations.goalBased.map(r => ({ ...r, source: 'goal_based', weight: 0.35 })),
            ...recommendations.progressive.map(r => ({ ...r, source: 'progressive', weight: 0.25 })),
            ...recommendations.behavioral.map(r => ({ ...r, source: 'behavioral', weight: 0.20 })),
            ...recommendations.balance.map(r => ({ ...r, source: 'balance', weight: 0.15 })),
            ...recommendations.adaptive.map(r => ({ ...r, source: 'adaptive', weight: 0.05 }))
        ];

        // Remove duplicates and calculate final AI scores
        const uniqueRecs = this.deduplicateRecommendations(allRecs);
        
        // Apply final AI scoring
        const finalRecommendations = uniqueRecs.map(rec => ({
            ...rec,
            final_ai_score: Math.round(rec.ai_score * rec.weight),
            confidence: this.calculateConfidence(rec, user)
        }));

        return finalRecommendations
            .sort((a, b) => b.final_ai_score - a.final_ai_score)
            .slice(0, 10);
    }

    // Helper methods (simplified for brevity)
    async getUserFitnessProfile(firebaseUid) {
        return await Users.findOne({
            where: { firebase_uid: firebaseUid }
        });
    }

    async getUserExerciseHistory(userId, days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return await UserExercises.findAll({
            where: {
                user_id: userId,
                performed_at: { [Op.gte]: cutoffDate }
            },
            include: [{
                model: Exercises,
                as: 'exercise'
            }],
            order: [['performed_at', 'DESC']]
        });
    }

    calculateExperienceScore(exerciseHistory) {
        const totalWorkouts = exerciseHistory.length;
        const uniqueExercises = new Set(exerciseHistory.map(h => h.exercise_id)).size;
        return Math.min(100, (totalWorkouts * 2) + (uniqueExercises * 5));
    }

    generateGoalBasedReason(exercise, goalConfig) {
        if (goalConfig.calorie_focus) {
            return `Great for weight loss - burns ${exercise.calories_per_minute} cal/min`;
        }
        if (goalConfig.strength_focus) {
            return `Perfect for building muscle strength`;
        }
        return `Aligns with your fitness goal`;
    }

    // Additional helper methods would go here...
    groupExercisesByType(exerciseHistory) {
        return exerciseHistory.reduce((groups, session) => {
            const id = session.exercise_id;
            if (!groups[id]) groups[id] = [];
            groups[id].push(session);
            return groups;
        }, {});
    }

    deduplicateRecommendations(recommendations) {
        const seen = new Set();
        return recommendations.filter(rec => {
            if (seen.has(rec.id)) return false;
            seen.add(rec.id);
            return true;
        });
    }

    calculateConfidence(recommendation, user) {
        let confidence = 50; // Base confidence
        
        if (recommendation.source === 'goal_based') confidence += 30;
        if (recommendation.ai_score > 80) confidence += 20;
        
        return Math.min(100, confidence);
    }
}

module.exports = new AIRecommendationService();
