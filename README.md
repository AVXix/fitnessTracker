# fitnessTracker

MERN Stack Commands Timeline
============================

Commands used in chronological order with explanations:

1. sudo apt install npm
   # Install npm (Node Package Manager) on Ubuntu system

2. npm install mongodb
   # Install MongoDB driver for Node.js (attempted before project setup)

3. node -v
   # Check Node.js version to verify installation

4. npx create-react-app mern-exercise-tracker
   # Create a new React application called "mern-exercise-tracker"

5. cd mern-exercise-tracker/
   # Navigate into the newly created React project directory

6. mkdir backend
   # Create a backend directory for the server-side code

7. cd backend/
   # Navigate into the backend directory

8. npm init -y
   # Initialize a new Node.js project with default settings

9. npm install express cors mongoose dotenv
   # Install essential backend dependencies:
   # - express: Web framework for Node.js
   # - cors: Enable Cross-Origin Resource Sharing
   # - mongoose: MongoDB object modeling library
   # - dotenv: Load environment variables from .env file

10. npm install -g nodemon
    # Attempt to install nodemon globally (failed due to permissions)

11. sudo npm install -g nodemon
    # Install nodemon globally with sudo privileges
    # nodemon automatically restarts the server when files change

12. nodemon server
    # Start the server using nodemon (ran multiple times during development)

Summary:
--------
This timeline shows the setup of a MERN (MongoDB, Express, React, Node.js) stack project:
- Started with system setup (npm installation)
- Created React frontend
- Set up backend directory structure
- Installed necessary backend packages
- Configured development tools (nodemon)
- Started running the development server