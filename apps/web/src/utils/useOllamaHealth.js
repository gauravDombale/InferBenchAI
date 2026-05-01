import { useState, useEffect, useCallback } from "react";
import { ollamaHealth } from "@/utils/ollamaClient";

export function useOllamaHealth() {
  const [health, setHealth] = useState(null);
  const [healthChecking, setHealthChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    setHealthChecking(true);
    const result = await ollamaHealth();
    setHealth(result);
    setHealthChecking(false);
    return result;
  }, []);

  useEffect(() => {
    checkHealth();
    const id = setInterval(checkHealth, 30_000);
    return () => clearInterval(id);
  }, [checkHealth]);

  return {
    health,
    healthChecking,
    checkHealth,
    ollamaOk: health?.ok === true,
    ollamaReady: health?.ready === true,
    missingModels: health?.missing || [],
  };
}
