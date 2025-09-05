import { useEffect, useMemo, useState } from "react";
import { getWeeklyDashboard } from "../api/dashboard.api";
import type { WeeklyDashboardData } from "../types";

/**
 * 주간 대시보드 조회 훅
 * @param weekStartISO 'YYYY-MM-DD' 형식의 주 시작일
 * @param memberId 사용자 ID
 */
export function useWeeklyDashboard(weekStartISO: string, memberId: number) {
  const [data, setData] = useState<WeeklyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!memberId || isNaN(memberId)) {
      setLoading(false);
      setData(null);
      return;
    }

    const ac = new AbortController();
    setLoading(true);
    setError(null);

    getWeeklyDashboard(weekStartISO, memberId, ac.signal)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [weekStartISO, memberId]);

  const summary = useMemo(
    () => ({
      periodLabel: data?.period.label ?? "",
      completionRate: data?.metrics.completion_rate ?? 0,
      recordRate: data?.metrics.record_rate ?? 0,
      totalRoutines: data?.routine_performance.length ?? 0,
    }),
    [data],
  );

  return { data, summary, loading, error };
}