'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('exercises', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      category: {
        type: Sequelize.ENUM('cardio', 'strength', 'flexibility', 'sports', 'functional'),
        allowNull: false
      },
      muscle_groups: {
        type: Sequelize.JSON,
        allowNull: true
      },
      equipment_needed: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'bodyweight'
      },
      difficulty_level: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced'),
        allowNull: false,
        defaultValue: 'beginner'
      },
      calories_per_minute: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      video_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      image_url: {
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

    // Add indexes
    await queryInterface.addIndex('exercises', ['category']);
    await queryInterface.addIndex('exercises', ['difficulty_level']);
    await queryInterface.addIndex('exercises', ['is_active']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('exercises');
  }
};
