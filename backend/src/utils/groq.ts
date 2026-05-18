import 'dotenv/config';
import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy_key',
});

/**
 * Helper function to query the Groq API using Llama 3.3 70B
 * @param prompt The main user question or prompt
 * @param systemInstruction Optional system behavior instructions
 * @returns The generated text response
 */
export const askGroq = async (prompt: string, systemInstruction?: string): Promise<string> => {
  const messages: any[] = [];

  if (systemInstruction) {
    messages.push({
      role: 'system',
      content: systemInstruction,
    });
  }

  messages.push({
    role: 'user',
    content: prompt,
  });

  const completion = await groq.chat.completions.create({
    messages,
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
  });

  return completion.choices[0]?.message?.content || '';
};

/**
 * Helper to safely extract JSON arrays or objects from an LLM response text
 * that may contain conversational text, markdown backticks, etc.
 */
export const extractJson = (text: string): string => {
  let clean = text.trim();

  // Try to find a JSON array first: [ ... ]
  const arrayMatch = clean.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (arrayMatch) {
    return arrayMatch[0];
  }

  // Try to find a JSON object next: { ... }
  const objectMatch = clean.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return objectMatch[0];
  }

  // Fallback to basic cleaning of markdown codeblocks
  if (clean.startsWith('```json')) {
    clean = clean.substring(7);
  } else if (clean.startsWith('```')) {
    clean = clean.substring(3);
  }
  if (clean.endsWith('```')) {
    clean = clean.substring(0, clean.length - 3);
  }

  return clean.trim();
};
