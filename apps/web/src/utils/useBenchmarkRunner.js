import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ollamaGenerate, WARMUP_PROMPT } from "@/utils/ollamaClient";
import { evaluateResponse } from "@/utils/evaluator";
import { toast } from "sonner";

export function useBenchmarkRunner() {
  const queryClient = useQueryClient();

  const storeResult = useCallback(async (payload) => {
    const res = await fetch("/api/benchmark/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Store failed: HTTP ${res.status}`);
    }
    return res.json();
  }, []);

  const storeScore = useCallback(async (resultId, score, reason) => {
    const res = await fetch("/api/benchmark/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resultId, score, reason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Score failed: HTTP ${res.status}`);
    }
    return res.json();
  }, []);

  const runOnePrompt = useCallback(
    async (model, prompt) => {
      // 1. Generate (browser → localhost:11434)
      const gen = await ollamaGenerate(model, prompt.prompt);

      // 2. Store raw result in DB
      const stored = await storeResult({
        model,
        promptId: prompt.id,
        latencyMs: gen.latencyMs,
        tokensSec: gen.tokensSec,
        responseText: gen.text,
        ramMb: 0,
      });
      queryClient.invalidateQueries({ queryKey: ["results"] });

      // 3. Evaluate (rule-based first, then LLM-as-judge if needed)
      const judgeModel = model === "qwen2.5:0.5b" ? "llama3.2:1b" : "qwen2.5:0.5b";
      const evalResult = await evaluateResponse(
        gen.text,
        prompt.expected,
        prompt.category,
        judgeModel,
      );

      // 4. Save score to DB
      await storeScore(stored.id, evalResult.score, evalResult.reason);
      queryClient.invalidateQueries({ queryKey: ["results"] });
    },
    [storeResult, storeScore, queryClient],
  );

  const runBenchmark = useCallback(
    async (
      model,
      prompts,
      parallelMode,
      setRunningLabel,
      ollamaOk,
      OLLAMA_URL,
    ) => {
      if (!ollamaOk) {
        toast.error(`Cannot reach Ollama at ${OLLAMA_URL}. Run: ollama serve`);
        return;
      }
      if (prompts.length === 0) {
        toast.error("No prompts found in the database.");
        return;
      }

      try {
        // Step 1: Warmup — 2 dummy queries, NOT recorded
        setRunningLabel("Warming up...");
        toast.info(`🔥 Warming up ${model}...`, { duration: 2500 });
        for (let i = 0; i < 2; i++) {
          try {
            await ollamaGenerate(model, WARMUP_PROMPT);
          } catch (e) {
            console.warn(`Warmup ${i + 1} failed:`, e.message);
          }
        }
        toast.success(`${model} is warm! Running ${prompts.length} prompts...`);

        // Step 2: Run all prompts
        if (parallelMode) {
          setRunningLabel(
            `Running all ${prompts.length} prompts in parallel...`,
          );
          await Promise.allSettled(prompts.map((p) => runOnePrompt(model, p)));
        } else {
          for (let i = 0; i < prompts.length; i++) {
            setRunningLabel(
              `Prompt ${i + 1}/${prompts.length} — ${prompts[i].category}`,
            );
            await runOnePrompt(model, prompts[i]);
          }
        }

        toast.success(`✅ Benchmark complete for ${model}!`);
        queryClient.invalidateQueries({ queryKey: ["stats"] });
      } catch (err) {
        toast.error(`Benchmark error: ${err.message}`);
        throw err;
      }
    },
    [runOnePrompt, queryClient],
  );

  return { runBenchmark };
}
