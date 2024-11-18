const axios = require('axios');

const databaseApiClient = axios.create({
  baseURL: process.env.DB_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.DB_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

module.exports = databaseApiClient;
