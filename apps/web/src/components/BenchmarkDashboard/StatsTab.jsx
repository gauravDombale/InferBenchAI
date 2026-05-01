import { TrendingUp, Timer, Layers } from "lucide-react";
import { getColor } from "@/utils/chartConfig";

export function StatsTab({ stats }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-400" />
            Aggregate Statistics
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            P50 = median · P95 = worst 5% · all times in ms
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-white/3 border-b border-white/5">
                {[
                  "Model",
                  "Runs",
                  "Cold/Warm",
                  "Avg",
                  "P50",
                  "P95",
                  "Min",
                  "Max",
                  "TPS",
                  "Score",
                  "RAM",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {stats.models.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-8 text-center text-gray-600"
                  >
                    No data yet — run benchmarks first.
                  </td>
                </tr>
              ) : (
                stats.models.map((m) => (
                  <tr key={m.model} className="hover:bg-white/3">
                    <td
                      className="px-4 py-3 font-mono font-bold text-sm"
                      style={{ color: getColor(m.model) }}
                    >
                      {m.model}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{m.total_runs}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {m.cold_runs}c/{m.warm_runs}w
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {m.avg_latency?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-yellow-400 font-medium">
                      {m.p50_latency?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-orange-400 font-medium">
                      {m.p95_latency?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-green-400">
                      {m.min_latency?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-red-400">
                      {m.max_latency?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{m.avg_tps}</td>
                    <td
                      className="px-4 py-3 font-bold"
                      style={{
                        color:
                          m.avg_score >= 4
                            ? "#22c55e"
                            : m.avg_score >= 3
                              ? "#eab308"
                              : "#ef4444",
                      }}
                    >
                      {m.avg_score}/5
                    </td>
                    <td className="px-4 py-3 text-cyan-400">
                      {m.avg_ram_mb > 0 ? `${m.avg_ram_mb}MB` : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {stats.latency_tiers.length > 0 && (
        <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="font-semibold flex items-center gap-2">
              <Timer size={16} className="text-orange-400" />
              Latency Tier Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white/3 border-b border-white/5">
                  {["Model", "⚡ <1s", "✓ 1–3s", "⚠ 3–5s", "✗ >5s"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-xs font-semibold text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/3">
                {stats.latency_tiers.map((t) => (
                  <tr key={t.model} className="hover:bg-white/3">
                    <td
                      className="px-4 py-3 font-mono font-bold"
                      style={{ color: getColor(t.model) }}
                    >
                      {t.model}
                    </td>
                    <td className="px-4 py-3 text-green-400 font-medium">
                      {t.realtime_count}
                    </td>
                    <td className="px-4 py-3 text-yellow-400 font-medium">
                      {t.acceptable_count}
                    </td>
                    <td className="px-4 py-3 text-orange-400 font-medium">
                      {t.slow_count}
                    </td>
                    <td className="px-4 py-3 text-red-400 font-medium">
                      {t.very_slow_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats.categories.length > 0 && (
        <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="font-semibold flex items-center gap-2">
              <Layers size={16} className="text-purple-400" />
              Per-Category Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white/3 border-b border-white/5">
                  {[
                    "Model",
                    "Category",
                    "Runs",
                    "Avg Latency",
                    "TPS",
                    "Score",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-xs font-semibold text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/3">
                {stats.categories.map((c, i) => (
                  <tr key={i} className="hover:bg-white/3">
                    <td
                      className="px-4 py-3 font-mono text-xs font-bold"
                      style={{ color: getColor(c.model) }}
                    >
                      {c.model}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-white/8 rounded text-xs text-gray-400 capitalize">
                        {(c.category || "").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{c.run_count}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {c.avg_latency?.toLocaleString()}ms
                    </td>
                    <td className="px-4 py-3 text-gray-300">{c.avg_tps}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-white/8 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(c.avg_score / 5) * 100}%`,
                              backgroundColor: getColor(c.model),
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-bold"
                          style={{
                            color:
                              c.avg_score >= 4
                                ? "#22c55e"
                                : c.avg_score >= 3
                                  ? "#eab308"
                                  : "#ef4444",
                          }}
                        >
                          {c.avg_score}/5
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
