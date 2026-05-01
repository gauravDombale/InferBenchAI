/**
 * Input validation & allowlist utilities
 * Used across all benchmark API routes to prevent invalid/abusive input.
 */
import { ALLOWED_MODELS, ALLOWED_JUDGE_MODELS } from "@/data/models";

export { ALLOWED_MODELS, ALLOWED_JUDGE_MODELS };

// ─── Model allowlist ─────────────────────────────────────────────────────────
export function validateModel(model) {
  if (!model || typeof model !== "string") {
    return { valid: false, error: "model is required and must be a string" };
  }
  const trimmed = model.trim().toLowerCase();
  if (!ALLOWED_MODELS.includes(trimmed)) {
    return {
      valid: false,
      error: `Invalid model "${model}". Allowed: ${ALLOWED_MODELS.join(", ")}`,
    };
  }
  return { valid: true, value: trimmed };
}

// ─── Judge model allowlist ───────────────────────────────────────────────────
export function validateJudgeModel(model) {
  const fallback = "llama3";
  if (!model) return { valid: true, value: fallback };
  const trimmed = String(model).trim().toLowerCase();
  if (!ALLOWED_JUDGE_MODELS.includes(trimmed)) {
    return {
      valid: false,
      error: `Invalid judgeModel "${model}". Allowed: ${ALLOWED_JUDGE_MODELS.join(", ")}`,
    };
  }
  return { valid: true, value: trimmed };
}

// ─── Positive integer ────────────────────────────────────────────────────────
export function validatePositiveInt(value, fieldName = "id") {
  const parsed = parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0 || isNaN(parsed)) {
    return {
      valid: false,
      error: `${fieldName} must be a positive integer, got: "${value}"`,
    };
  }
  return { valid: true, value: parsed };
}

// ─── Boolean with default ────────────────────────────────────────────────────
export function validateBoolean(
  value,
  fieldName = "field",
  defaultValue = false,
) {
  if (value === undefined || value === null)
    return { valid: true, value: defaultValue };
  if (typeof value === "boolean") return { valid: true, value };
  if (value === "true") return { valid: true, value: true };
  if (value === "false") return { valid: true, value: false };
  return { valid: false, error: `${fieldName} must be a boolean` };
}

// ─── Build a 400 Bad Request response ────────────────────────────────────────
export function badRequest(error) {
  return Response.json({ error }, { status: 400 });
}
