import type { WeeklyDashboardData } from "../types";

/**
 * 루틴 배열을 { 루틴명: 스트릭 } 형태의 Map으로 변환합니다.
 * @param routines weeklyDashboard API의 routine_performance 데이터
 */
export function buildStreakMap(
    routines?: WeeklyDashboardData["routine_performance"],
): Map<string, number> {
    const map = new Map<string, number>();
    routines?.forEach((r) => map.set(r.routine_name, r.streak));
    return map;
}

/**
 *  연속 일 수 출력
 * @param highlight 분석할 텍스트 (e.g., "꾸준히 물을 마셨어요.")
 * @param streakMap buildStreakMap으로 생성된 맵
 * @returns 일치하는 루틴이 있으면 "X일 연속!" 배지, 없으면 null
 */
export function getStreakBadgeForHighlight(
    highlight: string,
    streakMap: Map<string, number>,
): string | null {
    for (const [name, streak] of streakMap.entries()) {
        if (streak > 0 && highlight.includes(name)) return `${streak}일 연속!`;
    }
    return null;
}