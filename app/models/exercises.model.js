const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    const Exercises = sequelize.define('Exercises', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        category: {
            type: DataTypes.ENUM('cardio', 'strength', 'flexibility', 'sports', 'functional'),
            allowNull: false
        },
        muscle_groups: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Array of muscle groups targeted'
        },
        equipment_needed: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'bodyweight'
        },
        difficulty_level: {
            type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
            allowNull: false,
            defaultValue: 'beginner'
        },
        calories_per_minute: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: true,
            validate: {
                min: 0,
                max: 50
            },
            comment: 'Approximate calories burned per minute for average person'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        instructions: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        video_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'exercises',
        timestamps: true,
        indexes: [
            {
                fields: ['category']
            },
            {
                fields: ['difficulty_level']
            },
            {
                fields: ['is_active']
            }
        ]
    });

    // Define associations
    Exercises.associate = function(models) {
        Exercises.hasMany(models.UserExercises, {
            foreignKey: 'exercise_id',
            as: 'userExercises'
        });
    };

    return Exercises;
};
