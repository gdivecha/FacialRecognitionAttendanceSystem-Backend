const express = require('express');
const { getRecords } = require('../controllers/attendanceController');

const router = express.Router();

// Define the GET route for getRecords
router.get('/getRecords', getRecords);

module.exports = router;
