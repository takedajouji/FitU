'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('user_exercises', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      exercise_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'exercises',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      sets: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      reps: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      weight_kg: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true
      },
      distance_km: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true
      },
      calories_burned: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      performed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: true
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

    // Add indexes
    await queryInterface.addIndex('user_exercises', ['user_id', 'performed_at']);
    await queryInterface.addIndex('user_exercises', ['exercise_id']);
    await queryInterface.addIndex('user_exercises', ['user_id', 'exercise_id']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('user_exercises');
  }
};
