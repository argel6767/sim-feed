import { useState, useCallback } from "react";

type Status = "idle" | "loading" | "error";

interface UseStatusReturn {
  status: Status;
  setLoading: () => void;
  setError: () => void;
  setIdle: () => void;
  isLoading: boolean;
  isError: boolean;
  isIdle: boolean;
}

export function useStatus(): UseStatusReturn {
  const [status, setStatus] = useState<Status>("idle");

  const setLoading = useCallback(() => setStatus("loading"), []);
  const setError = useCallback(() => setStatus("error"), []);
  const setIdle = useCallback(() => setStatus("idle"), []);

  return {
    status,
    setLoading,
    setError,
    setIdle,
    isLoading: status === "loading",
    isError: status === "error",
    isIdle: status === "idle",
  };
}
