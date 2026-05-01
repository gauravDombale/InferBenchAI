import sql from "@/app/api/utils/sql";

/**
 * GET /api/results/stats
 * Returns per-model aggregate stats including P50 and P95 latency,
 * average TPS, quality score, RAM, and run counts.
 * Uses PostgreSQL's built-in percentile_cont for accurate percentile computation.
 */
export async function GET() {
  try {
    // Per-model aggregate stats with P50 / P95
    const modelStats = await sql`
      SELECT
        model,
        COUNT(*)::int                                                        AS total_runs,
        COUNT(*) FILTER (WHERE run_type = 'cold')::int                       AS cold_runs,
        COUNT(*) FILTER (WHERE run_type = 'warm')::int                       AS warm_runs,
        ROUND(AVG(latency_ms))::int                                          AS avg_latency,
        ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY latency_ms))::int  AS p50_latency,
        ROUND(percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms))::int AS p95_latency,
        ROUND(MIN(latency_ms))::int                                          AS min_latency,
        ROUND(MAX(latency_ms))::int                                          AS max_latency,
        ROUND(AVG(tokens_per_sec)::numeric, 2)                               AS avg_tps,
        ROUND(MAX(tokens_per_sec)::numeric, 2)                               AS max_tps,
        ROUND(AVG(COALESCE(score, 0))::numeric, 2)                           AS avg_score,
        ROUND(AVG(COALESCE(ram_usage_mb, 0)))::int                           AS avg_ram_mb,
        MAX(COALESCE(ram_usage_mb, 0))::int                                  AS max_ram_mb
      FROM results
      GROUP BY model
      ORDER BY avg_score DESC
    `;

    // Per-model per-category breakdown
    const categoryStats = await sql`
      SELECT
        model,
        category,
        COUNT(*)::int                                      AS run_count,
        ROUND(AVG(latency_ms))::int                        AS avg_latency,
        ROUND(AVG(tokens_per_sec)::numeric, 2)             AS avg_tps,
        ROUND(AVG(COALESCE(score, 0))::numeric, 2)         AS avg_score
      FROM results r
      JOIN prompts p ON r.prompt_id = p.id
      GROUP BY model, category
      ORDER BY model, category
    `;

    // Latency classification breakdown per model (counts by speed tier)
    const latencyTiers = await sql`
      SELECT
        model,
        COUNT(*) FILTER (WHERE latency_ms < 1000)::int  AS realtime_count,
        COUNT(*) FILTER (WHERE latency_ms BETWEEN 1000 AND 2999)::int AS acceptable_count,
        COUNT(*) FILTER (WHERE latency_ms BETWEEN 3000 AND 4999)::int AS slow_count,
        COUNT(*) FILTER (WHERE latency_ms >= 5000)::int AS very_slow_count
      FROM results
      GROUP BY model
      ORDER BY model
    `;

    return Response.json({
      models: modelStats,
      categories: categoryStats,
      latency_tiers: latencyTiers,
    });
  } catch (error) {
    console.error("Stats query failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
