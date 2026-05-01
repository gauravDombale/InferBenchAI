const OLLAMA_URL = "http://localhost:11434";
const WARMUP_PROMPT = "Respond with only the word OK.";

export async function ollamaHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok)
      return {
        ok: false,
        error: `Ollama responded with HTTP ${res.status}`,
        isCors: false,
      };
    const data = await res.json();
    const pulled = (data.models || []).map((m) =>
      m.name.toLowerCase(),
    );
    const required = ["qwen2.5:0.5b", "llama3.2:1b", "tinyllama"];
    const missing = required.filter((r) => !pulled.some((p) => p.startsWith(r)));
    return { ok: true, pulled, missing, ready: missing.length === 0 };
  } catch (err) {
    // "Failed to fetch" / TypeError almost always means CORS blocked —
    // Ollama IS running but rejecting the request from this browser origin.
    // A real "not running" error surfaces as ERR_CONNECTION_REFUSED which
    // also triggers a TypeError but usually includes the word "connect".
    const msg = err.message || "";
    const isCors =
      err.name === "TypeError" &&
      !msg.toLowerCase().includes("connect") &&
      err.name !== "AbortError";

    return {
      ok: false,
      isCors,
      error:
        err.name === "AbortError"
          ? `Connection timed out — is Ollama running at ${OLLAMA_URL}?`
          : isCors
            ? `CORS blocked: Ollama is running but rejected the request from this origin. Restart with OLLAMA_ORIGINS=*.`
            : `Cannot connect to Ollama at ${OLLAMA_URL}. Make sure it is running.`,
    };
  }
}

export async function ollamaGenerate(model, prompt) {
  const start = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300_000); // 5 min
  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature: 0, top_p: 1, seed: 42 },
      }),
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Ollama error ${res.status}: ${txt}`);
    }
    const data = await res.json();
    const end = performance.now();
    return {
      text: data.response || "",
      latencyMs: Math.round(end - start),
      tokensSec:
        data.eval_count && data.eval_duration
          ? data.eval_count / (data.eval_duration / 1e9)
          : 0,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError")
      throw new Error("Ollama request timed out after 5 min");
    throw err;
  }
}

export { OLLAMA_URL, WARMUP_PROMPT };
