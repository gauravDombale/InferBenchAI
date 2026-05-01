import { Play, RefreshCw, Shuffle } from "lucide-react";
import { MODELS } from "@/data/models";
import { getColor } from "@/utils/chartConfig";

export function ModelsSidebar({
  chartData,
  health,
  runningModel,
  runningLabel,
  parallelMode,
  setParallelMode,
  handleRunAll,
  ollamaOk,
}) {
  return (
    <div className="bg-[#111] rounded-2xl border border-white/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold flex items-center gap-2 text-sm">
          <Play size={16} className="text-blue-400" /> Models
        </h2>
        <button
          onClick={() => setParallelMode((p) => !p)}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
            parallelMode
              ? "border-yellow-500 text-yellow-400 bg-yellow-500/10"
              : "border-white/10 text-gray-500 hover:border-white/20"
          }`}
        >
          <Shuffle size={12} />
          {parallelMode ? "Parallel" : "Sequential"}
        </button>
      </div>

      <div className="space-y-3">
        {MODELS.map((model) => {
          const md = chartData.find((d) => d.model === model.id);
          const isRunning = runningModel === model.id;
          const isPulled = !health?.missing?.includes(model.id);
          return (
            <div
              key={model.id}
              className="p-4 bg-white/3 rounded-xl border border-white/5 hover:border-white/10 transition-all"
              style={{
                borderLeftColor: getColor(model.id),
                borderLeftWidth: 2,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{model.name}</span>
                <div className="flex items-center gap-1.5">
                  {health && !isPulled && (
                    <span
                      className="text-yellow-500 text-xs"
                      title="Not pulled yet"
                    >
                      ⚠
                    </span>
                  )}
                  <span className="text-xs px-2 py-0.5 bg-white/8 rounded-full text-gray-500">
                    {model.type}
                  </span>
                </div>
              </div>
              {md && (
                <div className="flex gap-3 text-xs text-gray-500 mb-2">
                  <span>{md.avgTPS} tok/s</span>
                  <span>·</span>
                  <span>{md.avgScore}/5</span>
                  {md.avgRam > 0 && (
                    <>
                      <span>·</span>
                      <span>{md.avgRam}MB</span>
                    </>
                  )}
                </div>
              )}
              {isRunning && (
                <p className="text-xs text-blue-400 mb-2 truncate">
                  {runningLabel}
                </p>
              )}
              <button
                onClick={() => handleRunAll(model.id)}
                disabled={runningModel !== null || !ollamaOk}
                className="w-full py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: getColor(model.id) + "22",
                  color: getColor(model.id),
                  border: `1px solid ${getColor(model.id)}44`,
                }}
              >
                {isRunning ? <RefreshCw size={12} /> : <Play size={12} />}
                {isRunning ? "Running..." : "Run Benchmark"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
