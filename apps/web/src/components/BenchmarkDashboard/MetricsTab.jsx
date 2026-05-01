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
import { Zap, Brain, Activity, MemoryStick, Layers } from "lucide-react";
import { getColor, darkTooltip } from "@/utils/chartConfig";
import { ThroughputChart } from "./ThroughputChart";
import { QualityChart } from "./QualityChart";
import { LatencyQualityScatter } from "./LatencyQualityScatter";
import { MemoryPerformanceChart } from "./MemoryPerformanceChart";
import { RadarChartComponent } from "./RadarChartComponent";

export function MetricsTab({ chartData, radarData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ThroughputChart chartData={chartData} />
        <QualityChart chartData={chartData} />
        <LatencyQualityScatter chartData={chartData} />
        <MemoryPerformanceChart chartData={chartData} />
      </div>

      <RadarChartComponent radarData={radarData} />
    </div>
  );
}
