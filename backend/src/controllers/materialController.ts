import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { StudyMaterial } from '../models/StudyMaterial';
import { Quiz } from '../models/Quiz';
import { QuizQuestion } from '../models/QuizQuestion';
import fs from 'fs';
import pdfParse from 'pdf-parse';

export const uploadMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(fileBuffer);
      extractedText = data.text;
    } else if (req.file.mimetype === 'text/plain') {
      extractedText = fileBuffer.toString('utf-8');
    } else {
      res.status(400).json({ message: 'Unsupported file type. Please upload PDF or TXT.' });
      fs.unlinkSync(req.file.path);
      return;
    }

    const material = await StudyMaterial.create({
      userId: req.user._id,
      title: req.body.title || req.file.originalname,
      fileName: req.file.originalname,
      extractedText,
    });

    fs.unlinkSync(req.file.path);
    res.status(201).json(material);
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Server Error during upload' });
  }
};

export const getMaterials = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const materials = await StudyMaterial.find({ userId: req.user._id }).select('-extractedText');
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching materials' });
  }
};

export const deleteMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Delete the study material
    const material = await StudyMaterial.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!material) {
      res.status(404).json({ message: 'Study material not found or unauthorized' });
      return;
    }

    // Cascade delete associated quizzes
    // Since Quiz has a ref to StudyMaterial, we find quizzes associated with it
    const quizzes = await Quiz.find({ materialId: id });
    const quizIds = quizzes.map((q: any) => q._id);

    if (quizIds.length > 0) {
      await QuizQuestion.deleteMany({ quizId: { $in: quizIds } });
      await Quiz.deleteMany({ _id: { $in: quizIds } });
    }

    res.json({ message: 'Study material and associated quizzes deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Server Error during notes deletion' });
  }
};