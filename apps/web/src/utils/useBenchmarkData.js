import { useMemo } from "react";

export function useChartData(results) {
  return useMemo(() => {
    const acc = {};
    results.forEach((r) => {
      if (!acc[r.model])
        acc[r.model] = { model: r.model, tL: 0, tT: 0, tS: 0, tR: 0, n: 0 };
      acc[r.model].tL += r.latency_ms || 0;
      acc[r.model].tT += r.tokens_per_sec || 0;
      acc[r.model].tS += r.score || 0;
      acc[r.model].tR += r.ram_usage_mb || 0;
      acc[r.model].n += 1;
    });
    return Object.values(acc).map((m) => ({
      model: m.model,
      avgLatency: Math.round(m.tL / m.n),
      avgTPS: parseFloat((m.tT / m.n).toFixed(1)),
      avgScore: parseFloat((m.tS / m.n).toFixed(2)),
      avgRam: Math.round(m.tR / m.n),
    }));
  }, [results]);
}

export function useRadarData(results) {
  return useMemo(() => {
    const cats = [
      "reasoning",
      "coding",
      "summarization",
      "instruction_following",
      "factual_qa",
    ];
    const acc = {};
    results.forEach((r) => {
      if (!r.category) return;
      const k = `${r.model}__${r.category}`;
      if (!acc[k]) acc[k] = { total: 0, count: 0 };
      acc[k].total += r.score || 0;
      acc[k].count += 1;
    });
    const MODELS = [
      { id: "mistral", name: "Mistral 7B", type: "7B" },
      { id: "llama3", name: "Llama 3 8B", type: "8B" },
      { id: "phi", name: "Phi-3 Mini", type: "3.8B" },
    ];
    return cats.map((cat) => {
      const entry = { category: cat.replace(/_/g, " ") };
      MODELS.forEach((m) => {
        const k = `${m.id}__${cat}`;
        entry[m.id] = acc[k]
          ? parseFloat((acc[k].total / acc[k].count).toFixed(2))
          : 0;
      });
      return entry;
    });
  }, [results]);
}

export function useInsights(chartData) {
  return useMemo(() => {
    if (!chartData.length) return [];
    const byTPS = [...chartData].sort((a, b) => b.avgTPS - a.avgTPS);
    const byScore = [...chartData].sort((a, b) => b.avgScore - a.avgScore);
    const byRam = [...chartData].sort((a, b) => a.avgRam - b.avgRam);
    const maxTPS = byTPS[0]?.avgTPS || 1;
    const maxScore = byScore[0]?.avgScore || 1;
    const balanced = chartData.reduce((best, m) => {
      const nt = m.avgTPS / maxTPS;
      const ns = m.avgScore / maxScore;
      const h = nt > 0 && ns > 0 ? (2 * nt * ns) / (nt + ns) : 0;
      return h > (best.h || 0) ? { ...m, h } : best;
    }, {});
    return [
      {
        title: "⚡ Speed King",
        value: byTPS[0]?.model || "—",
        desc: `${byTPS[0]?.avgTPS} tok/s avg`,
        color: "text-yellow-400",
      },
      {
        title: "🧠 Quality Leader",
        value: byScore[0]?.model || "—",
        desc: `${byScore[0]?.avgScore}/5 avg`,
        color: "text-purple-400",
      },
      {
        title: "⚖️ Most Balanced",
        value: balanced?.model || "—",
        desc: `${balanced?.h ? (balanced.h * 100).toFixed(0) : 0}% harmonic score`,
        color: "text-green-400",
      },
      {
        title: "💾 Lightest RAM",
        value: byRam[0]?.model || "—",
        desc: `${byRam[0]?.avgRam || 0} MB avg`,
        color: "text-cyan-400",
      },
    ];
  }, [chartData]);
}
