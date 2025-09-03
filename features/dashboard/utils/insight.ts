import type { WeeklyDashboardResponse } from "../types";

/** 루틴명 → streak 매핑 생성 */
export function buildStreakMap(
    routines?: WeeklyDashboardResponse["data"]["routine_performance"]
): Map<string, number> {
    const map = new Map<string, number>();
    routines?.forEach((r) => map.set(r.routine_name, r.streak));
    return map;
}

/**
 * 하이라이트 문구에 루틴명이 포함되면 `${streak}일 연속!` 배지 생성
 * 포함 루틴이 없거나 streak=0이면 null
 */
export function getStreakBadgeForHighlight(
    highlight: string,
    streakMap: Map<string, number>
): string | null {
    for (const [name, streak] of streakMap.entries()) {
        if (streak > 0 && highlight.includes(name)) return `${streak}일 연속!`;
    }
    return null;
}
