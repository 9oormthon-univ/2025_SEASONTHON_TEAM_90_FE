import { useEffect, useState } from "react";
import { getWeeklyInsight } from "../api/dashboard.api";
import type { WeeklyInsightData } from "../types";

export function useWeeklyInsight(weekStartISO: string, memberId: number, force = false) {
  const [data, setData] = useState<WeeklyInsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    setData(null);
    getWeeklyInsight({ weekStart: weekStartISO, memberId, force }, ac.signal)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [weekStartISO, memberId, force]);

  return { data, loading, error };
}
