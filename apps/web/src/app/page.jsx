/**
 * InferBenchAI Dashboard
 *
 * KEY ARCHITECTURE:
 * - All Ollama calls are made CLIENT-SIDE (browser → localhost:11434)
 *   because Ollama runs on the user's local machine, not the cloud server.
 * - Server-side API routes are used ONLY for database reads/writes.
 */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useOllamaHealth } from "@/utils/useOllamaHealth";
import { useBenchmarkRunner } from "@/utils/useBenchmarkRunner";
import {
  useChartData,
  useRadarData,
  useInsights,
} from "@/utils/useBenchmarkData";
import { OLLAMA_URL } from "@/utils/ollamaClient";
import { DashboardHeader } from "@/components/BenchmarkDashboard/DashboardHeader";
import {
  OllamaOfflineBanner,
  MissingModelsBanner,
  ReadyBanner,
  ErrorBanner,
} from "@/components/BenchmarkDashboard/StatusBanners";
import { ModelsSidebar } from "@/components/BenchmarkDashboard/ModelsSidebar";
import { InsightsSidebar } from "@/components/BenchmarkDashboard/InsightsSidebar";
import { LatencyKeySidebar } from "@/components/BenchmarkDashboard/LatencyKeySidebar";
import { TabNavigation } from "@/components/BenchmarkDashboard/TabNavigation";
import { MetricsTab } from "@/components/BenchmarkDashboard/MetricsTab";
import { StatsTab } from "@/components/BenchmarkDashboard/StatsTab";
import { ResultsTab } from "@/components/BenchmarkDashboard/ResultsTab";
import { DashboardFooter } from "@/components/BenchmarkDashboard/DashboardFooter";

export default function BenchmarkDashboard() {
  const [activeTab, setActiveTab] = useState("metrics");
  const [runningModel, setRunningModel] = useState(null);
  const [runningLabel, setRunningLabel] = useState("");
  const [parallelMode, setParallelMode] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  // ── Client-side Ollama health check ──────────────────────────────────────
  const {
    health,
    healthChecking,
    checkHealth,
    ollamaOk,
    ollamaReady,
    missingModels,
  } = useOllamaHealth();

  // ── Server queries (DB only — no Ollama calls here) ───────────────────────
  const { data: results = [], isError: resultsError } = useQuery({
    queryKey: ["results"],
    queryFn: async () => {
      const res = await fetch("/api/results");
      if (!res.ok) throw new Error("Failed to fetch results");
      return res.json();
    },
    refetchInterval: runningModel ? 4000 : false,
  });

  const { data: prompts = [] } = useQuery({
    queryKey: ["prompts"],
    queryFn: async () => {
      const res = await fetch("/api/prompts");
      if (!res.ok) throw new Error("Failed to fetch prompts");
      return res.json();
    },
  });

  const {
    data: stats = { models: [], categories: [], latency_tiers: [] },
    isError: statsError,
  } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/results/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    refetchInterval: runningModel ? 8000 : false,
  });

  // ── Benchmark runner ─────────────────────────────────────────────────────
  const { runBenchmark } = useBenchmarkRunner();

  const handleRunAll = async (model) => {
    setRunningModel(model);
    try {
      await runBenchmark(
        model,
        prompts,
        parallelMode,
        setRunningLabel,
        ollamaOk,
        OLLAMA_URL,
      );
    } finally {
      setRunningModel(null);
      setRunningLabel("");
    }
  };

  // ── Derived chart data ───────────────────────────────────────────────────
  const chartData = useChartData(results);
  const radarData = useRadarData(results);
  const insights = useInsights(chartData);

  const totalRuns = results.length;
  const pendingEval = results.filter(
    (r) => r.score === null || r.score === undefined,
  ).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Toaster position="top-right" theme="dark" richColors />

      <DashboardHeader
        health={health}
        healthChecking={healthChecking}
        checkHealth={checkHealth}
        ollamaOk={ollamaOk}
        totalRuns={totalRuns}
        pendingEval={pendingEval}
      />

      {/* Banners */}
      <OllamaOfflineBanner health={health} />
      <MissingModelsBanner
        ollamaOk={ollamaOk}
        ollamaReady={ollamaReady}
        missingModels={missingModels}
      />
      <ReadyBanner
        ollamaOk={ollamaOk}
        ollamaReady={ollamaReady}
        totalRuns={totalRuns}
      />
      <ErrorBanner resultsError={resultsError} statsError={statsError} />

      <div className="p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ── Sidebar ───────────────────────────────────────────────────── */}
          <aside className="lg:col-span-1 space-y-5">
            <ModelsSidebar
              chartData={chartData}
              health={health}
              runningModel={runningModel}
              runningLabel={runningLabel}
              parallelMode={parallelMode}
              setParallelMode={setParallelMode}
              handleRunAll={handleRunAll}
              ollamaOk={ollamaOk}
            />
            <InsightsSidebar insights={insights} />
            <LatencyKeySidebar />
          </aside>

          {/* ── Main Content ──────────────────────────────────────────────── */}
          <main className="lg:col-span-3 space-y-6">
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === "metrics" && (
              <MetricsTab chartData={chartData} radarData={radarData} />
            )}

            {activeTab === "stats" && <StatsTab stats={stats} />}

            {activeTab === "results" && (
              <ResultsTab
                results={results}
                expandedRow={expandedRow}
                setExpandedRow={setExpandedRow}
              />
            )}
          </main>
        </div>
      </div>

      <DashboardFooter />

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
