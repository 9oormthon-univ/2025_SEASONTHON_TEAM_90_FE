import { useEffect, useMemo, useState } from "react";
import { getWeeklyDashboard } from "../api/dashboard.api";
import type { WeeklyDashboardResponse } from "../types";

/** 주간 대시보드 조회 훅 */
export function useWeeklyDashboard(weekStartISO: string) {
    const [data, setData] = useState<WeeklyDashboardResponse["data"] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        const ac = new AbortController();
        setLoading(true);
        setError(null);
        getWeeklyDashboard(weekStartISO, ac.signal)
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false));
        return () => ac.abort();
    }, [weekStartISO]);

    const summary = useMemo(
        () => ({
            periodLabel: data?.period.label ?? "",
            completionRate: data?.metrics.completion_rate ?? 0,
            recordRate: data?.metrics.record_rate ?? 0,
            totalRoutines: data?.routine_performance.length ?? 0,
        }),
        [data]
    );

    return { data, summary, loading, error };
}
