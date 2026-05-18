import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './utils/db';
import authRoutes from './routes/authRoutes';
import materialRoutes from './routes/materialRoutes';
import chatRoutes from './routes/chatRoutes';
import quizRoutes from './routes/quizRoutes';
import plannerRoutes from './routes/plannerRoutes';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/ai/chat', chatRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/planner', plannerRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
