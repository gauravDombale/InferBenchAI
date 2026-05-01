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
import { Zap } from "lucide-react";
import { getColor, darkTooltip } from "@/utils/chartConfig";

export function ThroughputChart({ chartData }) {
  return (
    <div className="bg-[#111] rounded-2xl border border-white/5 p-5">
      <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
        <Zap size={16} className="text-yellow-400" />
        Throughput (Tokens/sec)
      </h3>
      <p className="text-xs text-gray-600 mb-4">Higher = faster generation</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis dataKey="model" stroke="#555" tick={{ fontSize: 11 }} />
          <YAxis stroke="#555" tick={{ fontSize: 11 }} />
          <Tooltip {...darkTooltip} cursor={{ fill: 'transparent' }} formatter={(v) => [`${v} tok/s`, "TPS"]} />
          <Bar dataKey="avgTPS" radius={[4, 4, 0, 0]}>
            {chartData.map((e) => (
              <Cell key={e.model} fill={getColor(e.model)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
