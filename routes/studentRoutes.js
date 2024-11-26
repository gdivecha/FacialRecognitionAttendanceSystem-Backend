// studentRoutes.js
const express = require('express');
const {addStudent, deleteStudent, getStudentImages, deleteStudentImage} = require('../controllers/studentController');
const dbAuthenticate = require('../middleware/dbAuthenticate');

const router = express.Router();

router.post('/addStudent', dbAuthenticate, addStudent);
router.delete('/deleteStudent', dbAuthenticate, deleteStudent);
router.get('/getStudentImages', getStudentImages);
router.delete('/deleteStudentImage', deleteStudentImage);

module.exports = router;