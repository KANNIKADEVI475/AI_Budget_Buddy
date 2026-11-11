import mongoose from 'mongoose';

let memoryServerInstance = null;

/**
 * Connects to MongoDB Atlas or local MongoDB using Mongoose.
 * Falls back to in-memory MongoDB in development if MONGODB_URI is absent or unreachable.
 */
export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    try {
      console.log('[Database] Connecting to configured MongoDB instance...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('[Database] Connected to MongoDB successfully.');
      return mongoose.connection;
    } catch (err) {
      console.warn(`[Database] Warning: Could not connect to configured MONGODB_URI (${err.message}).`);
      if (process.env.NODE_ENV === 'production') {
        throw err;
      }
      console.log('[Database] Development environment: Falling back to in-memory MongoDB...');
    }
  } else {
    console.log('[Database] No MONGODB_URI provided in environment.');
  }

  // Fallback to in-memory MongoDB for seamless development & automated testing
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create();
    const uri = memoryServerInstance.getUri();
    await mongoose.connect(uri);
    console.log('[Database] Connected to In-Memory MongoDB for local development/testing.');
    return mongoose.connection;
  } catch (err) {
    console.error('[Database] Failed to initialize fallback in-memory MongoDB:', err.message);
    throw err;
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
}

export default {
  connectDatabase,
  disconnectDatabase,
};
