const databaseApiClient = require('../config/dbApiClient');

const createProfAccount = async (req, res) => {
  try {
    // Extract professor data from the request body
    const { firstName, lastName, email } = req.body;

    // Validate input
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'firstName, lastName, and email are required' });
    }

    // Make a request to the database API to create a professor
    const response = await databaseApiClient.post('/api/professor/createProfessor', {
      firstName,
      lastName,
      email,
    });

    // Respond with the result from the database API
    return res.status(201).json({
      message: 'Professor account created successfully',
      professorId: response.data.professorId, // Assuming the database API returns `professorId`
    });
  } catch (error) {
    // Handle errors (e.g., database API failure)
    if (error.response) {
      // Error from database API
      return res.status(error.response.status).json(error.response.data);
    }

    // General server error
    return res.status(500).json({ message: 'Error creating professor account', error: error.message });
  }
};

module.exports = {
  createProfAccount,
};