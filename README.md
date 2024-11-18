# FacialRecognitionAttendanceSystem-Backend

## Backend Setup
This backend serves as a bridge between the frontend, the database APIs, and the computer vision layer. It handles API requests, processes logic, and communicates with external services.

## Prerequisites
Before setting up the backend, ensure you have the following installed:
- Node.js (v14 or above)
- npm (Node Package Manager, comes with Node.js)
- MongoDB (if testing locally and need a mock database)
- API keys for:
    - Database layer (DB_API_KEY)
    - Computer vision service (VISION_API_KEY)

## Setup Instructions
1. Clone the Repository
```
git clone <repository-url>
cd <repository-folder>
```
2. Install Dependencies
Run the following command to install all required dependencies:
`npm install`
This will install:
- express - Web framework for Node.js
- cors - For handling CORS
- morgan - Logging middleware
- dotenv - For environment variable management
- axios - For making HTTP requests to external APIs (database and computer vision APIs)
3. Configure Environment Variables
Create a .env file in the root of the project and add the following:
```
PORT=5002
DB_BASE_URL=http://localhost:5001 # Replace with actual database API base URL
VISION_BASE_URL=http://localhost:5003 # Replace with actual vision API base URL
DB_API_KEY=your_database_api_key
VISION_API_KEY=your_vision_api_key
```
Replace the placeholder values (your_database_api_key and your_vision_api_key) with actual API keys.
4. Run the Server
Start the server in development mode using nodemon:
`npm start`
If you don’t have nodemon installed globally, run:
`npx nodemon server.js`
The server will be running at http://localhost:5002 (or the port specified in .env).

### Folder Structure:
```
project-root/
├── controllers/
│   ├── professorController.js
│   ├── studentController.js
├── middleware/
│   ├── dbAuthenticate.js
│   ├── visionAuthenticate.js
│   ├── dbClient.js
│   ├── visionClient.js
├── routes/
│   ├── professorRoutes.js
│   ├── studentRoutes.js
├── .env
├── .gitignore
├── README.md
├── package.json
├── server.js
```

- controllers/: Contains logic for handling route requests.
- middleware/: Contains custom middleware for authentication and HTTP clients (axios) for the database and vision APIs.
- routes/: Defines the endpoints and connects them to controllers.
- server.js: The entry point for the application.
- .env: Contains environment variables (ignored by Git).
- .gitignore: Specifies files and directories to be excluded from version control.
