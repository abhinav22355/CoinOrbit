const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error('MONGO_URI is not defined');
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(
      `[Database] MongoDB Connected: ${conn.connection.host}`
    );

    return conn;
  } catch (error) {
    console.error(
      `[Database] MongoDB connection failed: ${error.message}`
    );

    throw error;
  }
};

module.exports = connectDB;