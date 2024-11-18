const dotenv = require('dotenv');

require('dotenv').config();

// Core imports
const express = require('express');
const cors = require('cors'); // For handling CORS
const morgan = require('morgan'); // For logging HTTP requests
const professorRoutes = require('./routes/professorRoutes');

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Log requests to the console

// Base routes
app.use('/api/professor', professorRoutes); // Professor-related APIs

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Backend is up and running!' });
});

// Handle 404 for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start the server
const PORT = process.env.PORT || 5002; // Use port from .env or default to 5002
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

