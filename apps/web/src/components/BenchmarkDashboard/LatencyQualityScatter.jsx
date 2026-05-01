import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Activity } from "lucide-react";
import { getColor } from "@/utils/chartConfig";

export function LatencyQualityScatter({ chartData }) {
  return (
    <div className="bg-[#111] rounded-2xl border border-white/5 p-5">
      <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
        <Activity size={16} className="text-blue-400" />
        Latency vs. Quality
      </h3>
      <p className="text-xs text-gray-600 mb-4">
        Bottom-right = sweet spot (fast + accurate)
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <ScatterChart margin={{ top: 4, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#222" />
          <XAxis
            type="number"
            dataKey="avgLatency"
            name="Latency"
            unit="ms"
            stroke="#555"
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="avgScore"
            name="Score"
            domain={[0, 5]}
            stroke="#555"
            tick={{ fontSize: 11 }}
          />
          <ZAxis range={[120, 120]} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-xs">
                  <p
                    className="font-bold mb-1"
                    style={{ color: getColor(d.model) }}
                  >
                    {d.model}
                  </p>
                  <p className="text-gray-400">Latency: {d.avgLatency}ms</p>
                  <p className="text-gray-400">Score: {d.avgScore}/5</p>
                  <p className="text-gray-400">TPS: {d.avgTPS}</p>
                </div>
              );
            }}
          />
          <Scatter data={chartData}>
            {chartData.map((e) => (
              <Cell key={e.model} fill={getColor(e.model)} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
