declare module 'google-search-results-nodejs' {
  export interface SearchResult {
    title: string;
    link: string;
    snippet: string;
  }

  export interface ImageResult {
    original: string;
    title: string;
    link: string;
  }

  export interface SearchResponse {
    organic_results?: SearchResult[];
    images_results?: ImageResult[];
  }

  export class SerpApiSearch {
    constructor(apiKey: string);
    json(
      params: { q: string; tbm?: string; num?: number },
      callback: (data: SearchResponse) => void
    ): void;
  }

  const SerpApi: {
    SerpApiSearch: typeof SerpApiSearch;
  };

  export default SerpApi;
} 