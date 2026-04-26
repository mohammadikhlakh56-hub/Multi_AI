<div align="center">


### Hybrid AI Agent Architecture

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LangChain](https://img.shields.io/badge/LangChain-0.3%2B-1C3C3C?style=for-the-badge&logo=chainlink&logoColor=white)](https://langchain.com)
[![AutoGen](https://img.shields.io/badge/AutoGen-ag2-0078D4?style=for-the-badge&logo=microsoft&logoColor=white)](https://github.com/ag2ai/ag2)
[![React](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Groq](https://img.shields.io/badge/Groq-Llama--3-FF6B35?style=for-the-badge&logo=meta&logoColor=white)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**A production-grade, autonomous data science engine** that fuses LangChain's rapid intelligence with Microsoft AutoGen's self-correcting subprocess execution — all served through a blazing-fast FastAPI backend and a premium React dashboard.

[Features](#-core-architecture) · [Stack](#-tech-stack) · [Quick Start](#-quick-start) · [API Reference](#-api-overview) · [Contributing](#-contributing)

</div>

---

## 🧠 Core Architecture

Antigravity OS implements a **3-Layer Hybrid Pipeline** that automates the entire data science workflow — from natural language task intake to polished artifact delivery.

```
┌────────────────────────────────────────────────────────────┐
│                     USER / REACT FRONTEND                  │
│           (Next.js Dashboard · File Upload · Chat UI)      │
└─────────────────────────┬──────────────────────────────────┘
                          │  HTTP / REST
┌─────────────────────────▼──────────────────────────────────┐
│                    FASTAPI GATEWAY                         │
│           (CORS · Session Management · Routing)            │
└──────┬───────────────────────────────────────┬─────────────┘
       │                                       │
┌──────▼────────────┐               ┌──────────▼─────────────┐
│  LAYER 1          │               │  LAYER 3               │
│  LangChain Drafter│               │  Artifact Parser       │
│  ─────────────── │               │  ──────────────────    │
│  • Groq/Llama-3  │               │  • Chart Detection     │
│  • Prompt Chains │               │  • File Extraction     │
│  • Code Drafting │               │  • Response Assembly   │
└──────┬────────────┘               └──────────▲─────────────┘
       │                                       │
┌──────▼────────────────────────────────────────┐
│  LAYER 2 — AutoGen Execution Sandbox          │
│  ──────────────────────────────────────────  │
│  AssistantAgent ←→ UserProxyAgent             │
│  • Sandboxed Subprocess Execution             │
│  • Autonomous Error Detection & Self-Repair   │
│  • Iterative Code Correction Loop             │
│  • Session-Isolated Working Directory         │
└───────────────────────────────────────────────┘
```

### 🔑 The Hybrid Advantage

The system's core innovation is the **seamless handoff between two complementary AI frameworks**:

| Layer | Framework | Role |
|-------|-----------|------|
| **Drafting** | 🦜 LangChain + Llama-3 | Translates the user's natural language task into a clean, executable Python script in milliseconds. Uses structured prompt chains to enforce imports, data handling, and output file conventions. |
| **Execution** | 🤖 AutoGen (`ag2`) | Receives the drafted script and runs it inside a **secure subprocess sandbox**. If the code fails, AutoGen's `AssistantAgent` analyzes the traceback and autonomously rewrites the fix — repeating until the script succeeds or the correction budget is exhausted. |
| **Parsing** | 🔍 FastAPI Service | Scans the session's working directory for generated artifacts (`.png` charts, `.csv` reports), encodes them, and assembles a rich JSON response delivered to the frontend. |

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com) | High-performance async API server, auto-docs |
| **AI Orchestration** | [LangChain 0.3+](https://langchain.com) | Prompt chains, LLM abstraction, code drafting |
| **Agentic Execution** | [AutoGen / ag2](https://github.com/ag2ai/ag2) | Multi-agent self-correcting subprocess runtime |
| **LLM Provider** | [Groq (Llama-3)](https://groq.com) | Ultra-fast inference on open-source Llama-3 models |
| **Frontend** | [Next.js 15 + TypeScript](https://nextjs.org) | React SaaS dashboard with SSR |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) | Utility-first premium UI components |
| **Package Manager** | pip + npm | Backend and frontend dependency management |

---

## 📁 Project Structure

```
antigravity-os/
├── backend/
│   ├── agents/              # AutoGen agent definitions
│   ├── services/            # LangChain chains & artifact parser
│   ├── prompts/             # Structured prompt templates
│   ├── database/            # Session & history storage
│   ├── main.py              # FastAPI app entrypoint
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   └── components/      # React UI components
│   ├── public/              # Static assets
│   ├── package.json
│   └── .env.example         # Frontend env template
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- Python **3.10+**
- Node.js **18+**
- A **Groq API key** (free tier available at [console.groq.com](https://console.groq.com))

---

### 1 · Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/antigravity-os.git
cd antigravity-os
```

### 2 · Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# → Open .env and add your GROQ_API_KEY

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```

> The API will be live at `http://localhost:8000`  
> Interactive docs at `http://localhost:8000/docs`

### 3 · Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# → Set NEXT_PUBLIC_API_URL=http://localhost:8000

# Start the development server
npm run dev
```

> The dashboard will be live at `http://localhost:3000`

---

## 🔌 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/agents` | List all available AI agents |
| `POST` | `/chat` | Send a message to a general agent |
| `POST` | `/data-science` | **Hybrid Pipeline** — Upload CSV + task description, receive analysis artifacts |
| `GET` | `/sessions/{id}` | Retrieve session history & artifacts |

### Example: Hybrid Data Science Request

```bash
curl -X POST "http://localhost:8000/data-science" \
  -F "file=@your_data.csv" \
  -F "task=Analyze sales trends and generate a monthly bar chart"
```

**Response:**
```json
{
  "status": "success",
  "analysis": "...",
  "charts": ["data:image/png;base64,..."],
  "files": [
    { "name": "report.csv", "download_url": "/sessions/abc123/files/report.csv" }
  ],
  "iterations": 2
}
```

---

## 🔑 Environment Variables

Create a `.env` file in `backend/` using the provided `.env.example`:

```env
# Required
GROQ_API_KEY=your_groq_api_key_here

# Optional — defaults shown
GROQ_MODEL=llama3-70b-8192
MAX_AUTOGEN_ITERATIONS=10
EXECUTION_TIMEOUT=120
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m 'feat: add your feature'`
4. **Push** to your branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

Please ensure your code passes linting and includes relevant tests.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by the **Team Alpha**

*Pushing the boundaries of autonomous AI agent systems.*

</div>
