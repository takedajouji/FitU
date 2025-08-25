const express = require('express');
const router = express.Router();
const calorieEntriesController = require('../controllers/calorie-entries.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route   POST /api/calorie-entries
 * @desc    Create a new food entry
 * @access  Private
 * @body    {
 *   food_name: string (required),
 *   brand: string (optional),
 *   serving_size: string (optional, default: "1 serving"),
 *   calories_per_serving: number (required),
 *   servings_consumed: number (optional, default: 1.0),
 *   protein_g: number (optional),
 *   carbs_g: number (optional),
 *   fat_g: number (optional),
 *   fiber_g: number (optional),
 *   sugar_g: number (optional),
 *   sodium_mg: number (optional),
 *   meal_type: string (optional, enum: breakfast|lunch|dinner|snack),
 *   consumed_at: datetime (optional, default: now),
 *   notes: string (optional)
 * }
 */
router.post('/', calorieEntriesController.createFoodEntry);

/**
 * @route   GET /api/calorie-entries/daily
 * @desc    Get daily food entries with totals
 * @access  Private
 * @query   date: string (optional, format: YYYY-MM-DD, default: today)
 * @response {
 *   success: boolean,
 *   data: {
 *     date: string,
 *     entries: Array,
 *     daily_totals: {
 *       total_calories: number,
 *       total_protein: number,
 *       total_carbs: number,
 *       total_fat: number,
 *       total_fiber: number,
 *       total_sugar: number,
 *       total_sodium: number,
 *       entry_count: number
 *     }
 *   }
 * }
 */
router.get('/daily', calorieEntriesController.getDailyFoodEntries);

/**
 * @route   PUT /api/calorie-entries/:id
 * @desc    Update a food entry
 * @access  Private (user can only update their own entries)
 * @params  id: number (food entry ID)
 * @body    Any field from the create endpoint
 */
router.put('/:id', calorieEntriesController.updateFoodEntry);

/**
 * @route   DELETE /api/calorie-entries/:id
 * @desc    Delete a food entry
 * @access  Private (user can only delete their own entries)
 * @params  id: number (food entry ID)
 */
router.delete('/:id', calorieEntriesController.deleteFoodEntry);

module.exports = router;
