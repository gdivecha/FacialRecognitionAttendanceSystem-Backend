// studentRoutes.js
const express = require('express');
const {addStudent, deleteStudent, getStudentImages, deleteStudentImage, addStudentImages, processCapturedPhoto, getAllStudents, upload} = require('../controllers/studentController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/addStudent', authenticate, addStudent);
router.delete('/deleteStudent', authenticate, deleteStudent);
router.get('/getStudentImages', authenticate, getStudentImages);
router.delete('/deleteStudentImage', authenticate, deleteStudentImage);
router.get('/getAllStudents', authenticate, getAllStudents);
router.put('/addStudentImages', authenticate, upload.array('images', 10), addStudentImages);
router.post('/processCapturedPhoto', authenticate, upload.single('imageFile'), processCapturedPhoto);

module.exports = router;
