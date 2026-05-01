/**
 * POST /api/benchmark/store
 * Saves a completed benchmark result (from client-side Ollama call) to the DB.
 * Ollama is called client-side because it runs on the user's local machine.
 */
import sql from "@/app/api/utils/sql";
import {
  validateModel,
  validatePositiveInt,
  badRequest,
} from "@/app/api/utils/validate";
import { rateLimit, tooManyRequests } from "@/app/api/utils/rateLimit";

export async function POST(request) {
  const rl = rateLimit(request, {
    limit: 500,
    windowMs: 600_000,
    key: "benchmark-store",
  });
  if (!rl.allowed) return tooManyRequests(rl.resetAt);

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return badRequest("Request body must be valid JSON");
    }

    const modelV = validateModel(body.model);
    if (!modelV.valid) return badRequest(modelV.error);

    const promptIdV = validatePositiveInt(body.promptId, "promptId");
    if (!promptIdV.valid) return badRequest(promptIdV.error);

    const model = modelV.value;
    const promptId = promptIdV.value;
    const latency_ms = parseInt(body.latencyMs, 10) || 0;
    const tokens_per_sec = parseFloat(body.tokensSec) || 0;
    const response_text = String(body.responseText || "").slice(0, 20000);
    const ram_usage_mb = parseInt(body.ramMb, 10) || 0;

    // Detect cold vs warm
    const existingRows =
      await sql`SELECT COUNT(*) AS count FROM results WHERE model = ${model}`;
    const runType = parseInt(existingRows[0].count, 10) === 0 ? "cold" : "warm";

    const saved = await sql`
      INSERT INTO results (model, prompt_id, latency_ms, tokens_per_sec, response_text, ram_usage_mb, cpu_percent, run_type)
      VALUES (${model}, ${promptId}, ${latency_ms}, ${tokens_per_sec}, ${response_text}, ${ram_usage_mb}, ${0}, ${runType})
      RETURNING *
    `;

    return Response.json({ ...saved[0], run_type: runType });
  } catch (error) {
    console.error("Store result failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
