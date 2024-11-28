const axios = require('axios');

const compVisionApiClient = axios.create({
  baseURL: process.env.COMPUTER_VISION_API_BASE_URL, // Ensure this environment variable is set
  headers: {
    Authorization: `Bearer ${process.env.VISION_API_KEY}`, // Ensure this API key is set
    'Content-Type': 'application/json', // Assuming the CV API accepts JSON payloads
  },
});

module.exports = compVisionApiClient;
