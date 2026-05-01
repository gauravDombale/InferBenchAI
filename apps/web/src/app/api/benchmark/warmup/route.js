import { generate } from "@/app/api/utils/ollama";
import { validateModel, badRequest } from "@/app/api/utils/validate";
import { rateLimit, tooManyRequests } from "@/app/api/utils/rateLimit";

const WARMUP_PROMPT = "Respond with only the word OK.";
const WARMUP_RUNS = 2;

/**
 * POST /api/benchmark/warmup
 * Runs 2 dummy queries per model — NOT recorded. Required before real benchmarks.
 */
export async function POST(request) {
  // ── Rate limiting: 50 warmups per 10 min per IP ───────────────────────────
  const rl = rateLimit(request, {
    limit: 50,
    windowMs: 600_000,
    key: "benchmark-warmup",
  });
  if (!rl.allowed) return tooManyRequests(rl.resetAt);

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return badRequest("Request body must be valid JSON");
    }

    // ── Input validation ─────────────────────────────────────────────────
    const modelV = validateModel(body.model);
    if (!modelV.valid) return badRequest(modelV.error);
    const model = modelV.value;

    const warmupResults = [];
    for (let i = 0; i < WARMUP_RUNS; i++) {
      const start = performance.now();
      try {
        const result = await generate(model, WARMUP_PROMPT);
        warmupResults.push({
          run: i + 1,
          latency_ms: result.latency_ms,
          success: true,
        });
        console.log(
          `[Warmup] ${model} run ${i + 1}/${WARMUP_RUNS}: ${result.latency_ms}ms`,
        );
      } catch (err) {
        warmupResults.push({
          run: i + 1,
          latency_ms: Math.round(performance.now() - start),
          success: false,
          error: err.message,
        });
        console.warn(`[Warmup] ${model} run ${i + 1} failed: ${err.message}`);
      }
    }

    const avgWarmupMs =
      warmupResults.reduce((sum, r) => sum + r.latency_ms, 0) /
      warmupResults.length;

    return Response.json({
      model,
      warmup_runs: WARMUP_RUNS,
      results: warmupResults,
      avg_warmup_latency_ms: Math.round(avgWarmupMs),
      message: `Warmup complete for ${model}. Model is hot and ready.`,
    });
  } catch (error) {
    console.error("Warmup failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
