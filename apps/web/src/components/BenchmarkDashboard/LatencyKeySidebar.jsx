import { Timer } from "lucide-react";

export function LatencyKeySidebar() {
  return (
    <div className="bg-[#111] rounded-2xl border border-white/5 p-5">
      <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <Timer size={16} className="text-orange-400" /> Latency Classes
      </h2>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-green-400">⚡ Real-time</span>
          <span className="text-gray-500">&lt;1s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-yellow-400">✓ Acceptable</span>
          <span className="text-gray-500">1–3s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-orange-400">⚠ Slow</span>
          <span className="text-gray-500">3–5s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-red-400">✗ Very Slow</span>
          <span className="text-gray-500">&gt;5s</span>
        </div>
      </div>
    </div>
  );
}
