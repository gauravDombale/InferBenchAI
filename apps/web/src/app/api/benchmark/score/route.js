/**
 * POST /api/benchmark/score
 * Saves an evaluation score (from client-side LLM-as-judge call) to the DB.
 */
import sql from "@/app/api/utils/sql";
import { validatePositiveInt, badRequest } from "@/app/api/utils/validate";
import { rateLimit, tooManyRequests } from "@/app/api/utils/rateLimit";

export async function POST(request) {
  const rl = rateLimit(request, {
    limit: 500,
    windowMs: 600_000,
    key: "benchmark-score",
  });
  if (!rl.allowed) return tooManyRequests(rl.resetAt);

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return badRequest("Request body must be valid JSON");
    }

    const resultIdV = validatePositiveInt(body.resultId, "resultId");
    if (!resultIdV.valid) return badRequest(resultIdV.error);

    const resultId = resultIdV.value;
    const score = Math.min(5, Math.max(0, parseInt(body.score, 10) || 0));
    const reason = String(body.reason || "").slice(0, 1000);

    const updated = await sql`
      UPDATE results SET score = ${score}, evaluation_reason = ${reason}
      WHERE id = ${resultId}
      RETURNING *
    `;

    if (updated.length === 0) {
      return Response.json({ error: "Result not found" }, { status: 404 });
    }

    return Response.json(updated[0]);
  } catch (error) {
    console.error("Score update failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
