const express = require('express');
const { createProfAccount } = require('../controllers/professorController');
const authenticate = require('../middleware/authenticate'); // Ensure database API key is checked

const router = express.Router();

// Route for creating professor accounts
router.post('/createProfAccount', authenticate, createProfAccount);

module.exports = router;
