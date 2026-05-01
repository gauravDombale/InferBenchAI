import { ShieldCheck } from "lucide-react";

export function InsightsSidebar({ insights }) {
  return (
    <div className="bg-[#111] rounded-2xl border border-white/5 p-5">
      <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <ShieldCheck size={16} className="text-green-400" /> Live Insights
      </h2>
      {insights.length === 0 ? (
        <p className="text-xs text-gray-600">Run benchmarks to see insights.</p>
      ) : (
        <div className="space-y-4">
          {insights.map((ins, i) => (
            <div key={i}>
              <p className="text-xs text-gray-500">{ins.title}</p>
              <p
                className={`font-mono font-bold text-sm uppercase ${ins.color}`}
              >
                {ins.value}
              </p>
              <p className="text-xs text-gray-600">{ins.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
