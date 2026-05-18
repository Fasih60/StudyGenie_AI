import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { StudyMaterial } from '../models/StudyMaterial';
import { Chat } from '../models/Chat';
import { askGroq } from '../utils/groq';

// GET /api/ai/chat/:materialId — load saved chat history for a material
export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { materialId } = req.params;

    const material = await StudyMaterial.findOne({ _id: materialId, userId: req.user._id });
    if (!material) {
      res.status(404).json({ message: 'Study material not found' });
      return;
    }

    const chat = await Chat.findOne({ userId: req.user._id, materialId });
    res.json({ messages: chat?.messages || [] });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error fetching chat history' });
  }
};

// POST /api/ai/chat — send a message and persist both user message and AI reply
export const chatWithNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { materialId, question } = req.body;

    if (!materialId || !question) {
      res.status(400).json({ message: 'Material ID and question are required' });
      return;
    }

    const material = await StudyMaterial.findOne({ _id: materialId, userId: req.user._id });
    if (!material) {
      res.status(404).json({ message: 'Study material not found' });
      return;
    }

    const systemInstruction = `You are a study assistant. Answer ONLY using the provided notes below. If the answer cannot be found in the notes, say exactly: "This topic was not found in your uploaded notes." Do not use outside knowledge. \n\nNOTES:\n${material.extractedText}`;

    const answer = await askGroq(question, systemInstruction);

    // Persist both user question and AI answer into MongoDB
    await Chat.findOneAndUpdate(
      { userId: req.user._id, materialId },
      {
        $push: {
          messages: {
            $each: [
              { role: 'user', content: question },
              { role: 'assistant', content: answer },
            ],
          },
        },
      },
      { upsert: true, new: true }
    );

    res.json({ answer });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Server Error during AI chat' });
  }
};

// DELETE /api/ai/chat/:materialId — clear chat history for a material
export const clearChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { materialId } = req.params;

    await Chat.findOneAndUpdate(
      { userId: req.user._id, materialId },
      { $set: { messages: [] } }
    );

    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Clear chat error:', error);
    res.status(500).json({ message: 'Server error clearing chat history' });
  }
};

// GET /api/ai/chat/active — get list of material IDs that have active chats
export const getActiveChats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chats = await Chat.find({
      userId: req.user._id,
      'messages.0': { $exists: true }
    }).select('materialId');

    const activeMaterialIds = chats.map(c => c.materialId.toString());
    res.json(activeMaterialIds);
  } catch (error) {
    console.error('Get active chats error:', error);
    res.status(500).json({ message: 'Server error fetching active chats' });
  }
};

