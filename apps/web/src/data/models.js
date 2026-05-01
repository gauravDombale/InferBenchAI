export const MODELS = [
  { id: "qwen2.5:0.5b", name: "Qwen 2.5 0.5B", type: "General" },
  { id: "llama3.2:1b", name: "LLaMA 3.2 1B", type: "Reasoning" },
  { id: "tinyllama", name: "TinyLlama", type: "Efficient" },
];

export const CATEGORIES = [
  "reasoning",
  "coding",
  "summarization",
  "instruction_following",
  "factual_qa",
];

// Used for server-side allowlist validation
export const ALLOWED_MODELS = MODELS.map((m) => m.id);
export const ALLOWED_JUDGE_MODELS = ["llama3.2:1b", "qwen2.5:0.5b", "tinyllama"];
