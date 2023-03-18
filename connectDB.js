const mongoose = require('mongoose');
const Project = require('./models/Project');

async function connectDB(uri) {
  mongoose.set('strictQuery', false);
  mongoose.connect(uri);
  // await Project.deleteMany({});
  console.log('Connected to database!');
}

module.exports = connectDB;
