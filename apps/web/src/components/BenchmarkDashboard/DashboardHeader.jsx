import { Activity, RotateCw } from "lucide-react";

export function DashboardHeader({
  health,
  healthChecking,
  checkHealth,
  ollamaOk,
  totalRuns,
  pendingEval,
}) {
  const ollamaStatusColor =
    health === null ? "bg-gray-500" : ollamaOk ? "bg-green-500" : "bg-red-500";
  const ollamaStatusLabel =
    health === null
      ? "Checking..."
      : ollamaOk
        ? "Ollama Online"
        : "Ollama Offline";

  return (
    <header className="border-b border-white/5 px-6 md:px-12 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Activity size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">InferBenchAI</h1>
            <p className="text-gray-500 text-sm">
              Local Ollama · Fully Offline · seed=42, temp=0
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5 text-sm">
          <button
            onClick={checkHealth}
            disabled={healthChecking}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors disabled:opacity-60"
            title="Click to recheck Ollama connection"
          >
            {healthChecking ? (
              <RotateCw size={12} />
            ) : (
              <div
                className={`w-2 h-2 rounded-full ${ollamaStatusColor}`}
                style={ollamaOk ? { boxShadow: "0 0 6px #22c55e" } : {}}
              />
            )}
            {ollamaStatusLabel}
          </button>
          <div className="text-gray-600 text-xs">
            {totalRuns} runs · {pendingEval} pending eval
          </div>
        </div>
      </div>
    </header>
  );
}
