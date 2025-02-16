<div align="center">
  <h1>🤖 RaaVaan Junior (RJ)</h1>
  <p>An AI-powered search assistant built with Next.js and Gemini</p>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#environment-variables">Environment Setup</a> •
    <a href="#usage">Usage</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>

## ✨ Features

- 🧠 Powered by Google's Gemini AI for intelligent responses
- 🔍 Real-time web search integration via SerpAPI
- 💻 Code syntax highlighting and explanation
- 🔢 Mathematical problem-solving with LaTeX support
- 👤 User authentication and session management
- 💬 Chat history with MongoDB persistence
- 🌙 Dark mode interface
- ⚡ Real-time streaming responses
- 📱 Responsive design

## 🛠️ Tech Stack

- **Framework:** Next.js 14
- **UI Library:** Chakra UI
- **Styling:** CSS Modules
- **Authentication:** NextAuth.js
- **Database:** MongoDB
- **AI/ML:** 
  - Google Gemini AI
  - SerpAPI for web search
- **Language:** TypeScript
- **Deployment:** Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 16.x or later
- MongoDB database
- Google Gemini API key
- SerpAPI key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-search-assistant.git
   cd ai-search-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # API Keys
   GEMINI_API_KEY=your_gemini_api_key
   SERP_API_KEY=your_serp_api_key

   # MongoDB
   MONGODB_URI=your_mongodb_connection_string

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

## 💡 Usage

### Authentication
- Sign up with email and password
- Secure login system
- Protected routes and API endpoints

### Chat Interface
- Start new conversations
- View chat history
- Real-time streaming responses
- Code highlighting
- Mathematical notation support
- Web search integration

### Features in Detail
1. **AI Responses**
   - Context-aware responses
   - Code examples with syntax highlighting
   - Step-by-step mathematical solutions

2. **Search Integration**
   - Real-time web search results
   - Relevant snippets and links
   - Integrated context for AI responses

3. **User Experience**
   - Responsive design
   - Dark mode interface
   - Sidebar navigation
   - Chat organization by date

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful language processing
- SerpAPI for web search capabilities
- Next.js team for the amazing framework
- Chakra UI for beautiful components

---

<div align="center">
  <p>Built with ❤️ by [Your Name/Team]</p>
  <p>Star ⭐ this repository if you find it helpful!</p>
</div>