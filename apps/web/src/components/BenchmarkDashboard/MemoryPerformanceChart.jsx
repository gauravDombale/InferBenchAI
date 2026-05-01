import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MemoryStick } from "lucide-react";
import { darkTooltip } from "@/utils/chartConfig";

export function MemoryPerformanceChart({ chartData }) {
  return (
    <div className="bg-[#111] rounded-2xl border border-white/5 p-5">
      <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
        <MemoryStick size={16} className="text-cyan-400" />
        Memory vs. Performance
      </h3>
      <p className="text-xs text-gray-600 mb-4">
        RAM from Ollama /api/ps during runs
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis dataKey="model" stroke="#555" tick={{ fontSize: 11 }} />
          <YAxis
            yAxisId="ram"
            stroke="#06b6d4"
            tick={{ fontSize: 11 }}
            orientation="left"
            unit="MB"
          />
          <YAxis
            yAxisId="score"
            stroke="#a855f7"
            tick={{ fontSize: 11 }}
            orientation="right"
            domain={[0, 5]}
          />
          <Tooltip {...darkTooltip} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar
            yAxisId="ram"
            dataKey="avgRam"
            fill="#06b6d4"
            radius={[4, 4, 0, 0]}
            name="RAM (MB)"
            opacity={0.7}
          />
          <Bar
            yAxisId="score"
            dataKey="avgScore"
            fill="#a855f7"
            radius={[4, 4, 0, 0]}
            name="Avg Score"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
