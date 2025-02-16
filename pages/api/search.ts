import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SerpApi from 'google-search-results-nodejs';
import { SearchResponse } from '../../types';

if (!process.env.GEMINI_API_KEY || !process.env.SERP_API_KEY) {
  throw new Error('Missing required API keys');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const search = new SerpApi.SerpApiSearch(process.env.SERP_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { query, type = 'text' } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // First, analyze if web search is needed
    const searchDecision = await model.generateContent(`
      Analyze if this query needs real-time or factual information from the web.
      Answer with just 'yes' or 'no':
      Query: "${query}"
    `);
    const needsWebSearch = searchDecision.response.text().toLowerCase().includes('yes');

    let webResults = [];
    if (needsWebSearch) {
      // Perform web search
      const searchResults: Promise<any> = new Promise((resolve) => {
        search.json({
          q: query,
          num: 3
        }, (data: any) => {
          resolve(data);
        });
      });

      const data = await searchResults;
      webResults = data.organic_results?.slice(0, 3).map((result: any) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
      })) || [];
    }

    // Generate response based on type and web results
    let response: SearchResponse = {
      type: type,
      webResults: needsWebSearch ? webResults : undefined
    };

    // Generate AI response with context from web results
    const prompt = needsWebSearch 
      ? `Using the following web search results as context:\n${JSON.stringify(webResults)}\n\nRespond to: ${query}`
      : query;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    switch (type) {
      case 'text':
        response.aiResponse = aiResponse;
        break;

      case 'code':
        response.codeSnippet = aiResponse;
        break;

      case 'math':
        const solution = aiResponse;
        response.mathSolution = {
          problem: query,
          solution: solution,
          steps: solution.split('\n').filter((step: string) => step.trim()),
        };
        break;

      default:
        response.aiResponse = aiResponse;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      type: 'text',
      aiResponse: 'An error occurred while processing your request.'
    });
  }
} 