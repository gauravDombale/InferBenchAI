import { ollamaGenerate } from "@/utils/ollamaClient";

function normalizeText(t) {
  return (t || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function ruleBasedScore(response, expected, category) {
  if (!expected) return null;
  const nr = normalizeText(response);
  const ne = normalizeText(expected);
  if (nr === ne || nr.includes(ne))
    return { score: 5, reason: "Exact match (rule-based)" };
  if (category === "factual_qa") {
    const escaped = ne.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`, "i").test(nr))
      return { score: 5, reason: "Exact token match (rule-based)" };
  }
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
  const expWords = ne
    .split(/\W+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
  const resSet = new Set(nr.split(/\W+/));
  const ratio =
    expWords.length > 0
      ? expWords.filter((w) => resSet.has(w)).length / expWords.length
      : 0;
  if (ratio >= 0.85)
    return {
      score: 4,
      reason: `High keyword overlap ${Math.round(ratio * 100)}% (rule-based)`,
    };
  if (ratio >= 0.6)
    return {
      score: 3,
      reason: `Moderate keyword overlap ${Math.round(ratio * 100)}% (rule-based)`,
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
  return { score: 0, reason: "No meaningful match (rule-based)" };
}

async function llmJudge(judgeModel, prompt, expected, responseText) {
  const evalPrompt = `You are an expert evaluator for Large Language Models.
PROMPT: ${prompt}
EXPECTED: ${expected || "N/A"}
ACTUAL RESPONSE: ${responseText}

Score from 0 to 5 based on correctness, clarity, and completeness.
Respond EXACTLY as:
SCORE: [0-5]
REASON: [one sentence]`;
  const result = await ollamaGenerate(judgeModel, evalPrompt);
  const scoreMatch = result.text.match(/SCORE:\s*([0-5])/i);
  const reasonMatch = result.text.match(/REASON:\s*([\s\S]*)/i);
  return {
    score: scoreMatch ? parseInt(scoreMatch[1], 10) : 0,
    reason: reasonMatch
      ? reasonMatch[1].trim().split("\n")[0]
      : "Could not parse judge output",
  };
}

export async function evaluateResponse(
  responseText,
  expected,
  category,
  judgeModel,
) {
  const norm = normalizeText(responseText);
  if (category === "factual_qa" || category === "instruction_following") {
    const rb = ruleBasedScore(norm, expected, category);
    if (rb && rb.score >= 3) return { ...rb, method: "rule-based" };
  }
  try {
    const j = await llmJudge(judgeModel, "", expected, responseText);
    return {
      score: j.score,
      reason: `[LLM-Judge] ${j.reason}`,
      method: "llm-judge",
    };
  } catch {
    const rb = ruleBasedScore(norm, expected, category);
    return rb
      ? { ...rb, method: "rule-based-fallback" }
      : { score: 0, reason: "Could not evaluate", method: "none" };
  }
}
