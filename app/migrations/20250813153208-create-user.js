'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firebase_uid: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      date_of_birth: {
        type: Sequelize.DATE,
        allowNull: true
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: true
      },
      height_cm: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      weight_kg: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      activity_level: {
        type: Sequelize.ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'),
        defaultValue: 'moderately_active'
      },
      fitness_goal: {
        type: Sequelize.ENUM('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle', 'improve_fitness'),
        defaultValue: 'maintain_weight'
      },
      daily_calorie_goal: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      profile_picture_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
