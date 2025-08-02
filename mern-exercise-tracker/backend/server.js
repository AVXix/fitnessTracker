// server.js is the entry point of the backend application.
// It sets up and starts the Express server, connects to the MongoDB database,
// and configures middleware and API routes. This file is needed to initialize
// the backend, handle HTTP requests, and serve as the main controller for the app.

// Import required modules
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Load environment variables from .env file
require('dotenv').config();

const app = express();
// Set the port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// Get MongoDB connection URI from environment variables
const uri = process.env.ATLAS_URI;
// Connect to MongoDB using Mongoose
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Get the default connection
const connection = mongoose.connection;
// Log a message once the connection is open
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});

// Import route handlers
// Exercise routes
const exercisesRouter = require('./routes/exercises');
const usersRouter = require('./routes/users');

// Use the exercises router for requests to /exercises
app.use('/exercises', exercisesRouter);
// Use the users router for requests to /users
app.use('/users', usersRouter); 

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
