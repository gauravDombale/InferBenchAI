# ⚡ InferBenchAI: Local SLM Benchmarking & Evaluation Pipeline

![InferBenchAI Dashboard](https://img.shields.io/badge/Status-Active-success)
![Ollama](https://img.shields.io/badge/Inference-Ollama-blue)
![Neon](https://img.shields.io/badge/Database-Neon_Serverless-cyan)

InferBenchAI is a production-grade benchmarking and evaluation system designed to measure the performance, cost-efficiency, and quality of Small Language Models (SLMs) running entirely locally via Ollama. 

Built with an emphasis on **system-level observability**, this tool goes beyond simple "vibe checks" by providing deterministic metrics like throughput (Tokens/sec), RAM utilization, cold vs. warm start latency, and automated quality scoring using an **LLM-as-a-Judge** architecture.

---

## 🎯 The "Why" (Problem Statement)
With the explosion of local, quantization-friendly SLMs (like Qwen 2.5, LLaMA 3.2 1B, and TinyLlama), engineers face a new dilemma: **Which model provides the best trade-off between inference speed, memory footprint, and output quality for a specific task?** 

InferBenchAI solves this by providing a standardized, reproducible pipeline to evaluate models against task-specific categories (Factual QA, Summarization, Coding, Reasoning, and Instruction Following).

---

## 🏗️ System Architecture

The architecture is designed to be lightweight on the client, robust on the backend, and completely decoupled from external LLM providers (ensuring zero data egress and infinite free testing).

```mermaid
graph TD
    subgraph Client [Frontend - React / Vite]
        Dashboard[Interactive Dashboard]
        Charts[Recharts Visualizations]
        Dashboard -->|API Requests| Charts
    end

    subgraph Server [Backend - Node / Hono]
        API[REST API Layer]
        Runner[Benchmark Runner]
        Evaluator[Evaluation Engine]
        
        API --> Runner
        Runner --> Evaluator
    end

    subgraph Inference [Local Inference]
        Ollama[Ollama Local Server]
        Model_A[(Qwen 0.5B)]
        Model_B[(LLaMA 3.2 1B)]
        Model_C[(TinyLlama)]
        
        Ollama --> Model_A
        Ollama --> Model_B
        Ollama --> Model_C
    end

    subgraph Persistence [Database Layer]
        Neon[(Neon Serverless Postgres)]
    end

    %% Connections
    Dashboard -->|Initiates Run| API
    Runner <-->|Generates Response| Ollama
    Evaluator <-->|LLM-as-Judge scoring| Ollama
    Runner -->|Persist Results| Neon
```

---

## 🧠 Evaluation Methodology

InferBenchAI doesn't just measure speed; it evaluates the *quality* of the generated text.

1. **Performance Profiling**:
   - **Throughput (TPS)**: Standardized measurement of `tokens_generated / eval_duration`.
   - **Latency Profiling**: Differentiates between **Cold Starts** (model loading into VRAM) and **Warm Starts** (cached inference).
   - **Memory Tracking**: Correlates the `ram_usage_mb` directly against model performance.

2. **Automated Quality Scoring**:
   - **Rule-Based**: Fast evaluation for exact-match or regex-bound expected outputs (e.g., Factual QA).
   - **LLM-as-a-Judge**: For subjective or generative tasks (e.g., Summarization), the system dynamically uses a secondary, highly capable model to evaluate the primary model's output based on correctness, clarity, and completeness (scoring 0–5).

---

## ⚖️ Engineering Decisions & Trade-offs

Building a benchmarking suite requires careful consideration of statistical validity and system constraints.

### 1. Database: Serverless Postgres (Neon) vs. SQLite
* **Decision**: Chose Neon Serverless Postgres over a local SQLite file.
* **Why**: While a local DB fits the "local AI" theme, using Serverless Postgres allows for real-time telemetry streaming, horizontal scaling of the dashboard across multiple environments, and robust connection pooling. The `NUMERIC` types natively supported in Postgres also prevent floating-point precision loss when storing strict TPS metrics.
* **Trade-off**: Introduces a minor network dependency for persistence, though inference computations remain 100% offline.

### 2. Evaluation: LLM-as-Judge vs. ROUGE/BLEU
* **Decision**: Adopted an LLM-as-a-Judge pattern rather than traditional NLP metrics.
* **Why**: ROUGE and BLEU penalize models heavily for semantic rephrasing (measuring n-gram overlap rather than semantic correctness). A judge model natively understands semantic intent, yielding a much higher correlation with human preference and true "correctness".
* **Trade-off**: The judge model consumes additional local compute and time during the evaluation phase, slightly extending the total benchmark suite duration.

### 3. Inference: Determinism via Seeding
* **Decision**: Forced `temperature = 0`, `top_p = 1`, and `seed = 42` for all inference requests.
* **Why**: Benchmarking requires high determinism. Without fixing the seed and temperature, variance in generation length and sampling methods would heavily skew throughput and latency metrics between identical runs.

---

## 💻 Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Recharts (for complex radar, scatter, and bar visualization).
- **Backend**: Node.js, Hono API framework (edge-compatible).
- **Database**: Neon Serverless Postgres via `@neondatabase/serverless`.
- **Inference Layer**: Ollama REST API.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- [Ollama](https://ollama.com/) installed and running in the background.

### 2. Pull Required Models
Open a terminal and pull the lightweight SLMs:
```bash
ollama pull qwen2.5:0.5b
ollama pull llama3.2:1b
ollama pull tinyllama
```

### 3. Database Setup
Ensure you have a `.env` file in your `apps/web` directory with your Neon database URL:
```env
DATABASE_URL="postgres://user:pass@ep-your-db.neon.tech/neondb"
```
Run the setup script to initialize the schema:
```bash
node setup-db.js
```

### 4. Run the Application
```bash
npm install
npm run dev
```
Navigate to `http://localhost:4000` to access the dashboard and initiate your benchmark sequence!
