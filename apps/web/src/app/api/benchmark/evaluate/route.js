import sql from "@/app/api/utils/sql";
import { generate, normalizeOutput } from "@/app/api/utils/ollama";
import {
  validatePositiveInt,
  validateJudgeModel,
  badRequest,
} from "@/app/api/utils/validate";
import { rateLimit, tooManyRequests } from "@/app/api/utils/rateLimit";

// ─── Rule-Based Scoring ──────────────────────────────────────────────────────
function ruleBasedScore(response, expected, category) {
  if (!expected) return null;

  const normResponse = normalizeOutput(response);
  const normExpected = normalizeOutput(expected);

  // 1. Exact / substring match
  if (normResponse === normExpected || normResponse.includes(normExpected)) {
    return {
      score: 5,
      reason: "Exact match with expected answer (rule-based)",
    };
  }

  // 2. Regex match for factual short answers (numbers, symbols, single words)
  if (category === "factual_qa") {
    const escaped = normExpected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(normResponse)) {
      return { score: 5, reason: "Regex exact-token match (rule-based)" };
    }
  }

  // 3. Keyword overlap scoring
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "be",
    "to",
    "of",
    "and",
    "in",
    "that",
    "it",
  ]);
  const expectedWords = normExpected
    .split(/\W+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
  const responseWordSet = new Set(normResponse.split(/\W+/));
  const matches = expectedWords.filter((w) => responseWordSet.has(w));
  const ratio =
    expectedWords.length > 0 ? matches.length / expectedWords.length : 0;

  if (ratio >= 0.85)
    return {
      score: 4,
      reason: `High keyword overlap ${Math.round(ratio * 100)}% (rule-based)`,
    };
  if (ratio >= 0.6)
    return {
      score: 3,
      reason: `Good keyword overlap ${Math.round(ratio * 100)}% (rule-based)`,
    };
  if (ratio >= 0.35)
    return {
      score: 2,
      reason: `Partial keyword overlap ${Math.round(ratio * 100)}% (rule-based)`,
    };
  if (ratio >= 0.1)
    return {
      score: 1,
      reason: `Low keyword overlap ${Math.round(ratio * 100)}% (rule-based)`,
    };

  return { score: 0, reason: "No meaningful keyword match (rule-based)" };
}

// ─── LLM-as-Judge ────────────────────────────────────────────────────────────
async function llmJudge(judgeModel, prompt, expected, responseText) {
  const evaluationPrompt = `You are an expert evaluator for Large Language Models.

PROMPT: ${prompt}
EXPECTED (Reference): ${expected || "N/A"}
ACTUAL RESPONSE: ${responseText}

Score the ACTUAL RESPONSE from 0 to 5 based on:
1. Correctness: Is the answer factually accurate?
2. Clarity: Is the response easy to understand?
3. Completeness: Does it address all parts of the prompt?

Format your response EXACTLY as:
SCORE: [single digit 0-5]
REASON: [one sentence explanation]`;

  const evalResult = await generate(judgeModel, evaluationPrompt);
  const normalizedEval = evalResult.text.trim();

  const scoreMatch = normalizedEval.match(/SCORE:\s*([0-5])/i);
  const reasonMatch = normalizedEval.match(/REASON:\s*([\s\S]*)/i);

  return {
    score: scoreMatch ? parseInt(scoreMatch[1], 10) : 0,
    reason: reasonMatch
      ? reasonMatch[1].trim().split("\n")[0]
      : "LLM judge did not return a parseable score.",
  };
}

// ─── Main Evaluate Handler ───────────────────────────────────────────────────
export async function POST(request) {
  // ── Rate limiting: 500 evaluations per 10 min per IP ─────────────────────
  const rl = rateLimit(request, {
    limit: 500,
    windowMs: 600_000,
    key: "benchmark-evaluate",
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
    const resultIdV = validatePositiveInt(body.resultId, "resultId");
    if (!resultIdV.valid) return badRequest(resultIdV.error);

    const judgeModelV = validateJudgeModel(body.judgeModel);
    if (!judgeModelV.valid) return badRequest(judgeModelV.error);

    const resultId = resultIdV.value;
    const judgeModel = judgeModelV.value;

    const rows = await sql`
      SELECT r.*, p.prompt, p.expected, p.category
      FROM results r
      JOIN prompts p ON r.prompt_id = p.id
      WHERE r.id = ${resultId}
    `;

    if (rows.length === 0) {
      return Response.json({ error: "Result not found" }, { status: 404 });
    }

    const item = rows[0];

    // Normalize response before scoring
    const normalizedResponse = normalizeOutput(item.response_text);

    let score = 0;
    let reason = "Evaluation not completed.";
    let method = "none";

    // For factual_qa: try rule-based first (fast, deterministic)
    if (
      item.category === "factual_qa" ||
      item.category === "instruction_following"
    ) {
      const rb = ruleBasedScore(
        normalizedResponse,
        item.expected,
        item.category,
      );
      if (rb && rb.score >= 3) {
        score = rb.score;
        reason = rb.reason;
        method = "rule-based";
      }
    }

    // Fall back to LLM-as-judge if rule-based didn't give a confident result
    if (method === "none") {
      try {
        const judgement = await llmJudge(
          judgeModel,
          item.prompt,
          item.expected,
          item.response_text,
        );
        score = judgement.score;
        reason = `[LLM-Judge] ${judgement.reason}`;
        method = "llm-judge";
      } catch (err) {
        console.warn(
          "LLM judge failed, falling back to rule-based:",
          err.message,
        );
        const rb = ruleBasedScore(
          normalizedResponse,
          item.expected,
          item.category,
        );
        if (rb) {
          score = rb.score;
          reason = `[Fallback] ${rb.reason}`;
          method = "rule-based-fallback";
        }
      }
    }

    const updated = await sql`
      UPDATE results
      SET score = ${score}, evaluation_reason = ${reason}
      WHERE id = ${resultId}
      RETURNING *
    `;

    return Response.json({ ...updated[0], eval_method: method });
  } catch (error) {
    console.error("Evaluation failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
