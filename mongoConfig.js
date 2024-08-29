
// dotenv
require('dotenv').config();

const mongoose = require("mongoose");
const MongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/odin-book';

async function connectToMongoDB() {

  try {
    await mongoose.connect(MongoUri)
    console.log(`MongoDB successfully connected to ${MongoUri}`)

  } catch (e) {
    console.error('Error connecting to MongoDB:', e);

  }
}


module.exports = connectToMongoDB;