import dotenv from 'dotenv';
import serverless from 'serverless-http';
import app from '../src/app';
import { connectDB } from '../src/utils/db';

dotenv.config();

// Connect to DB once (connection is cached in utils/db)
connectDB().catch((err) => {
  // If DB connection fails, log it — Vercel will record the function error
  console.error('MongoDB connection error:', err);
});

export default serverless(app as any);
