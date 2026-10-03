import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const isCustomUri = Boolean(process.env.MONGO_URI);
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blogspace';
  
  try {
    // Set 10s timeout for Atlas/Custom URI, 2.5s for local default uri to quickly trigger in-memory fallback
    await mongoose.connect(uri, { serverSelectionTimeoutMS: isCustomUri ? 10000 : 2500 });
    console.log(`[MongoDB] Connected successfully to target database: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to primary MongoDB at ${uri}: ${err.message}`);
    console.log('[MongoDB] Starting MongoMemoryServer for fallback in-memory MongoDB database...');
    
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[MongoDB] Connected to MongoMemoryServer at ${memUri}`);
    } catch (memErr) {
      console.error('[MongoDB] In-memory MongoDB startup failed:', memErr.message);
      process.exit(1);
    }
  }
};
