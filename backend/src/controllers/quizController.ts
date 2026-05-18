import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { StudyMaterial } from '../models/StudyMaterial';
import { Quiz } from '../models/Quiz';
import { QuizQuestion } from '../models/QuizQuestion';
import { askGroq, extractJson } from '../utils/groq';

export const generateQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { materialId, difficulty } = req.body;

    if (!materialId || !difficulty) {
      res.status(400).json({ message: 'Material ID and difficulty are required' });
      return;
    }

    const material = await StudyMaterial.findOne({ _id: materialId, userId: req.user._id });

    if (!material) {
      res.status(404).json({ message: 'Study material not found' });
      return;
    }

    const limit = parseInt(req.body.limit || '10');

    const prompt = `Generate a ${difficulty} difficulty multiple choice quiz from the following notes.
Return ONLY a strictly valid JSON array of objects, with NO markdown formatting, NO backticks, NO code blocks.
Each object must have the following keys exactly:
- "question": string
- "options": array of 4 string options
- "correctAnswer": string (must match one of the options)
- "explanation": string (brief explanation of the correct answer)

Generate exactly ${limit} questions.
NOTES:
${material.extractedText}`;

    const aiResponse = await askGroq(prompt);
    const cleanResponse = extractJson(aiResponse);
    const questions = JSON.parse(cleanResponse);

    // Save quiz to DB
    const quiz = await Quiz.create({
      userId: req.user._id,
      materialId,
      difficulty,
    });

    // Save questions to DB
    const savedQuestions = await Promise.all(
      questions.map(async (q: any) => {
        return await QuizQuestion.create({
          quizId: quiz._id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        });
      })
    );

    res.status(201).json({ quiz, questions: savedQuestions });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ message: 'Server Error generating quiz' });
  }
};

export const submitQuizScore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId, score } = req.body;
    const quiz = await Quiz.findOneAndUpdate(
      { _id: quizId, userId: req.user._id },
      { score },
      { new: true }
    );
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server Error submitting score' });
  }
};

export const getQuizzes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const quizzes = await Quiz.find({ userId: req.user._id })
            .populate('materialId', 'title')
            .sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching quizzes' });
    }
}
