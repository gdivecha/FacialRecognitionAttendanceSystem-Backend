// studentRoutes.js
const express = require('express');
const {addStudent, deleteStudent, getStudentImages} = require('../controllers/studentController');
const dbAuthenticate = require('../middleware/dbAuthenticate');

const router = express.Router();

router.post('/addStudent', dbAuthenticate, addStudent);
router.delete('/deleteStudent', dbAuthenticate, deleteStudent);
router.get('/getStudentImages', getStudentImages);

module.exports = router;