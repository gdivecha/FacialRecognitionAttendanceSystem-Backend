const express = require('express');
const professorController = require('../controllers/professorController');
const dbAuthenticate = require('../middleware/dbAuthenticate'); // Ensure database API key is checked

const router = express.Router();

// Route for creating professor accounts
router.post('/createProfAccount', dbAuthenticate, professorController.createProfAccount);

module.exports = router;
