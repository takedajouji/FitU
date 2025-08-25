const db = require('../../../models');
const CalorieEntries = db.CalorieEntries;
const { Op } = require('sequelize');

// Create a new food entry
async function createFoodEntry(req, res) {
    try {
        const {
            food_name,
            brand,
            serving_size,
            calories_per_serving,
            servings_consumed,
            protein_g,
            carbs_g,
            fat_g,
            fiber_g,
            sugar_g,
            sodium_mg,
            meal_type,
            consumed_at,
            notes
        } = req.body;

        const newEntry = await CalorieEntries.create({
            user_id: req.user.uid, // From Firebase auth middleware
            food_name,
            brand,
            serving_size: serving_size || '1 serving',
            calories_per_serving,
            servings_consumed: servings_consumed || 1.0,
            protein_g: protein_g || 0,
            carbs_g: carbs_g || 0,
            fat_g: fat_g || 0,
            fiber_g: fiber_g || 0,
            sugar_g: sugar_g || 0,
            sodium_mg: sodium_mg || 0,
            meal_type: meal_type || 'snack',
            consumed_at: consumed_at || new Date(),
            notes
        });

        res.status(201).json({
            success: true,
            message: 'Food entry created successfully',
            data: newEntry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating food entry',
            error: error.message
        });
    }
}

// Get daily food entries for a user
async function getDailyFoodEntries(req, res) {
    try {
        const { date } = req.query; // Expected format: YYYY-MM-DD
        const targetDate = date ? new Date(date) : new Date();
        
        // Set start and end of day
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const entries = await CalorieEntries.findAll({
            where: {
                user_id: req.user.uid,
                consumed_at: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            },
            order: [['consumed_at', 'ASC']]
        });

        // Calculate daily totals
        const dailyTotals = entries.reduce((totals, entry) => {
            const totalCalories = entry.calories_per_serving * entry.servings_consumed;
            const totalProtein = (entry.protein_g || 0) * entry.servings_consumed;
            const totalCarbs = (entry.carbs_g || 0) * entry.servings_consumed;
            const totalFat = (entry.fat_g || 0) * entry.servings_consumed;
            const totalFiber = (entry.fiber_g || 0) * entry.servings_consumed;
            const totalSugar = (entry.sugar_g || 0) * entry.servings_consumed;
            const totalSodium = (entry.sodium_mg || 0) * entry.servings_consumed;

            return {
                total_calories: totals.total_calories + totalCalories,
                total_protein: totals.total_protein + totalProtein,
                total_carbs: totals.total_carbs + totalCarbs,
                total_fat: totals.total_fat + totalFat,
                total_fiber: totals.total_fiber + totalFiber,
                total_sugar: totals.total_sugar + totalSugar,
                total_sodium: totals.total_sodium + totalSodium,
                entry_count: totals.entry_count + 1
            };
        }, {
            total_calories: 0,
            total_protein: 0,
            total_carbs: 0,
            total_fat: 0,
            total_fiber: 0,
            total_sugar: 0,
            total_sodium: 0,
            entry_count: 0
        });

        res.status(200).json({
            success: true,
            data: {
                date: targetDate.toISOString().split('T')[0],
                entries,
                daily_totals: dailyTotals
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching daily food entries',
            error: error.message
        });
    }
}

// Update a food entry
async function updateFoodEntry(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const entry = await CalorieEntries.findOne({
            where: {
                id,
                user_id: req.user.uid
            }
        });

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Food entry not found'
            });
        }

        await entry.update(updateData);

        res.status(200).json({
            success: true,
            message: 'Food entry updated successfully',
            data: entry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating food entry',
            error: error.message
        });
    }
}

// Delete a food entry
async function deleteFoodEntry(req, res) {
    try {
        const { id } = req.params;

        const entry = await CalorieEntries.findOne({
            where: {
                id,
                user_id: req.user.uid
            }
        });

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Food entry not found'
            });
        }

        await entry.destroy();

        res.status(200).json({
            success: true,
            message: 'Food entry deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting food entry',
            error: error.message
        });
    }
}

module.exports = {
    createFoodEntry,
    getDailyFoodEntries,
    updateFoodEntry,
    deleteFoodEntry
};
