import mongoose from 'mongoose';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const cached: MongooseCache = (global as any).__mongoose || { conn: null, promise: null };

export const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hackthon';
    const opts = { bufferCommands: false, connectTimeoutMS: 10000 };
    cached.promise = mongoose.connect(uri, opts as any).then((mongooseInstance) => {
      cached.conn = mongooseInstance;
      return mongooseInstance;
    });
    (global as any).__mongoose = cached;
  }

  return cached.promise;
};
