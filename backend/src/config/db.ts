import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  const isProduction = process.env.NODE_ENV === 'production';
  const uri = process.env.MONGODB_URI || (isProduction ? '' : 'mongodb://127.0.0.1:27017/scholarsphere');

  if (isProduction && !process.env.MONGODB_URI) {
    throw new Error('❌ MONGODB_URI environment variable is required in production mode.');
  }

  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (err: any) {
    if (isProduction) {
      console.error('❌ Failed to connect to production MongoDB:', err.message);
      throw err;
    }

    console.warn(`⚠️ Could not connect to local MongoDB (${err.message}). Initializing embedded In-Memory MongoDB for development...`);
    try {
      mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log(`✅ Connected to In-Memory MongoDB successfully (${memoryUri}).`);
    } catch (memErr: any) {
      console.error('❌ Failed to start In-Memory MongoDB:', memErr);
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};
