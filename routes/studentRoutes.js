// studentRoutes.js
const express = require('express');
const {addStudent, deleteStudent} = require('../controllers/studentController');
const dbAuthenticate = require('../middleware/dbAuthenticate');

const router = express.Router();

router.post('/addStudent', dbAuthenticate, addStudent);
router.delete('/deleteStudent', dbAuthenticate, deleteStudent);

module.exports = router;