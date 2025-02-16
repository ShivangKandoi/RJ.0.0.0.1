export interface SearchResponse {
  aiResponse?: string;
  webResults?: WebResult[];
  codeSnippet?: string;
  mathSolution?: MathSolution;
  images?: string[];
  type: 'text' | 'code' | 'math' | 'image';
}

export interface WebResult {
  title: string;
  link: string;
  snippet: string;
}

export interface MathSolution {
  problem: string;
  solution: string;
  steps: string[];
}

export interface Chat {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  complete?: boolean;
} 