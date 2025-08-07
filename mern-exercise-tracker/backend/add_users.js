const mongoose = require('mongoose');
const User = require('./models/user.model');

require('dotenv').config();

const uri = process.env.ATLAS_URI;
mongoose.connect(uri);

const connection = mongoose.connection;
connection.once('open', async () => {
  console.log("MongoDB database connection established successfully");
  
  // Check if users already exist
  const existingUsers = await User.find();
  console.log("Existing users:", existingUsers.length);
  
  if (existingUsers.length === 0) {
    // Add sample users
    const sampleUsers = [
      { username: 'john_doe', password: 'password123' },
      { username: 'jane_smith', password: 'password123' }, 
      { username: 'mike_wilson', password: 'password123' },
      { username: 'sarah_jones', password: 'password123' }
    ];
    
    try {
      for (const userData of sampleUsers) {
        const newUser = new User(userData);
        await newUser.save();
        console.log(`User ${userData.username} added successfully`);
      }
      console.log("All sample users added!");
    } catch (err) {
      console.error("Error adding users:", err);
    }
  } else {
    console.log("Users already exist in the database");
    existingUsers.forEach(user => {
      console.log("- ", user.username);
    });
  }
  
  mongoose.connection.close();
});

connection.on('error', (err) => {
  console.error("MongoDB connection error:", err);
});
