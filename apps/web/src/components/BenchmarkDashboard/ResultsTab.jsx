import React, { useState } from "react";
import { Table as TableIcon } from "lucide-react";
import { LatencyBadge, costEstimate } from "@/utils/benchmarkHelpers";

export function ResultsTab({ results, expandedRow, setExpandedRow }) {
  return (
    <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <TableIcon size={16} className="text-blue-400" />
          All Runs
        </h3>
        <span className="text-xs text-gray-500">{results.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-white/3 border-b border-white/5">
              {[
                "Model",
                "Category",
                "Type",
                "TPS",
                "Latency",
                "Speed",
                "Score",
                "Cost (mWh)",
                "Evaluation",
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
            {results.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-gray-600"
                >
                  No results yet. Run a benchmark to get started.
                </td>
              </tr>
            ) : (
              results.map((r, idx) => (
                <React.Fragment key={idx}>
                  <tr
                    className="hover:bg-white/3 cursor-pointer"
                    onClick={() =>
                      setExpandedRow(expandedRow === idx ? null : idx)
                    }
                  >
                    <td
                      className="px-4 py-3 font-mono text-xs font-bold"
                      style={{
                        color:
                          r.model === "qwen2.5:0.5b"
                            ? "#3b82f6"
                            : r.model === "llama3.2:1b"
                              ? "#a855f7"
                              : r.model === "tinyllama"
                                ? "#22c55e"
                                : "#3b82f6",
                      }}
                    >
                      {r.model}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-white/8 rounded text-xs text-gray-400 capitalize">
                        {(r.category || "").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.run_type === "cold" ? (
                        <span className="px-2 py-0.5 bg-blue-500/15 text-blue-400 text-xs rounded-full">
                          ❄ Cold
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-orange-500/15 text-orange-400 text-xs rounded-full">
                          🔥 Warm
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-xs">
                      {r.tokens_per_sec ? parseFloat(r.tokens_per_sec).toFixed(1) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-xs">
                      {r.latency_ms?.toLocaleString()}ms
                    </td>
                    <td className="px-4 py-3">
                      <LatencyBadge ms={r.latency_ms} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 bg-white/8 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${((r.score || 0) / 5) * 100}%`,
                              backgroundColor:
                                r.score >= 4
                                  ? "#22c55e"
                                  : r.score >= 3
                                    ? "#eab308"
                                    : "#ef4444",
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-300">
                          {r.score ?? "—"}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-cyan-600 font-mono">
                      {costEstimate(r.latency_ms)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                      {r.evaluation_reason || "⏳ Pending..."}
                    </td>
                  </tr>
                  {expandedRow === idx && (
                    <tr className="bg-white/2">
                      <td colSpan={9} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">
                              Prompt
                            </p>
                            <p className="text-xs text-gray-300 leading-relaxed">
                              {r.prompt}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">
                              Response
                            </p>
                            <p className="text-xs text-gray-300 leading-relaxed max-h-24 overflow-y-auto">
                              {r.response_text}
                            </p>
                          </div>
                          {r.evaluation_reason && (
                            <div className="md:col-span-2">
                              <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">
                                Evaluation
                              </p>
                              <p className="text-xs text-gray-400">
                                {r.evaluation_reason}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
