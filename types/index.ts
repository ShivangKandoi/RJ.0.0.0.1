export interface Message {
  role: 'user' | 'assistant';
  content: string;
  complete?: boolean;
}

export interface Chat {
  _id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchResponse {
  type: 'text' | 'code' | 'math';
  aiResponse?: string;
  codeSnippet?: string;
  mathSolution?: {
    problem: string;
    solution: string;
    steps: string[];
  };
  webResults?: Array<{
    title: string;
    link: string;
    snippet: string;
  }>;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
} 