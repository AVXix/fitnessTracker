const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const path = require('path');
// serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uri = process.env.ATLAS_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
  app.set('mongoose', mongoose);
})

const exercisesRouter = require('./routes/exercises');
const usersRouter = require('./routes/users');
const workoutRouter = require('./routes/workout');
const goalsRouter = require('./routes/goals');
const caloriesRouter = require('./routes/calories');
const profileRouter = require('./routes/profile');

app.use('/exercises', exercisesRouter);
app.use('/users', usersRouter); // still used for signup/login
app.use('/workout', workoutRouter);
app.use('/goals', goalsRouter);
app.use('/calories', caloriesRouter);
app.use('/profile', profileRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});