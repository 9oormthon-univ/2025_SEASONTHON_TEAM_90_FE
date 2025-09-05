import { useEffect, useState } from "react";
import { getWeeklyInsightV1 } from "../api/dashboard.api";
import type { WeeklyInsightResponse } from "../types";

/** 주간 AI 인사이트 조회 훅(v1 스웨거 반영) */
export function useWeeklyInsight(weekStartISO: string, memberId: number, force = false) {
  const [data, setData] = useState<WeeklyInsightResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    setData(null);

    getWeeklyInsightV1({ weekStart: weekStartISO, memberId, force }, ac.signal)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [weekStartISO, memberId, force]);

  return { data, loading, error };
}
