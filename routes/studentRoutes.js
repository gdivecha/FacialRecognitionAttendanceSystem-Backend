// studentRoutes.js
const express = require('express');
const studentController = require('../controllers/studentController');
const dbAuthenticate = require('../middleware/dbAuthenticate');

const router = express.Router();

// Route to add a student
router.post('/addStudent', dbAuthenticate, studentController.addStudent);

module.exports = router;