const databaseApiClient = require('../config/dbApiClient');

const addStudent = async (req, res) => {
  try {
    const { firstName, lastName, email, studentID, courseCode, professorEmail } = req.body;

    // Step 1: Get Course from Course Code
    let courseObjectId;
    let courseCreated = false;
    try {
      const courseResponse = await databaseApiClient.get(`/api/course/getCourseFromCourseCode`, {
        params: { courseCode },
      });
      courseObjectId = courseResponse.data.courseId;
    } catch (error) {
      return res.status(500).json({ message: 'Error retrieving course', error: error.message });
    }

    // If course doesn't exist, create it
    if (!courseObjectId) {
      try {
        const createCourseResponse = await databaseApiClient.post(`/api/course/createCourse`, {
          courseCode,
          professorEmail,
        });
        if (createCourseResponse.data.message) {
          return res.status(400).json({ message: createCourseResponse.data.message });
        }
        courseObjectId = createCourseResponse.data.courseId;
        courseCreated = true; // Course has been created
      } catch (error) {
        return res.status(500).json({ message: 'Error creating course', error: error.message });
      }
    }

    // Step 2: Get Student from Student ID
    let studentObjectId;
    let studentCreated = false;
    try {
      const studentResponse = await databaseApiClient.get(`/api/student/getStudent`, {
        params: { studentID },
      });
      studentObjectId = studentResponse.data.studentId;
    } catch (error) {
      return res.status(500).json({ message: 'Error retrieving student', error: error.message });
    }

    // If student doesn't exist, create them
    if (!studentObjectId) {
      try {
        const createStudentResponse = await databaseApiClient.post(`/api/student/createStudent`, {
          firstName,
          lastName,
          email,
          studentID,
          courseObjectId,
        });
        if (createStudentResponse.data.message) {
          return res.status(400).json({ message: createStudentResponse.data.message });
        }
        studentObjectId = createStudentResponse.data.studentId;
        studentCreated = true; // Student has been created
      } catch (error) {
        return res.status(500).json({ message: 'Error creating student', error: error.message });
      }
    }

    // Step 3: Check if student is already enrolled in the course
    let studentHasCourse = false;
    try {
      const enrollmentCheckResponse = await databaseApiClient.get(
        `/api/student/isStudentEnrolledInCourse`,
        { params: { studentObjectId, courseObjectId } }
      );
      studentHasCourse = enrollmentCheckResponse.data.studentHasCourse;
    } catch (error) {
      return res.status(500).json({ message: 'Error checking enrollment status', error: error.message });
    }

    // If student is already enrolled, return the appropriate message
    if (studentHasCourse) {
      if (studentCreated || courseCreated) {
        return res.status(200).json({
          student: studentCreated ? 'new' : 'exists',
          course: courseCreated ? 'new' : 'exists',
          interaction: 'student enrols in course',
        });
      } else {
        return res.status(200).json({
          student: 'exists',
          course: 'exists',
          interaction: 'student already enrolled in course',
        });
      }
    }

    // Step 4: Enroll Student in Course
    try {
      const enrollResponse = await databaseApiClient.put(`/api/student/enrollStudentToCourse`, {
        studentObjectId,
        courseObjectId,
      });

      if (enrollResponse.data.message !== 'Course successfully added to student') {
        return res.status(400).json({ message: enrollResponse.data.message });
      }

      // Custom response messages
      if (courseCreated && studentCreated) {
        return res.status(201).json({
          student: 'new',
          course: 'new',
          interaction: 'student enrols in course',
        });
      } else if (studentCreated) {
        return res.status(201).json({
          student: 'new',
          course: 'exists',
          interaction: 'student enrols in course',
        });
      } else if (courseCreated) {
        return res.status(201).json({
          student: 'exists',
          course: 'new',
          interaction: 'student enrols in course',
        });
      } else {
        return res.status(201).json({
          student: 'exists',
          course: 'exists',
          interaction: 'student enrols in course',
        });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error enrolling student in course', error: error.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = { addStudent };