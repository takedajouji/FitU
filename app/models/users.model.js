const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    const Users = sequelize.define('Users', {
        firebase_uid: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        date_of_birth: {
            type: DataTypes.DATE,
            allowNull: true
        },
        gender: {
            type: DataTypes.ENUM('male', 'female', 'other'),
            allowNull: true
        },
        height_cm: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 50,
                max: 300
            }
        },
        weight_kg: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            validate: {
                min: 10,
                max: 500
            }
        },
        activity_level: {
            type: DataTypes.ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'),
            defaultValue: 'moderately_active'
        },
        fitness_goal: {
            type: DataTypes.ENUM('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle', 'improve_fitness'),
            defaultValue: 'maintain_weight'
        },
        daily_calorie_goal: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1000,
                max: 5000
            }
        },
        profile_picture_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'users',
        timestamps: true
    });

    // Define associations
    Users.associate = function(models) {
        Users.hasMany(models.CalorieEntries, {
            foreignKey: 'user_id',
            as: 'calorieEntries'
        });
        Users.hasMany(models.UserExercises, {
            foreignKey: 'user_id',
            as: 'userExercises'
        });
    };

    return Users;
};