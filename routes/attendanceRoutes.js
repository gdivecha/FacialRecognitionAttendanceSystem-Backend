const express = require('express');
const { getRecords } = require('../controllers/attendanceController');
const authenticate = require('../middleware/authenticate'); // Ensure database API key is checked

const router = express.Router();

// Define the GET route for getRecords
router.get('/getRecords', authenticate, getRecords);

module.exports = router;
