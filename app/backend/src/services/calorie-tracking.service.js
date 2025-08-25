const db = require('../../../models');
const CalorieEntries = db.CalorieEntries;
const UserExercises = db.UserExercises;
const Users = db.Users;
const { Op } = require('sequelize');

/**
 * Calculate daily calorie balance for a user
 * Formula: Net Calories = Food Calories - Exercise Calories
 * Goal Check: Net Calories vs Daily Calorie Goal
 */
class CalorieTrackingService {
    
    /**
     * Get total food calories for a specific date
     * @param {string} userId - User's Firebase UID
     * @param {Date} date - Target date
     * @returns {Promise<number>} Total calories consumed
     */
    async getDailyFoodCalories(userId, date) {
        try {
            // Convert Firebase UID to integer user ID
            const user = await Users.findOne({
                where: { firebase_uid: userId },
                attributes: ['id']
            });

            if (!user) {
                return 0; // User not found, return 0 calories
            }

            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const foodEntries = await CalorieEntries.findAll({
                where: {
                    user_id: user.id,
                    consumed_at: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                }
            });

            const totalFoodCalories = foodEntries.reduce((total, entry) => {
                return total + (entry.calories_per_serving * entry.servings_consumed);
            }, 0);

            return Math.round(totalFoodCalories);
        } catch (error) {
            throw new Error(`Error calculating daily food calories: ${error.message}`);
        }
    }

    /**
     * Get total exercise calories burned for a specific date
     * @param {string} userId - User's Firebase UID
     * @param {Date} date - Target date
     * @returns {Promise<number>} Total calories burned
     */
    async getDailyExerciseCalories(userId, date) {
        try {
            // Convert Firebase UID to integer user ID
            const user = await Users.findOne({
                where: { firebase_uid: userId },
                attributes: ['id']
            });

            if (!user) {
                return 0; // User not found, return 0 calories
            }

            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const exerciseEntries = await UserExercises.findAll({
                where: {
                    user_id: user.id,
                    performed_at: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                }
            });

            const totalExerciseCalories = exerciseEntries.reduce((total, entry) => {
                return total + (entry.calories_burned || 0);
            }, 0);

            return Math.round(totalExerciseCalories);
        } catch (error) {
            throw new Error(`Error calculating daily exercise calories: ${error.message}`);
        }
    }

    /**
     * Get user's daily calorie goal
     * @param {string} userId - User's Firebase UID
     * @returns {Promise<number>} Daily calorie goal (defaults to 0 if not set)
     */
    async getUserDailyGoal(userId) {
        try {
            const user = await Users.findOne({
                where: { firebase_uid: userId },
                attributes: ['daily_calorie_goal']
            });

            // If user not found or no goal set, default to 0
            if (!user || !user.daily_calorie_goal) {
                return 0;
            }

            return user.daily_calorie_goal;
        } catch (error) {
            // On any error, default to 0 instead of throwing
            console.warn(`Warning: Could not fetch user daily goal for ${userId}, defaulting to 0:`, error.message);
            return 0;
        }
    }

    /**
     * Calculate complete daily calorie balance
     * @param {string} userId - User's Firebase UID
     * @param {Date} date - Target date (defaults to today)
     * @returns {Promise<Object>} Complete calorie balance report
     */
    async calculateDailyBalance(userId, date = new Date()) {
        try {
            // Get all the data in parallel for efficiency
            const [foodCalories, exerciseCalories, dailyGoal] = await Promise.all([
                this.getDailyFoodCalories(userId, date),
                this.getDailyExerciseCalories(userId, date),
                this.getUserDailyGoal(userId)
            ]);

            // Core calculation: Net Calories = Food - Exercise
            const netCalories = foodCalories - exerciseCalories;
            
            // Goal comparison (when goal is 0, just show the totals)
            const calorieBalance = dailyGoal - netCalories;
            const isUnderGoal = dailyGoal === 0 ? true : netCalories <= dailyGoal;
            const isOverGoal = dailyGoal === 0 ? false : netCalories > dailyGoal;

            // Calculate percentages (avoid division by zero)
            const goalPercentage = dailyGoal > 0 ? Math.round((netCalories / dailyGoal) * 100) : 0;
            
            return {
                date: date.toISOString().split('T')[0],
                food_calories: foodCalories,
                exercise_calories: exerciseCalories,
                net_calories: netCalories,
                daily_goal: dailyGoal,
                calorie_balance: calorieBalance, // Positive = under goal, Negative = over goal
                is_under_goal: isUnderGoal,
                is_over_goal: isOverGoal,
                goal_percentage: goalPercentage,
                status: dailyGoal === 0 ? 'NO_GOAL_SET' : (isUnderGoal ? 'UNDER_GOAL' : 'OVER_GOAL'),
                remaining_calories: (dailyGoal > 0 && isUnderGoal) ? calorieBalance : 0,
                excess_calories: (dailyGoal > 0 && isOverGoal) ? Math.abs(calorieBalance) : 0
            };
        } catch (error) {
            throw new Error(`Error calculating daily balance: ${error.message}`);
        }
    }

    /**
     * Get weekly calorie balance summary
     * @param {string} userId - User's Firebase UID
     * @param {Date} weekStartDate - Start of the week
     * @returns {Promise<Object>} Weekly summary
     */
    async getWeeklyBalance(userId, weekStartDate = new Date()) {
        try {
            const weekDays = [];
            
            // Calculate for 7 days starting from weekStartDate
            for (let i = 0; i < 7; i++) {
                const currentDate = new Date(weekStartDate);
                currentDate.setDate(weekStartDate.getDate() + i);
                
                const dayBalance = await this.calculateDailyBalance(userId, currentDate);
                weekDays.push(dayBalance);
            }

            // Calculate weekly totals
            const weeklyTotals = weekDays.reduce((totals, day) => ({
                total_food: totals.total_food + day.food_calories,
                total_exercise: totals.total_exercise + day.exercise_calories,
                total_net: totals.total_net + day.net_calories,
                days_under_goal: totals.days_under_goal + (day.is_under_goal ? 1 : 0),
                days_over_goal: totals.days_over_goal + (day.is_over_goal ? 1 : 0)
            }), {
                total_food: 0,
                total_exercise: 0,
                total_net: 0,
                days_under_goal: 0,
                days_over_goal: 0
            });

            return {
                week_start: weekStartDate.toISOString().split('T')[0],
                daily_balances: weekDays,
                weekly_totals: weeklyTotals,
                weekly_average_net: Math.round(weeklyTotals.total_net / 7),
                success_rate: Math.round((weeklyTotals.days_under_goal / 7) * 100)
            };
        } catch (error) {
            throw new Error(`Error calculating weekly balance: ${error.message}`);
        }
    }
}

module.exports = new CalorieTrackingService();
