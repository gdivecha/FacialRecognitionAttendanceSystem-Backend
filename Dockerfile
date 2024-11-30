# Use the Node.js 18 base image
FROM node:18.20.4

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your server will run on
EXPOSE 5002

# Start the backend server
CMD ["node", "server.js"]