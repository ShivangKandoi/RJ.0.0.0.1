import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing required API key');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

// Helper function to perform web search using the search API
async function performWebSearch(query: string): Promise<string> {
  try {
    const response = await fetch('http://localhost:3000/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, type: 'text' })
    });

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json();
    
    if (!data.webResults || data.webResults.length === 0) {
      return '';
    }

    // Format the results in the same style we were using before
    let formattedResults = '🔍 Research Summary:\n';
    
    // Add bullet points from search results
    data.webResults.forEach((result: any) => {
      if (result.snippet) {
        formattedResults += `- ${result.snippet.trim()}\n`;
      }
    });

    // Add sources section
    formattedResults += '\nSources:\n';
    data.webResults.forEach((result: any, index: number) => {
      formattedResults += `[${index + 1}] ${result.title}\nLink: ${result.link}\n`;
    });

    return formattedResults;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, systemPrompt } = req.body;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });

    let needsWebSearch = false;
    try {
      const searchAnalysis = await model.generateContent(`
        Analyze if this query needs current or factual information from the web.
        Reply with only "yes" or "no": "${message}"
      `);
      
      needsWebSearch = searchAnalysis.response.text().toLowerCase().includes('yes');
    } catch (error) {
      console.error('Search analysis error:', error);
      needsWebSearch = false;
    }

    let webResults = '';

    if (needsWebSearch) {
      try {
        res.write("🔍 Searching for up-to-date information...\n\n");
        webResults = await performWebSearch(message);
      } catch (searchError) {
        console.error('Search error:', searchError);
        webResults = "Note: Web search was attempted but failed. Providing best available response.\n\n";
        needsWebSearch = false;
      }
    }

    const prompt = `${systemPrompt}\n\n${
      needsWebSearch ? 
      `Here are the latest search results:\n${webResults}\n\nBased on these search results, please provide a comprehensive summary. Format your response as:\n\n🤖 Based on my research: [your detailed summary]` 
      : ''
    }User: ${message}\n\nAssistant:`;

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }

    res.end();
  } catch (error: any) {
    console.error('Chat error:', error);
    const errorMessage = error.message.includes('429') 
      ? "I apologize, but I'm experiencing high traffic. Please try again in a moment."
      : "An error occurred while processing your request.";
    
    res.status(error.message.includes('429') ? 429 : 500)
      .json({ error: errorMessage });
  }
} 