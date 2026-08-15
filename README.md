# 🔎 Perplexity AI Clone

A modern **Perplexity AI-inspired search and conversational AI application** built with React, Vite, Tailwind CSS, and Node.js. The application combines AI models with web search to generate fast, context-aware answers in a clean and intuitive interface.

The project supports **Groq and Google Gemini** as AI providers, with a backend designed to process user queries and return AI-generated responses.

## ✨ Features

* 🔍 **AI-Powered Search** — Ask questions and receive AI-generated answers.
* 🤖 **Multiple AI Models** — Supports Groq and Google Gemini.
* ⚡ **Fast AI Responses** — Uses Groq's LLaMA models for fast inference.
* 🔄 **Model Fallback** — Gemini can be used as a fallback when Groq is unavailable.
* 🌐 **Web Search** — Retrieve relevant information from the web to improve answers.
* 📚 **Source-Aware Answers** — Display relevant sources alongside search responses.
* 💬 **Conversational Chat** — Continue asking follow-up questions within the same conversation.
* 📋 **Copy Responses** — Easily copy generated answers.
* 👍 **Like / 👎 Dislike** — Provide feedback on AI responses.
* 🔁 **Retry Responses** — Regenerate an answer when needed.
* 🧠 **Context-Aware Conversations** — Maintain context across follow-up questions.
* 📱 **Responsive Design** — Works across desktop and mobile screen sizes.
* 🎨 **Clean UI** — Minimal and modern interface inspired by AI search platforms.

## 🛠️ Tech Stack

### Frontend

* **React** — UI development
* **Vite** — Fast development and build tool
* **Tailwind CSS** — Styling and responsive design
* **JavaScript** — Application logic
* **Lucide React** — UI icons
* **React Markdown** — Rendering AI-generated Markdown responses

### Backend

* **Node.js**
* **Express.js**
* **Groq SDK**
* **Google Gemini API**

### Development Tools

* **Git**
* **GitHub**
* **VS Code**
* **Postman**

## 🏗️ Application Architecture

```text
                         User
                          │
                          ▼
                 ┌─────────────────┐
                 │  React Frontend │
                 │  + Vite         │
                 │  + Tailwind CSS │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Node.js Backend │
                 │   + Express     │
                 └────────┬────────┘
                          │
                 ┌────────┴────────┐
                 ▼                 ▼
          ┌─────────────┐   ┌─────────────┐
          │    Groq     │   │   Gemini    │
          │   LLaMA     │   │     AI      │
          └──────┬──────┘   └──────┬──────┘
                 │                 │
                 └────────┬────────┘
                          ▼
                   AI Generated Answer
                          │
                          ▼
                 ┌─────────────────┐
                 │  Chat Interface │
                 │ + Sources       │
                 │ + Actions       │
                 └─────────────────┘
```

## 📂 Project Structure

```text
Perplexity_AI/
│
├── src/
│   ├── components/
│   ├── hooks/
│   ├── App.jsx
│   └── ...
│
├── public/
│
├── server/
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── ...
```

> The exact structure may vary depending on the current implementation.

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/rs9639857-dev/perplexity_clone.git
```

### 2. Navigate to the Project

```bash
cd perplexity_clone
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

> API keys are required for the corresponding AI providers.

### 5. Start the Development Server

```bash
npm run dev
```

The application will start locally. Depending on your Vite configuration, the frontend is typically available at:

```text
http://localhost:5173
```

## 🔐 Environment & Security

Never expose API keys in your source code or upload them to GitHub.

Make sure your `.gitignore` contains:

```text
.env
.env.local
node_modules/
dist/
```

If an API key is accidentally pushed to GitHub, revoke it immediately and generate a new one.

## 🔄 How the Application Works

1. The user enters a question in the search interface.
2. The React frontend sends the query to the Express backend.
3. The backend processes the request.
4. The application retrieves relevant search information when required.
5. The query is sent to the configured AI provider.
6. Groq is used for fast LLaMA-based inference when available.
7. Gemini can be used as an alternative/fallback provider.
8. The generated response is returned to the frontend.
9. The frontend renders the response using Markdown.
10. Users can continue the conversation, copy the answer, retry it, or provide feedback.

## 🎯 Project Goals

This project was developed to gain practical experience with:

* Full-stack web development
* React application development
* REST API integration
* Large Language Model integration
* AI-powered search applications
* Prompt engineering
* Conversational AI
* Streaming AI responses
* Web search integration
* Backend development with Node.js and Express
* API key and environment-variable management
* Git and GitHub workflow

## 🔮 Future Improvements

* [ ] User authentication
* [ ] Persistent chat history
* [ ] Advanced source citations
* [ ] Search history synchronization
* [ ] Voice search
* [ ] File and PDF upload
* [ ] Image search
* [ ] Better mobile experience
* [ ] Additional AI model providers
* [ ] Improved search ranking
* [ ] Production deployment
* [ ] User profiles and personalization

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository.
2. Create a new feature branch:

```bash
git checkout -b feature/AmazingFeature
```

3. Commit your changes:

```bash
git commit -m "Add AmazingFeature"
```

4. Push the branch:

```bash
git push origin feature/AmazingFeature
```

5. Open a Pull Request.

## 👨‍💻 Author

**Rahul Kumar Singh**

Computer Science & Engineering Student

GitHub: [rs9639857-dev](https://github.com/rs9639857-dev)

## ⭐ Acknowledgement

This project is inspired by modern AI-powered search and conversational AI platforms and was developed as a learning and portfolio project.

## 📄 License

This project is intended for educational and personal development purposes.


