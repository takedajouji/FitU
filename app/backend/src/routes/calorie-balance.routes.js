const express = require('express');
const router = express.Router();
const calorieTrackingService = require('../services/calorie-tracking.service');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route   GET /api/calorie-balance/daily
 * @desc    Get daily calorie balance (food vs exercise)
 * @access  Private
 * @query   date: string (optional, format: YYYY-MM-DD, default: today)
 * @response {
 *   success: boolean,
 *   data: {
 *     date: string,
 *     food_calories: number,
 *     exercise_calories: number,
 *     net_calories: number,
 *     daily_goal: number,
 *     calorie_balance: number,
 *     is_under_goal: boolean,
 *     is_over_goal: boolean,
 *     goal_percentage: number,
 *     status: string (UNDER_GOAL|OVER_GOAL|NO_GOAL_SET),
 *     remaining_calories: number,
 *     excess_calories: number
 *   }
 * }
 */
router.get('/daily', async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        
        // Validate date format if provided
        if (date && isNaN(targetDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD'
            });
        }

        const balance = await calorieTrackingService.calculateDailyBalance(
            req.user.uid, 
            targetDate
        );

        res.status(200).json({
            success: true,
            data: balance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error calculating daily calorie balance',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/calorie-balance/weekly
 * @desc    Get weekly calorie balance summary
 * @access  Private
 * @query   week_start: string (optional, format: YYYY-MM-DD, default: start of current week)
 * @response {
 *   success: boolean,
 *   data: {
 *     week_start: string,
 *     daily_balances: Array[7],
 *     weekly_totals: {
 *       total_food: number,
 *       total_exercise: number,
 *       total_net: number,
 *       days_under_goal: number,
 *       days_over_goal: number
 *     },
 *     weekly_average_net: number,
 *     success_rate: number
 *   }
 * }
 */
router.get('/weekly', async (req, res) => {
    try {
        const { week_start } = req.query;
        let weekStartDate = new Date();
        
        if (week_start) {
            weekStartDate = new Date(week_start);
            
            // Validate date format
            if (isNaN(weekStartDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid week_start date format. Use YYYY-MM-DD'
                });
            }
        } else {
            // Default to start of current week (Monday)
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Sunday
            weekStartDate.setDate(today.getDate() - mondayOffset);
        }

        const weeklyBalance = await calorieTrackingService.getWeeklyBalance(
            req.user.uid, 
            weekStartDate
        );

        res.status(200).json({
            success: true,
            data: weeklyBalance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error calculating weekly calorie balance',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/calorie-balance/summary
 * @desc    Get quick summary of today's calorie status
 * @access  Private
 * @response {
 *   success: boolean,
 *   data: {
 *     today: object (daily balance),
 *     quick_stats: {
 *       calories_remaining: number,
 *       can_eat_more: boolean,
 *       goal_completion: string
 *     }
 *   }
 * }
 */
router.get('/summary', async (req, res) => {
    try {
        const today = new Date();
        const balance = await calorieTrackingService.calculateDailyBalance(
            req.user.uid, 
            today
        );

        // Create quick stats for easy mobile app consumption
        const quickStats = {
            calories_remaining: balance.remaining_calories,
            calories_over: balance.excess_calories,
            can_eat_more: balance.is_under_goal && balance.daily_goal > 0,
            goal_completion: balance.daily_goal === 0 ? 
                'No goal set' : 
                `${balance.goal_percentage}% of goal`,
            net_calories_today: balance.net_calories
        };

        res.status(200).json({
            success: true,
            data: {
                today: balance,
                quick_stats: quickStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting calorie summary',
            error: error.message
        });
    }
});

module.exports = router;
