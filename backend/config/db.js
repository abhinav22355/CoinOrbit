const mongoose = require('mongoose');

let memoryServer = null;

const startMemoryServer = async () => {
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`[Database] In-Memory MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`[Database] In-memory database startup failed: ${err.message}`);
    throw err;
  }
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  // Case 1: Explicit in-memory database or URI not configured
  if (!uri || uri === 'memory' || uri === 'undefined') {
    console.log('[Database] MONGO_URI not set or set to memory. Starting embedded MongoDB...');
    return await startMemoryServer();
  }

  // Case 2: Connect using provided URI (Atlas or local)
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Connection to "${uri}" failed: ${error.message}`);
    console.log('[Database] Starting fallback in-memory MongoDB so the application works seamlessly...');
    try {
      return await startMemoryServer();
    } catch (fallbackErr) {
      console.error(`[Database] Fatal: Unable to connect to MongoDB or fallback: ${fallbackErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
