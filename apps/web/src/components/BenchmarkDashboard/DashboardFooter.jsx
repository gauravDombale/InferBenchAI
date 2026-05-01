import { OLLAMA_URL } from "@/utils/ollamaClient";

export function DashboardFooter() {
  return (
    <footer className="mt-8 border-t border-white/5 px-6 md:px-12 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
      <div className="flex items-center gap-6 text-xs text-gray-600 flex-wrap">
        <span>🔒 Fully Offline · No External APIs</span>
        <span>🎲 seed=42 · temp=0 · top_p=1</span>
        <span>📍 Ollama at {OLLAMA_URL}</span>
      </div>
      <span className="text-gray-700 text-xs uppercase tracking-widest">
        InferBenchAI
      </span>
    </footer>
  );
}
