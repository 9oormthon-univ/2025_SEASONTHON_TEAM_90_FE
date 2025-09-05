import { useEffect, useState } from "react";
import { getWeeklyInsightV1 } from "../api/dashboard.api";
import type { WeeklyInsightData } from "../types";

/**
 * 주간 AI 인사이트 조회 훅
 * @param weekStartISO 'YYYY-MM-DD' 형식의 주 시작일
 * @param memberId 사용자 ID
 * @param force 강제로 새로운 분석을 요청할지 여부
 */
export function useWeeklyInsight(
  weekStartISO: string,
  memberId: number | null,
  force = false,
) {
  const [data, setData] = useState<WeeklyInsightData | null>(null);
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
    setData(null);

    getWeeklyInsightV1({ weekStart: weekStartISO, memberId, force }, ac.signal)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [weekStartISO, memberId, force]);

  return { data, loading, error };
}
