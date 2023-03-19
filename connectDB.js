const mongoose = require('mongoose');
const Issue = require('./models/Issue');

async function connectDB(uri) {
  mongoose.set('strictQuery', false);
  mongoose.connect(uri);
  await Issue.deleteMany({});
  console.log('Connected to database!');
}

module.exports = connectDB;
