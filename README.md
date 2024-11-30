# FacialRecognitionAttendanceSystem - Backend

This is the **backend service** for the Facial Recognition Attendance System. It handles API requests, communicates with the database and computer vision services, and provides data to the frontend.

## Prerequisites

- Node.js (version 18 or higher)
- Docker and Docker Compose

## Environment Variables

Create a `.env` file with the following variables:

PORT=5002
BACKEND_API_KEY=<your-backend-api-key>
DB_BASE_URL=http://database:5001
DB_API_KEY=<your-database-api-key>
COMPUTER_VISION_API_BASE_URL=http://compvision:5003
VISION_API_KEY=<your-computer-vision-api-key>

Replace `<your-backend-api-key>`, `<your-database-api-key>`, and `<your-computer-vision-api-key>` with the respective keys.

## Run Locally

1. Install dependencies:
   npm install

2. Start the backend server:
   npm start

3. The backend will run at http://localhost:5002.

## Docker Instructions

### Build and Run with Docker

1. Build the Docker image:
   docker build -t backend .

2. Run the container:
   docker run -p 5002:5002 --env-file .env backend

### Using Docker Compose

Ensure the following `docker-compose.yml` file exists in the root directory:

version: '3.9'

services:
  backend:
    build:
      context: ./FacialRecognitionAttendanceSystem-Backend
    container_name: backend
    ports:
      - "5002:5002"
    depends_on:
      - database
      - compvision
    environment:
      - PORT=5002
      - BACKEND_API_KEY=<your-backend-api-key>
      - DB_BASE_URL=http://database:5001
      - DB_API_KEY=<your-database-api-key>
      - COMPUTER_VISION_API_BASE_URL=http://compvision:5003
      - VISION_API_KEY=<your-computer-vision-api-key>
    restart: always

Run the following command:

docker-compose up --build