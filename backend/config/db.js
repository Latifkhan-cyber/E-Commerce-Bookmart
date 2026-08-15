const mongoose = require('mongoose');

const connectDB = async () => {
  const targetUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookmart';
  try {
    const conn = await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 3000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`Local MongoDB Connection Warning (${error.message}). Attempting In-Memory Fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB Instance Active at: ${mongoUri}`);
      return conn;
    } catch (memError) {
      console.error(`MongoDB Connection Failed: ${error.message}`);
      console.error(`To fix: Please ensure MongoDB is running locally on 27017 OR set MONGO_URI in backend/.env to your MongoDB Atlas connection string.`);
    }
  }
};

module.exports = connectDB;
