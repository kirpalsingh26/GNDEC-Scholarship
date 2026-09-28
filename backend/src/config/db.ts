import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scholarsphere';
  try {
    // Attempt connecting to configured MongoDB (e.g. local or Atlas)
    console.log(`Connecting to MongoDB at: ${uri}...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (err: any) {
    console.warn(`⚠️ Could not connect to local MongoDB (${err.message}). Initializing embedded In-Memory MongoDB for seamless demo/development...`);
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
