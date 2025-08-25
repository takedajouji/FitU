const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    const CalorieEntries = sequelize.define('CalorieEntries', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        food_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        brand: {
            type: DataTypes.STRING,
            allowNull: true
        },
        serving_size: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '1 serving'
        },
        calories_per_serving: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
                max: 10000
            }
        },
        servings_consumed: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: false,
            defaultValue: 1.0,
            validate: {
                min: 0.01,
                max: 100
            }
        },
        total_calories: {
            type: DataTypes.VIRTUAL,
            get() {
                return Math.round(this.calories_per_serving * this.servings_consumed);
            }
        },
        protein_g: {
            type: DataTypes.DECIMAL(6, 2),
            allowNull: true,
            defaultValue: 0
        },
        carbs_g: {
            type: DataTypes.DECIMAL(6, 2),
            allowNull: true,
            defaultValue: 0
        },
        fat_g: {
            type: DataTypes.DECIMAL(6, 2),
            allowNull: true,
            defaultValue: 0
        },
        fiber_g: {
            type: DataTypes.DECIMAL(6, 2),
            allowNull: true,
            defaultValue: 0
        },
        sugar_g: {
            type: DataTypes.DECIMAL(6, 2),
            allowNull: true,
            defaultValue: 0
        },
        sodium_mg: {
            type: DataTypes.DECIMAL(8, 2),
            allowNull: true,
            defaultValue: 0
        },
        meal_type: {
            type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack'),
            allowNull: false,
            defaultValue: 'snack'
        },
        consumed_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'calorie_entries',
        timestamps: true,
        indexes: [
            {
                fields: ['user_id', 'consumed_at']
            },
            {
                fields: ['user_id', 'meal_type']
            }
        ]
    });

    // Define associations
    CalorieEntries.associate = function(models) {
        CalorieEntries.belongsTo(models.Users, {
            foreignKey: 'user_id',
            as: 'user'
        });
    };

    return CalorieEntries;
};
