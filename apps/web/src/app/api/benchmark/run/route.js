import sql from "@/app/api/utils/sql";
import {
  generate,
  getModelRamMb,
  normalizeOutput,
} from "@/app/api/utils/ollama";
import {
  validateModel,
  validatePositiveInt,
  validateBoolean,
  badRequest,
} from "@/app/api/utils/validate";
import { rateLimit, tooManyRequests } from "@/app/api/utils/rateLimit";

const WARMUP_PROMPT = "Respond with only the word OK.";

export async function POST(request) {
  // ── Rate limiting: 500 runs per 10 min per IP (supports full 50-prompt benchmark) ──
  const rl = rateLimit(request, {
    limit: 500,
    windowMs: 600_000,
    key: "benchmark-run",
  });
  if (!rl.allowed) return tooManyRequests(rl.resetAt);

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return badRequest("Request body must be valid JSON");
    }

    // ── Input validation ──────────────────────────────────────────────────
    const modelV = validateModel(body.model);
    if (!modelV.valid) return badRequest(modelV.error);

    const promptIdV = validatePositiveInt(body.promptId, "promptId");
    if (!promptIdV.valid) return badRequest(promptIdV.error);

    const skipWarmupV = validateBoolean(body.skipWarmup, "skipWarmup", false);
    if (!skipWarmupV.valid) return badRequest(skipWarmupV.error);

    const model = modelV.value;
    const promptId = promptIdV.value;
    const skipWarmup = skipWarmupV.value;

    // ── Fetch the prompt ────────────────────────────────────────────────────
    const prompts = await sql`SELECT * FROM prompts WHERE id = ${promptId}`;
    if (prompts.length === 0) {
      return Response.json({ error: "Prompt not found" }, { status: 404 });
    }
    const promptData = prompts[0];

    // ── Detect cold vs warm run ─────────────────────────────────────────────
    const existingRows = await sql`
      SELECT COUNT(*) as count FROM results WHERE model = ${model}
    `;
    const existingCount = parseInt(existingRows[0].count, 10);
    const runType = existingCount === 0 ? "cold" : "warm";

    // ── Warmup phase (MANDATORY per spec) ──────────────────────────────────
    // Run 2 dummy queries — NOT recorded in results
    if (!skipWarmup) {
      for (let i = 0; i < 2; i++) {
        try {
          await generate(model, WARMUP_PROMPT);
          console.log(`[Warmup] ${model} warmup ${i + 1}/2 done`);
        } catch (err) {
          console.warn(
            `[Warmup] ${model} warmup ${i + 1}/2 failed: ${err.message}`,
          );
        }
      }
    }

    // ── Run actual benchmark ────────────────────────────────────────────────
    const result = await generate(model, promptData.prompt);

    // ── Get RAM usage from Ollama /api/ps (model is in memory right now) ───
    const ramUsageMb = await getModelRamMb(model);

    // ── Normalize output for downstream scoring ─────────────────────────────
    const normalizedText = normalizeOutput(result.text);

    // ── Store result ────────────────────────────────────────────────────────
    const saved = await sql`
      INSERT INTO results (
        model,
        prompt_id,
        latency_ms,
        tokens_per_sec,
        response_text,
        ram_usage_mb,
        cpu_percent,
        run_type
      ) VALUES (
        ${model},
        ${promptId},
        ${result.latency_ms},
        ${result.tokens_per_sec},
        ${result.text},
        ${ramUsageMb},
        ${0},
        ${runType}
      ) RETURNING *
    `;

    return Response.json({
      ...saved[0],
      normalized_text: normalizedText,
      run_type: runType,
      warmup_done: !skipWarmup,
    });
  } catch (error) {
    console.error("Benchmark failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
