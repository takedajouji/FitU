const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    const UserExercises = sequelize.define('UserExercises', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        exercise_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'exercises',
                key: 'id'
            }
        },
        duration_minutes: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
                max: 1440 // 24 hours max
            }
        },
        sets: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
                max: 100
            }
        },
        reps: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
                max: 1000
            }
        },
        weight_kg: {
            type: DataTypes.DECIMAL(6, 2),
            allowNull: true,
            validate: {
                min: 0,
                max: 1000
            }
        },
        distance_km: {
            type: DataTypes.DECIMAL(6, 2),
            allowNull: true,
            validate: {
                min: 0,
                max: 1000
            }
        },
        calories_burned: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 0,
                max: 5000
            }
        },
        performed_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
                max: 5
            },
            comment: 'User rating of the exercise session (1-5 stars)'
        }
    }, {
        tableName: 'user_exercises',
        timestamps: true,
        indexes: [
            {
                fields: ['user_id', 'performed_at']
            },
            {
                fields: ['exercise_id']
            },
            {
                fields: ['user_id', 'exercise_id']
            }
        ]
    });

    // Define associations
    UserExercises.associate = function(models) {
        UserExercises.belongsTo(models.Users, {
            foreignKey: 'user_id',
            as: 'user'
        });
        UserExercises.belongsTo(models.Exercises, {
            foreignKey: 'exercise_id',
            as: 'exercise'
        });
    };

    return UserExercises;
};
