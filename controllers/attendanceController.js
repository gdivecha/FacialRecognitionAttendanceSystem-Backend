const databaseApiClient = require('../config/dbApiClient');

const getRecords = async (req, res) => {
  try {
    const { professorEmail } = req.query;

    // Validate professorEmail input
    if (!professorEmail) {
      return res.status(400).json({
        message: 'professorEmail query parameter is required',
      });
    }

    // Step 1: Get all courses taught by the professor
    let courseObjectIds = [];
    try {
      const coursesResponse = await databaseApiClient.get(
        '/api/course/getCoursesFromProfEmail',
        { params: { professorEmail } }
      );
      courseObjectIds = coursesResponse.data; // Array of course object IDs
    } catch (error) {
      console.error('Error at Step 1: Fetching courses for professor', error.message);
      throw new Error('Error fetching courses for professor');
    }

    if (!courseObjectIds || courseObjectIds.length === 0) {
      return res.status(200).json({
        studentRecords: [],
        message: 'No courses found for the professor',
      });
    }

    const studentRecordsForCoursesOfThisProf = [];

    // Step 2: Iterate over each course
    for (const courseObjectId of courseObjectIds) {
      let courseCode = null;
      try {
        // Step 3: Get course code from course object ID
        const courseCodeResponse = await databaseApiClient.get(
          '/api/course/getCourseIDFromObjectID',
          { params: { courseObjectID: courseObjectId } }
        );
        courseCode = courseCodeResponse.data.courseID;
      } catch (error) {
        console.error(`Error at Step 3: Fetching course code for CourseObjectID: ${courseObjectId}`, error.message);
        continue; // Skip this course if fetching course code fails
      }

      if (!courseCode) {
        console.warn(`Warning at Step 3: No course code found for CourseObjectID: ${courseObjectId}`);
        continue;
      }

      let studentObjectIds = [];
      try {
        // Step 4: Get students enrolled in the course
        const studentsResponse = await databaseApiClient.get(
          '/api/student/getStudentsEnrolledInCourse',
          { params: { courseObjectId } }
        );
        studentObjectIds = studentsResponse.data || [];
      } catch (error) {
        console.error(`Error at Step 4: Fetching students for CourseObjectID: ${courseObjectId}`, error.message);
        continue; // Skip this course if fetching students fails
      }

      // Step 5: Iterate over each student in the course
      for (const studentObjectId of studentObjectIds) {
        let attendanceIds = [];
        try {
          // Step 6: Get student attendance records
          const attendanceResponse = await databaseApiClient.get(
            '/api/student/getStudentAttendanceRecords',
            { params: { studentObjectID: studentObjectId } }
          );
          attendanceIds = attendanceResponse.data.attendance || [];
        } catch (error) {
          console.error(`Error at Step 6: Fetching attendance records for StudentObjectID: ${studentObjectId}`, error.message);
          continue; // Skip this student if fetching attendance records fails
        }

        // Step 7: Iterate over attendance records
        for (const attendanceId of attendanceIds) {
          let timestamp = null;
          try {
            // Step 8: Get timestamp for the attendance record
            const timestampResponse = await databaseApiClient.get(
              '/api/attendance/getAttendanceTimestamp',
              { params: { attendanceId, courseCode } }
            );
            timestamp = timestampResponse.data.timestamp;
          } catch (error) {
            console.error(`Error at Step 8: Fetching timestamp for AttendanceID: ${attendanceId}`, error.message);
            continue; // Skip this attendance record if fetching timestamp fails
          }

          if (!timestamp) {
            console.warn(`Warning at Step 8: No timestamp found for AttendanceID: ${attendanceId}`);
            continue;
          }

          let studentInfo = null;
          try {
            // Step 9: Get student information
            const studentInfoResponse = await databaseApiClient.get(
              '/api/student/getStudentInformation',
              { params: { studentObjectID: studentObjectId } }
            );
            studentInfo = studentInfoResponse.data;
          } catch (error) {
            console.error(`Error at Step 9: Fetching student information for StudentObjectID: ${studentObjectId}`, error.message);
            continue; // Skip this student if fetching student information fails
          }

          if (!studentInfo) {
            console.warn(`Warning at Step 9: No student information found for StudentObjectID: ${studentObjectId}`);
            continue;
          }

          // Step 10: Construct the student attendance entry
          const studentAttendanceEntry = {
            firstName: studentInfo.firstName,
            lastName: studentInfo.lastName,
            studentID: studentInfo.studentID,
            courseCode,
            timeStamp: timestamp,
          };

          // Add the entry to the results array
          studentRecordsForCoursesOfThisProf.push(studentAttendanceEntry);
        }
      }
    }

    // Step 11: Return the results
    res.status(200).json(studentRecordsForCoursesOfThisProf);
  } catch (error) {
    console.error('Error at main try-catch: General error in getRecords API', error.message);
    res.status(500).json({
      message: 'Error fetching student records',
      error: error.message,
    });
  }
};

module.exports = { getRecords };
