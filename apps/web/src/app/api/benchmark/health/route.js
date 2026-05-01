/**
 * GET /api/benchmark/health
 * Checks if the Ollama server is reachable and which models are available.
 * Called by the dashboard on load and before any benchmark run.
 */
import { OLLAMA_BASE_URL } from "@/app/api/utils/ollama";

export async function GET() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    // Check Ollama is reachable
    const tagRes = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!tagRes.ok) {
      return Response.json(
        {
          ok: false,
          error: `Ollama responded with HTTP ${tagRes.status}. Is it running correctly?`,
          ollamaUrl: OLLAMA_BASE_URL,
        },
        { status: 503 },
      );
    }

    const data = await tagRes.json();
    const pulledModels = (data.models || []).map((m) => m.name);

    // Check which of our required models are actually pulled
    const requiredModels = ["qwen2.5:0.5b", "llama3.2:1b", "tinyllama"];
    const modelStatus = requiredModels.map((id) => ({
      id,
      pulled: pulledModels.some((name) =>
        name.toLowerCase().startsWith(id.toLowerCase()),
      ),
    }));

    const missingModels = modelStatus.filter((m) => !m.pulled).map((m) => m.id);

    return Response.json({
      ok: true,
      ollamaUrl: OLLAMA_BASE_URL,
      pulledModels,
      modelStatus,
      missingModels,
      ready: missingModels.length === 0,
      message:
        missingModels.length === 0
          ? "All models ready."
          : `Missing models: ${missingModels.join(", ")}. Run: ollama pull ${missingModels[0]}`,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = err.name === "AbortError";
    return Response.json(
      {
        ok: false,
        error: isTimeout
          ? `Ollama connection timed out at ${OLLAMA_BASE_URL}. Is Ollama running?`
          : `Cannot reach Ollama at ${OLLAMA_BASE_URL}. Start it with: ollama serve`,
        ollamaUrl: OLLAMA_BASE_URL,
        detail: err.message,
      },
      { status: 503 },
    );
  }
}
