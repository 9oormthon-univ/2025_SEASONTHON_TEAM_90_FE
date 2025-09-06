import { useEffect, useMemo, useState } from "react";
import { getWeeklyDashboard } from "../api/dashboard.api";
import type { WeeklyDashboardData } from "../types";

export function useWeeklyDashboard(weekStartISO: string, memberId: number) {
  const [data, setData] = useState<WeeklyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    setData(null);
    getWeeklyDashboard({ weekStart: weekStartISO, memberId }, ac.signal)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [weekStartISO, memberId]);

  const summary = useMemo(() => ({
    periodLabel: data?.period.label ?? "",
    completionRate: data?.metrics.completion_rate ?? 0,
    recordRate: data?.metrics.record_rate ?? 0,
    totalRoutines: data?.metrics.total_routines ?? data?.routine_performance.length ?? 0,
  }), [data]);

  return { data, summary, loading, error };
}
