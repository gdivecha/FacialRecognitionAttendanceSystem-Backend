const databaseApiClient = require('../config/dbApiClient');
const compVisionApiClient = require('../config/compVisionApiClient');
const multer = require('multer');

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

const FormData = require('form-data');

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

const deleteStudent = async (req, res) => {
  try {
    const { courseCode, studentID } = req.query;

    // Validate inputs
    if (!courseCode || !studentID) {
      return res.status(400).json({ message: 'courseCode and studentID are required' });
    }

    // Step 1: Get Course from Course Code
    let courseObjectId;
    try {
      const courseResponse = await databaseApiClient.get('/api/course/getCourseFromCourseCode', {
        params: { courseCode },
      });
      courseObjectId = courseResponse.data.courseId;
      if (!courseObjectId) {
        return res.status(404).json({ message: 'Course not found' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error retrieving course', error: error.message });
    }

    // Step 2: Get all students enrolled in the course
    let enrolledStudentIds;
    try {
      const studentsResponse = await databaseApiClient.get(
        '/api/student/getStudentsEnrolledInCourse',
        { params: { courseObjectId } }
      );
      enrolledStudentIds = studentsResponse.data || [];
    } catch (error) {
      return res.status(500).json({ message: 'Error retrieving enrolled students', error: error.message });
    }

    // Step 3: Get the student object ID
    let studentObjectId;
    try {
      const studentResponse = await databaseApiClient.get('/api/student/getStudent', {
        params: { studentID },
      });
      studentObjectId = studentResponse.data.studentId;
      if (!studentObjectId) {
        return res.status(404).json({ message: 'Student not found' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error retrieving student details', error: error.message });
    }

    // Step 4: Get student information (courses array)
    let studentCourses;
    try {
      const studentInfoResponse = await databaseApiClient.get('/api/student/getStudentInformation', {
        params: { studentObjectID: studentObjectId },
      });
      studentCourses = studentInfoResponse.data.courses || [];
    } catch (error) {
      return res.status(500).json({ message: 'Error retrieving student information', error: error.message });
    }

    // Step 5: Determine action based on the data
    if (enrolledStudentIds.length === 1) {
      // If the student is the only one enrolled in the course
      if (studentCourses.length === 1) {
        // Delete student and course
        try {
          await databaseApiClient.delete('/api/student/deleteStudent', {
            params: { studentID },
          });
          await databaseApiClient.delete('/api/course/deleteCourse', {
            params: { courseCode },
          });
          return res.status(200).json({ message: 'Student and course deleted successfully' });
        } catch (error) {
          return res.status(500).json({ message: 'Error deleting student or course', error: error.message });
        }
      } else {
        // Unenroll student and delete course
        try {
          await databaseApiClient.put('/api/student/unenrollStudentFromCourse', {
            studentObjectId,
            courseObjectId,
          });
          await databaseApiClient.delete('/api/course/deleteCourse', {
            params: { courseCode },
          });
          return res.status(200).json({ message: 'Student unenrolled and course deleted successfully' });
        } catch (error) {
          return res.status(500).json({ message: 'Error unenrolling student or deleting course', error: error.message });
        }
      }
    } else {
      // Multiple students in the course
      if (studentCourses.length === 1) {
        // Delete student only
        try {
          await databaseApiClient.delete('/api/student/deleteStudent', {
            params: { studentID },
          });
          return res.status(200).json({ message: 'Student deleted successfully' });
        } catch (error) {
          return res.status(500).json({ message: 'Error deleting student', error: error.message });
        }
      } else {
        // Unenroll student only
        try {
          await databaseApiClient.put('/api/student/unenrollStudentFromCourse', {
            studentObjectId,
            courseObjectId,
          });
          return res.status(200).json({ message: 'Student unenrolled successfully' });
        } catch (error) {
          return res.status(500).json({ message: 'Error unenrolling student', error: error.message });
        }
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getStudentImages = async (req, res) => {
  try {
    const { studentID } = req.query;

    // Validate studentID input
    if (!studentID) {
      return res.status(400).json({
        message: 'studentID query parameter is required',
      });
    }

    // Step 1: Get the object ID of the student from the database
    const studentResponse = await databaseApiClient.get(
      '/api/student/getStudent',
      { params: { studentID } }
    );

    const studentObjectID = studentResponse.data.studentId;
    if (!studentObjectID) {
      return res.status(404).json({
        message: 'Student not found',
      });
    }

    // Step 2: Get all face images associated with the student
    const faceImagesResponse = await databaseApiClient.get(
      '/api/student/getStudentFaceImages',
      { params: { studentObjectId: studentObjectID } }
    );

    const faceImages = faceImagesResponse.data;
    if (!faceImages || faceImages.length === 0) {
      return res.status(404).json({
        message: 'No face images found for the student',
      });
    }

    // Return face images to the frontend
    res.status(200).json(faceImages);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching student face images',
      error: error.message,
    });
  }
};

const deleteStudentImage = async (req, res) => {
    try {
        const { studentID, imageID } = req.query;

        // Validate inputs
        if (!studentID || !imageID) {
            return res.status(400).json({
                message: 'Both studentID and imageID query parameters are required',
            });
        }

        // Step 1: Call the deleteStudentImage DB API
        const deleteResponse = await databaseApiClient.delete('/api/student/deleteStudentImage', {
            params: {
                studentID,
                imageID,
            },
        });

        // Step 2: Check response and handle success or failure
        if (deleteResponse.data.message === `Image with ID ${imageID} deleted successfully`) {
            return res.status(200).json({
                message: `Image with ID ${imageID} deleted successfully`,
                studentID,
            });
        }

        // If something unexpected happens
        return res.status(400).json({
            message: deleteResponse.data.message || 'Failed to delete the image',
        });
    } catch (error) {
        // Handle any error during API calls
        res.status(500).json({
            message: 'Error deleting student image',
            error: error.message,
        });
    }
};

const addStudentImages = async (req, res) => {
  try {
    const { studentID } = req.body; // Extract student ID from the request body
    const files = req.files; // Extract uploaded image files from the request

    // Validate inputs
    if (!studentID || !files || files.length === 0) {
      return res.status(400).json({
        message: 'Student ID and images are required',
      });
    }

    // Prepare form-data for the DB API call
    const formData = new FormData();
    formData.append('studentID', studentID);

    files.forEach((file) => {
      formData.append('images', file.buffer, file.originalname); // Add files to form-data
    });

    // Call the DB API to upload images
    const response = await databaseApiClient.put(
      '/api/student/uploadStudentFaceImages',
      formData,
      { headers: formData.getHeaders() }
    );

    // Forward the DB API response back to the client
    res.status(response.status).json(response.data);
  } catch (error) {
    // Handle errors and return a 500 status code
    res.status(500).json({
      message: 'Error in addStudentImages API',
      error: error.message,
    });
  }
};

const getAllStudents = async (req, res) => {
  const { professorEmail } = req.query;

  if (!professorEmail) {
    return res.status(400).json({ message: 'Professor email is required' });
  }

  try {
    // Step 1: Fetch all courses taught by the professor
    const coursesResponse = await databaseApiClient.get(`/api/course/getCoursesFromProfEmail`, {
      params: { professorEmail },
    });

    const courses = coursesResponse.data;

    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(200).json({
        message: 'No courses found for the provided professor email',
        students: [],
      });
    }

    const allStudents = [];

    // Step 2: Iterate over each course taught by the professor
    for (const courseObjectId of courses) {
      try {
        console.log(`Processing courseObjectId: ${courseObjectId}`);

        // Step 2a: Get all students enrolled in the course
        const studentsResponse = await databaseApiClient.get(
          `/api/student/getStudentsEnrolledInCourse`,
          {
            params: { courseObjectId },
          }
        );

        const studentObjectIDs = studentsResponse.data;

        if (!Array.isArray(studentObjectIDs) || studentObjectIDs.length === 0) {
          console.log(`No students found for courseObjectId: ${courseObjectId}`);
          continue; // Skip if no students are enrolled in the course
        }

        // Step 3: Fetch details for each student enrolled in the course
        for (const studentObjectID of studentObjectIDs) {
          try {
            // Step 3a: Fetch full student information using the studentObjectID
            const studentInfoResponse = await databaseApiClient.get(
              `/api/student/getStudentInformation`,
              {
                params: { studentObjectID },
              }
            );

            if (
              !studentInfoResponse.data ||
              studentInfoResponse.data.message === 'Student not found'
            ) {
              continue; // Skip if student information is not found
            }

            const { firstName, lastName, email, studentID } = studentInfoResponse.data;

            // Add the student information to the final array
            allStudents.push({
              firstName,
              lastName,
              email,
              studentID,
              courseObjectId, // Directly include courseObjectId instead of courseID
            });
          } catch (studentError) {
            console.error(
              `Error fetching information for studentObjectID: ${studentObjectID}`,
              studentError.message
            );
          }
        }
      } catch (courseError) {
        console.error(`Error processing courseObjectId: ${courseObjectId}`, courseError.message);
      }
    }

    // Return the collected student data
    return res.status(200).json(allStudents);
  } catch (error) {
    console.error('Error fetching students:', error.message);
    return res.status(500).json({
      message: 'An error occurred while fetching students',
      error: error.message,
    });
  }
};

const processCapturedPhoto = async (req, res) => {
  try {
    const { studentID, courseCode } = req.body; // Extract student ID and course code
    const imageFile = req.file; // Extract single image file from the request

    // Validate inputs
    if (!studentID || !courseCode || !imageFile) {
      return res.status(400).json({
        message: "Student ID, course code, and image file are required",
      });
    }

    // Step 1: Get the student object ID
    const studentResponse = await databaseApiClient.get(
      `/api/student/getStudent`,
      { params: { studentID } }
    );

    const studentObjectID = studentResponse.data?.studentId;
    if (!studentObjectID) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // Step 2: Retrieve all face images for the student
    const studentImagesResponse = await databaseApiClient.get(
      `/api/student/getStudentFaceImages`,
      { params: { studentObjectId: studentObjectID } }
    );

    const studentImages = studentImagesResponse.data || [];
    const totalStudentFaceImages = studentImages.length;

    if (totalStudentFaceImages === 0) {
      return res.status(200).json({
        validMatch: false,
        message: "No student face images found.",
      });
    }

    // Step 3: Initialize variables for matching logic
    let totalMatches = 0;

    // Step 4: Compare the input image with each stored student image
    for (const image of studentImages) {
      // Prepare form-data payload for the Computer Vision API
      const formData = new FormData();
      formData.append("anchor", Buffer.from(image.data), {
        filename: "anchor.jpeg",
        contentType: "image/jpeg",
      });
      formData.append("validation", imageFile.buffer, {
        filename: imageFile.originalname,
        contentType: "image/jpeg",
      });

      // Call the Computer Vision API
      const predictResponse = await compVisionApiClient.post(
        "/predict",
        formData,
        {
          headers: formData.getHeaders(),
        }
      );

      // Increment match count if images match
      if (predictResponse.data.is_match) {
        totalMatches++;
      }
    }

    // Step 5: Determine match validity
    const matchPercentage = (totalMatches / totalStudentFaceImages) * 100;
    const validMatch = matchPercentage > 80;

    // Step 6: If valid match, create an attendance record
    if (validMatch) {
      // Step 6.1: Create attendance record
      const attendanceResponse = await databaseApiClient.post(
        `/api/attendance/createAttendanceRecord`,
        { courseCode }
      );

      const attendanceId = attendanceResponse.data.attendanceId;

      // Step 6.2: Attach attendance to the student
      await databaseApiClient.put(`/api/student/attachAttendanceToStudent`, {
        studentId: studentObjectID,
        attendanceId,
      });

      return res.status(200).json({
        validMatch: true,
        message: "Attendance recorded successfully.",
      });
    }

    // If no valid match, return failure
    return res.status(200).json({
      validMatch: false,
      message: "Face match failed.",
    });
  } catch (error) {
    // Handle errors
    console.error("Error in processCapturedPhoto API:", error.message);
    res.status(500).json({
      message: "Error in processCapturedPhoto API",
      error: error.message,
    });
  }
};

module.exports = { 
    addStudent,
    deleteStudent,
    getStudentImages,
    deleteStudentImage,
    addStudentImages,
    processCapturedPhoto,
    getAllStudents,
    upload, 
};
