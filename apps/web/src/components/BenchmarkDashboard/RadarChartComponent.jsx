import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Layers } from "lucide-react";
import { MODELS } from "@/data/models";
import { getColor, darkTooltip } from "@/utils/chartConfig";

export function RadarChartComponent({ radarData }) {
  const hasData = radarData.some((d) => MODELS.some((m) => d[m.id] > 0));

  if (!hasData) return null;

  return (
    <div className="bg-[#111] rounded-2xl border border-white/5 p-5">
      <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
        <Layers size={16} className="text-orange-400" />
        Per-Category Radar
      </h3>
      <p className="text-xs text-gray-600 mb-4">Model strengths by task type</p>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart
          data={radarData}
          margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
        >
          <PolarGrid stroke="#222" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: "#666", fontSize: 11 }}
          />
          <PolarRadiusAxis
            domain={[0, 5]}
            tick={{ fill: "#555", fontSize: 10 }}
          />
          {MODELS.map((m) => (
            <Radar
              key={m.id}
              name={m.name}
              dataKey={m.id}
              stroke={getColor(m.id)}
              fill={getColor(m.id)}
              fillOpacity={0.15}
            />
          ))}
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Tooltip {...darkTooltip} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
