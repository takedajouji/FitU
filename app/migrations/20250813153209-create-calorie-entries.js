'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('calorie_entries', {
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
      food_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      brand: {
        type: Sequelize.STRING,
        allowNull: true
      },
      serving_size: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '1 serving'
      },
      calories_per_serving: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      servings_consumed: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
        defaultValue: 1.0
      },
      protein_g: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
        defaultValue: 0
      },
      carbs_g: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
        defaultValue: 0
      },
      fat_g: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
        defaultValue: 0
      },
      fiber_g: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
        defaultValue: 0
      },
      sugar_g: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
        defaultValue: 0
      },
      sodium_mg: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0
      },
      meal_type: {
        type: Sequelize.ENUM('breakfast', 'lunch', 'dinner', 'snack'),
        allowNull: false,
        defaultValue: 'snack'
      },
      consumed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      notes: {
        type: Sequelize.TEXT,
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
    await queryInterface.addIndex('calorie_entries', ['user_id', 'consumed_at']);
    await queryInterface.addIndex('calorie_entries', ['user_id', 'meal_type']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('calorie_entries');
  }
};
