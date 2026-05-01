import { XCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

function CopyableCommand({ label, command }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-lg px-3 py-2">
        <code className="text-green-400 text-xs font-mono flex-1 select-all break-all">
          {command}
        </code>
        <button
          onClick={() => {
            navigator.clipboard.writeText(command);
            toast.success("Copied to clipboard!");
          }}
          className="text-gray-500 hover:text-white text-xs px-2 py-0.5 bg-white/5 rounded border border-white/10 shrink-0"
        >
          Copy
        </button>
      </div>
    </div>
  );
}

export function OllamaOfflineBanner({ health }) {
  if (!health || health.ok) return null;

  return (
    <div className="mx-6 md:mx-12 mt-4 bg-[#111] border border-red-500/30 rounded-2xl overflow-hidden">
      {/* Title */}
      <div className="px-5 py-4 bg-red-500/10 flex items-start gap-3 border-b border-red-500/20">
        <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
        <div>
          {health.isCors ? (
            <>
              <p className="font-semibold text-orange-400 text-sm">
                🔒 CORS is blocking Ollama — it IS running, but needs to allow
                this origin
              </p>
              <p className="text-orange-300/70 text-xs mt-0.5">
                By default Ollama only accepts requests from its own localhost
                page. You need to restart it with{" "}
                <code className="bg-white/10 px-1 rounded font-mono">
                  OLLAMA_ORIGINS=*
                </code>{" "}
                to allow browser access.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-red-400 text-sm">
                Cannot connect to Ollama
              </p>
              <p className="text-red-400/60 text-xs mt-0.5">
                {health.error}. If it is already running, the issue is likely
                CORS — use the commands below to fix it.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Fix */}
      <div className="px-5 py-4 space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-200 mb-3">
            ✅ Stop Ollama and restart it with one of these commands:
          </p>
          <div className="space-y-3">
            <CopyableCommand
              label="macOS / Linux (Terminal):"
              command="OLLAMA_ORIGINS=* ollama serve"
            />
            <CopyableCommand
              label="Windows (PowerShell):"
              command={'$env:OLLAMA_ORIGINS="*"; ollama serve'}
            />
            <CopyableCommand
              label="Windows (Command Prompt):"
              command={"set OLLAMA_ORIGINS=* && ollama serve"}
            />
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <span className="text-blue-400 text-xs shrink-0 mt-0.5">ℹ</span>
          <p className="text-xs text-blue-300/80">
            After restarting, click the{" "}
            <strong className="text-blue-300">status dot</strong> in the
            top-right header to recheck. It should turn{" "}
            <strong className="text-green-400">green</strong>.
          </p>
        </div>

        <p className="text-xs text-gray-600">
          Not installed yet?{" "}
          <a
            href="https://ollama.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 underline"
          >
            Download from ollama.com
          </a>{" "}
          — then run the command above instead of plain{" "}
          <code className="bg-white/10 px-1 rounded font-mono">
            ollama serve
          </code>
          .
        </p>
      </div>
    </div>
  );
}

export function MissingModelsBanner({ ollamaOk, ollamaReady, missingModels }) {
  if (!ollamaOk || ollamaReady || missingModels.length === 0) return null;

  return (
    <div className="mx-6 md:mx-12 mt-4 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3 text-sm">
      <AlertTriangle size={18} className="text-yellow-500 mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold text-yellow-400">
          Missing models: {missingModels.join(", ")}
        </p>
        <div className="flex flex-wrap gap-2 mt-1">
          {missingModels.map((m) => (
            <code
              key={m}
              className="bg-white/10 px-2 py-0.5 rounded font-mono text-xs text-gray-300"
            >
              ollama pull {m}
            </code>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReadyBanner({ ollamaOk, ollamaReady, totalRuns }) {
  if (!ollamaOk || !ollamaReady || totalRuns > 0) return null;

  return (
    <div className="mx-6 md:mx-12 mt-4 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-sm text-green-400">
      <CheckCircle2 size={16} className="shrink-0" />
      All models ready — click <strong className="mx-1">Run Benchmark</strong>{" "}
      on any model in the sidebar!
    </div>
  );
}

export function ErrorBanner({ resultsError, statsError }) {
  if (!resultsError && !statsError) return null;

  return (
    <div className="mx-6 md:mx-12 mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-sm text-red-400">
      <AlertTriangle size={16} className="shrink-0" />
      Failed to load{" "}
      {resultsError && statsError
        ? "results and stats"
        : resultsError
          ? "results"
          : "stats"}
      . Check the database connection.
    </div>
  );
}
