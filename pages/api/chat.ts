import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SerpApi from 'google-search-results-nodejs';

if (!process.env.GEMINI_API_KEY || !process.env.SERP_API_KEY) {
  throw new Error('Missing required API keys');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const search = new SerpApi.SerpApiSearch(process.env.SERP_API_KEY);

// System prompt to define the AI's behavior and capabilities
const SYSTEM_PROMPT = `You are RaaVaan Junior (RJ), a highly capable AI assistant with expertise in programming, mathematics, and scientific concepts. Your responses should be:

1. Clear and well-structured
2. Technically accurate
3. Include code examples when relevant
4. Use mathematical notation (LaTeX) for equations
5. Provide step-by-step explanations for complex concepts
6. Be helpful and professional in tone

When explaining mathematical or scientific concepts:
- Use LaTeX notation for equations (e.g., $E = mc^2$ for inline, $$\frac{d}{dx}e^x = e^x$$ for block equations)
- Break down complex problems into steps
- Provide practical examples

For programming questions:
- Include well-commented code examples
- Explain the logic behind the solution
- Follow best practices and conventions
- Consider performance and edge cases

Remember to:
- Be concise but thorough
- Acknowledge limitations or uncertainties
- Provide references when appropriate
- Use markdown formatting for better readability`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    let webResults = '';
    const needsWebSearch = message.length > 100 || message.includes('?');

    // Initialize model with system prompt
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });

    // Combine system prompt with user message
    const prompt = `${SYSTEM_PROMPT}\n\nUser: ${message}\n\nAssistant:`;

    // Generate AI response with context from web results if available
    const finalPrompt = needsWebSearch 
      ? `${prompt}\n\nContext from web search:\n${webResults}\n\nResponse:`
      : prompt;

    const result = await model.generateContentStream(finalPrompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }

    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
} 