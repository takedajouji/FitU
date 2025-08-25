const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import database models
const db = require('../../models');

// Import routes
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Request logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: '🏃‍♂️ Welcome to FitU API!',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            food_logging: '/api/calorie-entries',
            calorie_balance: '/api/calorie-balance'
        }
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('🚨 Server Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler for non-API routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        suggestion: 'Try /api/health to check if the API is running'
    });
});

// Test database connection and start server
async function startServer() {
    try {
        // Test database connection
        await db.sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 FitU API server running on port ${PORT}`);
            console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
            console.log(`📖 API docs: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down server...');
    await db.sequelize.close();
    console.log('✅ Database connection closed.');
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
