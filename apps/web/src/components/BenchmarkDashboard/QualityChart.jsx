import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Brain } from "lucide-react";
import { getColor, darkTooltip } from "@/utils/chartConfig";

export function QualityChart({ chartData }) {
  return (
    <div className="bg-[#111] rounded-2xl border border-white/5 p-5">
      <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
        <Brain size={16} className="text-purple-400" />
        Quality Score (0–5)
      </h3>
      <p className="text-xs text-gray-600 mb-4">Rule-based + LLM-as-judge</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis dataKey="model" stroke="#555" tick={{ fontSize: 11 }} />
          <YAxis stroke="#555" domain={[0, 5]} tick={{ fontSize: 11 }} />
          <Tooltip {...darkTooltip} formatter={(v) => [`${v}/5`, "Score"]} />
          <Bar dataKey="avgScore" radius={[4, 4, 0, 0]}>
            {chartData.map((e) => (
              <Cell key={e.model} fill={getColor(e.model)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
