# AGENT.md — Local SLM Benchmarking System (Ollama)

## 🧠 Project Goal

Build a **fully offline, production-grade benchmarking system for Small Language Models (SLMs)** using Ollama.

This system must:

* Run entirely locally (no external APIs)
* Benchmark **at least 3 models**
* Measure **latency, throughput, memory**
* Evaluate **response quality**
* Produce **clear insights on tradeoffs (speed vs quality vs cost)**

This is a **systems + evaluation + infra project**, not just inference.

---

## 🎯 Success Criteria

The project is considered complete only if:

* Benchmarks are **reproducible**
* Models are compared **fairly (same prompts + params)**
* Evaluation includes **objective + subjective scoring**
* Results include **real insights, not just numbers**
* System handles **failures, warmups, and edge cases**

---

## 🏗️ System Architecture

```
                ┌──────────────────────┐
                │      CLI (Typer)     │
                └─────────┬────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Model Runner │  │ Eval Engine  │  │ Metrics Store│
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       ▼                 ▼                 ▼
   Ollama API     Scoring Logic      SQLite / JSON
       │
       ▼
 Local Models (Mistral / LLaMA / Phi)
```

---

## 🧱 Tech Stack

### Core

* Python 3.11+
* Ollama (local LLM inference)
* Typer (CLI interface)
* FastAPI (optional API layer)

### Data & Storage

* SQLite or DuckDB
* JSON (raw logs)

### Evaluation

* Custom prompt datasets
* LLM-as-judge (must be local)

### Metrics & Profiling

* time.perf_counter
* psutil (CPU/RAM)
* pynvml (GPU stats if available)

### Visualization

* Matplotlib or Plotly
* Optional: Streamlit dashboard

---

## 📁 Project Structure

```
local-slm-bench/
│
├── AGENT.md
├── README.md
├── requirements.txt
│
├── models/
│   └── config.yaml
│
├── benchmarks/
│   ├── prompts.json
│   └── tasks.py
│
├── core/
│   ├── runner.py
│   ├── evaluator.py
│   ├── metrics.py
│   ├── logger.py
│   └── utils.py
│
├── cli/
│   └── main.py
│
├── results/
│   ├── raw/
│   └── reports/
│
└── dashboard/
    └── app.py
```

---

## ⚙️ Models (Minimum Requirement)

The agent MUST benchmark at least 3 models:

* mistral (7B)
* llama3 (8B)
* phi (efficient small model)

### Rules:

* All models must run via Ollama
* Use identical parameters:

  * temperature = 0
  * top_p = 1
  * max_tokens fixed
* No randomness unless explicitly tested

---

## 🧪 Benchmark Dataset

File: `benchmarks/prompts.json`

Each entry:

```json
{
  "id": "task_1",
  "category": "reasoning",
  "prompt": "Solve this step-by-step...",
  "expected": "correct answer"
}
```

### Required Categories:

* reasoning
* coding
* summarization
* instruction_following
* factual_qa

Minimum:

* 10 prompts per category

---

## 🚀 Execution Pipeline

### Step 1: Warmup Phase (MANDATORY)

* Run 2–3 dummy queries per model
* Do NOT record metrics

---

### Step 2: Model Inference

For each prompt:

* Record start time
* Call Ollama `/api/generate`
* Capture:

  * first token latency (if possible)
  * full response time
  * output text

---

### Step 3: Metrics Collection

Each run must produce:

```python
{
  "model": "mistral",
  "task_id": "task_1",
  "latency_ms": 1200,
  "tokens_per_sec": 45,
  "ram_usage_mb": 3200,
  "cpu_percent": 75,
  "output_length": 180
}
```

---

### Step 4: Evaluation System

#### 1. Rule-Based

* Exact match (for QA)
* Keyword overlap
* Regex validation

#### 2. LLM-as-Judge (LOCAL MODEL ONLY)

Prompt template:

```
You are an evaluator.

Score the following response from 0 to 5 based on:
- correctness
- clarity
- completeness

Only output a number.
```

---

### Step 5: Logging

Store:

* Raw outputs → `results/raw/*.json`
* Structured metrics → SQLite

---

### Step 6: Aggregation

Compute per model:

* avg latency
* p50 / p95 latency
* avg tokens/sec
* avg score
* avg RAM usage

---

### Step 7: Report Generation

Generate:

#### Table

| Model | Avg Latency | P95 | Tokens/sec | Score | RAM |
| ----- | ----------- | --- | ---------- | ----- | --- |

#### Graphs

* Latency vs Quality
* Tokens/sec vs Model Size
* Memory vs Performance

---

## 🔐 Constraints (STRICT)

### Privacy

* ZERO external API calls
* Fully offline execution

### Cost Awareness

Estimate:

```
cost ≈ power_usage * runtime
```

### Latency Classification

* <1s → real-time
* 1–3s → acceptable
* > 5s → slow

---

## 🧠 Senior Engineering Requirements

Agent MUST implement:

* Deterministic runs (fixed seed)
* Prompt standardization
* Retry logic on failures
* Timeout handling
* Cold vs warm benchmarking
* Output normalization before scoring
* Modular code (no monoliths)

---

## ⚡ Performance Enhancements (REQUIRED)

* Parallel execution (if CPU allows)
* Batched evaluation (optional)
* Efficient logging (no blocking I/O)

---

## 📈 Stretch Goals (Optional but High Value)

* Quantization comparison (Q4 vs Q8)
* Streaming token latency tracking
* GPU vs CPU benchmarking
* Auto model recommendation system
* Multi-run statistical confidence

---

## 🧪 CLI Interface

Examples:

```
python cli/main.py run --model mistral
python cli/main.py benchmark --all
python cli/main.py evaluate
python cli/main.py report
```

---

## 📄 README Requirements

Agent MUST generate README with:

### Sections:

* Setup instructions
* Hardware specs
* Benchmark methodology
* Results summary
* Key insights (MANDATORY)

### Example Insight:

* "Mistral is 2x faster but 30% worse in reasoning than LLaMA"
* "Phi is best for low-latency applications"

---

## ⚠️ Common Failure Modes (AVOID)

* Not controlling randomness ❌
* No proper evaluation ❌
* Inconsistent prompts ❌
* No real insights ❌
* Only showing averages (no p95) ❌

---

## 🧭 Agent Execution Plan

1. Initialize repo
2. Install dependencies
3. Install + verify Ollama
4. Pull required models
5. Implement runner
6. Implement benchmark loader
7. Implement evaluation engine
8. Add metrics tracking
9. Run benchmarks
10. Generate reports
11. Write insights (CRITICAL)

---

## 🏁 Final Deliverable

A system that clearly answers:

* Which model is fastest?
* Which model is most accurate?
* What are the tradeoffs?
* When should each model be used?

---

## 🔥 What Makes This Top 1%

* Reproducibility
* Clean evaluation design
* Real systems thinking
* Insightful conclusions

If done right, this is **better than 95% of AI portfolio projects**.
