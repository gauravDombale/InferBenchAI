export const MODELS = [
  { id: "mistral", name: "Mistral 7B", type: "General" },
  { id: "llama3", name: "LLaMA 3 8B", type: "Reasoning" },
  { id: "phi", name: "Phi-3 Mini", type: "Efficient" },
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
export const ALLOWED_JUDGE_MODELS = ["llama3", "mistral", "phi"];
