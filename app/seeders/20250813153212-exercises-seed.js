'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('exercises', [
      // Cardio exercises
      {
        name: 'Running',
        category: 'cardio',
        muscle_groups: JSON.stringify(['legs', 'core']),
        equipment_needed: 'none',
        difficulty_level: 'beginner',
        calories_per_minute: 12.0,
        description: 'Running at moderate pace for cardiovascular fitness',
        instructions: 'Maintain a steady pace, land on midfoot, keep arms relaxed',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Walking',
        category: 'cardio',
        muscle_groups: JSON.stringify(['legs']),
        equipment_needed: 'none',
        difficulty_level: 'beginner',
        calories_per_minute: 5.0,
        description: 'Brisk walking for low-impact cardio',
        instructions: 'Maintain good posture, swing arms naturally, breathe steadily',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jumping Jacks',
        category: 'cardio',
        muscle_groups: JSON.stringify(['full_body']),
        equipment_needed: 'none',
        difficulty_level: 'beginner',
        calories_per_minute: 8.0,
        description: 'Full body cardio exercise',
        instructions: 'Jump feet apart while raising arms overhead, return to starting position',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Strength exercises
      {
        name: 'Push-ups',
        category: 'strength',
        muscle_groups: JSON.stringify(['chest', 'shoulders', 'triceps', 'core']),
        equipment_needed: 'none',
        difficulty_level: 'beginner',
        calories_per_minute: 7.0,
        description: 'Upper body strength exercise',
        instructions: 'Keep body straight, lower chest to floor, push back up',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Squats',
        category: 'strength',
        muscle_groups: JSON.stringify(['quadriceps', 'glutes', 'hamstrings']),
        equipment_needed: 'none',
        difficulty_level: 'beginner',
        calories_per_minute: 6.0,
        description: 'Lower body strength exercise',
        instructions: 'Keep chest up, lower hips back and down, push through heels to stand',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Planks',
        category: 'strength',
        muscle_groups: JSON.stringify(['core', 'shoulders']),
        equipment_needed: 'none',
        difficulty_level: 'beginner',
        calories_per_minute: 4.0,
        description: 'Core strengthening exercise',
        instructions: 'Hold straight line from head to heels, engage core muscles',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pull-ups',
        category: 'strength',
        muscle_groups: JSON.stringify(['back', 'biceps', 'shoulders']),
        equipment_needed: 'pull-up bar',
        difficulty_level: 'intermediate',
        calories_per_minute: 8.0,
        description: 'Upper body pulling exercise',
        instructions: 'Hang from bar, pull chin over bar, lower with control',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Flexibility exercises
      {
        name: 'Yoga Flow',
        category: 'flexibility',
        muscle_groups: JSON.stringify(['full_body']),
        equipment_needed: 'yoga mat',
        difficulty_level: 'beginner',
        calories_per_minute: 3.0,
        description: 'Flowing yoga sequence for flexibility and relaxation',
        instructions: 'Move smoothly between poses, focus on breathing',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Static Stretching',
        category: 'flexibility',
        muscle_groups: JSON.stringify(['full_body']),
        equipment_needed: 'none',
        difficulty_level: 'beginner',
        calories_per_minute: 2.0,
        description: 'Hold stretches to improve flexibility',
        instructions: 'Hold each stretch for 15-30 seconds, breathe deeply',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Functional exercises
      {
        name: 'Burpees',
        category: 'functional',
        muscle_groups: JSON.stringify(['full_body']),
        equipment_needed: 'none',
        difficulty_level: 'intermediate',
        calories_per_minute: 15.0,
        description: 'Full body functional movement',
        instructions: 'Squat, jump back to plank, push-up, jump forward, jump up',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('exercises', null, {});
  }
};
