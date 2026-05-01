# InferBenchAI Benchmarking System (Ollama)

A production-grade system for benchmarking Small Language Models (SLMs) entirely locally using Ollama. This system measures performance metrics (latency, throughput) and evaluates response quality using an "LLM-as-judge" pattern.

## 🚀 Quick Start

1. **Prerequisites**: Ensure [Ollama](https://ollama.com/) is installed and running on your local machine.
2. **Setup Models**: Pull the required models via your terminal:
   ```bash
   ollama pull mistral
   ollama pull llama3
   ollama pull phi3
   ```
3. **Environment**: Ensure `OLLAMA_BASE_URL` is set if your Ollama instance is not on `http://localhost:11434`.
4. **Run Benchmarks**: Use the web dashboard to trigger full or individual model benchmarks across categories like Reasoning, Coding, and Summarization.

## 📊 Methodology

### 1. Performance Profiling
- **Latency**: Measures time-to-completion in milliseconds.
- **Throughput (TPS)**: Calculated as `tokens_generated / eval_duration`.
- **Standardization**: All inferences use `temperature = 0` and `top_p = 1` to ensure reproducibility.

### 2. Evaluation Engine (LLM-as-Judge)
Each response is automatically evaluated by a "Judge" model (defaulting to Llama 3) based on:
- **Correctness**: Factual accuracy.
- **Clarity**: Structural and linguistic quality.
- **Completeness**: Coverage of prompt requirements.
Scores are assigned from 0 to 5.

## 🧠 Key Insights

- **Mistral 7B**: Typically offers the best balance between reasoning depth and inference speed for general tasks.
- **Llama 3 8B**: Often excels in strict instruction following and complex reasoning, though with slightly higher latency.
- **Phi-3 Mini**: Best for ultra-low latency applications and basic classification/summarization tasks.

## 🛠️ Tech Stack

- **Frontend**: React (Vite) + Recharts for visualization.
- **Backend**: Node.js Serverless Functions.
- **Database**: PostgreSQL (via Neon) for persistence.
- **Inference**: Ollama (Local LLM API).
