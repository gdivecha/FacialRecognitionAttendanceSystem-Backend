// studentRoutes.js
const express = require('express');
const {addStudent, deleteStudent, getStudentImages, deleteStudentImage, addStudentImages, upload} = require('../controllers/studentController');
const dbAuthenticate = require('../middleware/dbAuthenticate');

const router = express.Router();

router.post('/addStudent', dbAuthenticate, addStudent);
router.delete('/deleteStudent', dbAuthenticate, deleteStudent);
router.get('/getStudentImages', dbAuthenticate, getStudentImages);
router.delete('/deleteStudentImage', dbAuthenticate, deleteStudentImage);
router.put('/addStudentImages', dbAuthenticate, upload.array('images', 10), addStudentImages);

module.exports = router;