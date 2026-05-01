export const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || "http://localhost:11434";

// ─── Retry with exponential backoff ─────────────────────────────────────────
async function withRetry(fn, maxAttempts = 3, baseDelayMs = 1000) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(
        `[Ollama] Attempt ${attempt}/${maxAttempts} failed: ${error.message}. Retrying in ${delay}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

// ─── Get currently loaded models + memory from Ollama /api/ps ───────────────
export async function getRunningModels() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/ps`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) return [];
    const data = await response.json();
    return data.models || [];
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

export async function getModelRamMb(modelName) {
  const running = await getRunningModels();
  const match = running.find(
    (m) =>
      m.name.toLowerCase().includes(modelName.toLowerCase()) ||
      modelName.toLowerCase().includes(m.name.split(":")[0].toLowerCase()),
  );
  if (!match) return 0;
  return Math.round((match.size || 0) / 1024 / 1024);
}

// ─── Output normalization before scoring ────────────────────────────────────
export function normalizeOutput(text) {
  if (!text) return "";
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

// ─── Main generate function with retry + deterministic params ────────────────
export async function generate(model, prompt, options = {}) {
  return withRetry(async () => {
    const start = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5-min timeout

    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0, // fully deterministic
            top_p: 1,
            seed: 42, // fixed seed for reproducibility
            ...options,
          },
        }),
      });

      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const end = performance.now();

      // Ollama returns durations in nanoseconds
      return {
        text: data.response || "",
        latency_ms: Math.round(end - start),
        total_duration_ms: data.total_duration
          ? Math.round(data.total_duration / 1e6)
          : 0,
        load_duration_ms: data.load_duration
          ? Math.round(data.load_duration / 1e6)
          : 0,
        eval_count: data.eval_count || 0,
        eval_duration_ms: data.eval_duration
          ? Math.round(data.eval_duration / 1e6)
          : 0,
        tokens_per_sec:
          data.eval_count && data.eval_duration
            ? data.eval_count / (data.eval_duration / 1e9)
            : 0,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("Ollama request timed out after 5 minutes");
      }
      throw error;
    }
  });
}
