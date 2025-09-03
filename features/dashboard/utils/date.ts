import { parseISO, getWeekOfMonth, startOfWeek, format } from "date-fns";

/** 'n월 m째주' */
export function getWeekLabel(weekStartISO: string): string {
    const d = parseISO(weekStartISO);
    const month = d.getMonth() + 1;
    const w = getWeekOfMonth(d); // 1..5
    const ord = ["", "첫째주", "둘째주", "셋째주", "넷째주", "다섯째주"][w] ?? `${w}째주`;
    return `${month}월 ${ord}`;
}

/** 이번 주 여부: 현재 주의 시작일(월) ISO와 weekStartISO 문자열 비교 */
export function isCurrentWeek(weekStartISO: string, now = new Date()): boolean {
    const start = startOfWeek(now, { weekStartsOn: 1 }); // 이번 주 월요일
    const currentMondayISO = format(start, "yyyy-MM-dd");
    return currentMondayISO === weekStartISO;            // 문자열 비교(타임존 안전)
}

/** 보고서 라벨 생성 */
export function getReportLabel(weekStartISO: string, now = new Date()): string {
    return isCurrentWeek(weekStartISO, now)
        ? "이번 주 보고서"
        : `${getWeekLabel(weekStartISO)} 보고서`;
}
