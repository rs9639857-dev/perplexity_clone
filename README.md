# 🔎 Perplexity AI Clone

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-%5E18.3.1-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-%5E5.5.3-blue.svg)
![Tailwind](https://img.shields.io/badge/tailwindcss-%5E3.4.1-38B2AC.svg)

A clean, minimalist, and highly functional clone of the Perplexity AI search interface. This application leverages powerful LLMs to synthesize answers directly from search results, complete with source citations, streaming text generation, and multiple search focus modes.

Built with **React**, **Vite**, **Tailwind CSS**, and **Express**. It seamlessly routes requests between the **Groq API** (for ultra-fast LLaMA 3 inference) and falls back to the **Gemini API** (with Google Search Grounding for highly factual real-time queries).

## ✨ Features

- **Real-time AI Search**: Type a query and get synthesized answers instantly.
- **Search Focus Modes**: Narrow down your research by focusing on:
  - 🌐 **Web**: General internet search
  - 🎓 **Academic**: Scholarly articles and research papers
  - 💬 **Reddit**: Community discussions and opinions
  - ▶️ **YouTube / Video**: Video content discovery
  - ✍️ **Writing**: Creative writing without external search
  - 🎨 **Image**: AI image generation prompts
  - 💡 **Suggestion**: Ideation and brainstorming
- **Multi-Model Fallback**: Attempts to fetch answers via Groq's `llama-3.3-70b-versatile` for blazing speed, and automatically falls back to `gemini-2.0-flash` if Groq fails or is unavailable.
- **Source Citations**: Extracted web sources are beautifully displayed above the generated answer.
- **Continuous Threads**: Ask follow-up questions within the same thread.
- **Recent Chats**: Sidebar history of your recent searches, easily switch between them, and delete old threads.
- **Streaming Responses**: Token-by-token streaming for a snappy, interactive UX.
- **Responsive UI**: Carefully crafted with Tailwind CSS to look great on desktop and mobile.

## 🚀 Tech Stack

### Frontend
- **React** (v18)
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)
- **React Markdown** (Markdown rendering)

### Backend
- **Node.js** & **Express**
- **Groq SDK** (`groq-sdk`)
- **Google Gen AI SDK** (`@google/genai`)

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/perplexity-clone.git
   cd perplexity-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add your API keys:
   ```env
   # Required for LLaMA 3 support (primary)
   GROQ_API_KEY="your_groq_api_key_here"

   # Required for Gemini fallback & Search Grounding
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```
   *Note: The application is designed to work even if you only provide one of the two API keys.*

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   This will start both the Express backend and the Vite development server concurrently at `http://localhost:3000`.

## 📦 Building for Production

To build the application for production deployment:

```bash
npm run build
```
This command compiles the React frontend into static assets and bundles the Express server using `esbuild` into a single executable `dist/server.cjs` file.

To run the production build locally:
```bash
npm run start
```

## 🤝 Contributing

Contributions are always welcome! 

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
