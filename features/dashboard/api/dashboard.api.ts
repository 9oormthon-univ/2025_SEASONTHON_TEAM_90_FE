import client from "@/shared/api/client";
import type {
    WeeklyDashboardResponse,
    WeeklyInsightResponse,
} from "../types";

/** 6.1 주간 대시보드 (기존 경로 유지: 서버 스펙 변경 시 여기도 교체) */
export async function getWeeklyDashboard(weekStartISO: string, signal?: AbortSignal) {
    const res = await client.get<WeeklyDashboardResponse>(
        "/dashboard/weekly",
        { params: { week_start: weekStartISO }, signal }
    );
    return res.data.data;
}

/** 6.2 AI 인사이트 (스웨거 경로/파라미터 적용) */
export async function getWeeklyInsightV1(params: {
    weekStart: string;      // YYYY-MM-DD (월요일)
    memberId: number;       // required
    force?: boolean;        // default false
}, signal?: AbortSignal) {
    const res = await client.get<any>("/v1/dashboard/weekly/insight", {
        params: { weekStart: params.weekStart, memberId: params.memberId, force: params.force ?? false },
        signal,
    });

    // 서버 엔티티 내부의 insightJson 문자열 파싱
    const raw = res.data;
    let parsed: WeeklyInsightResponse["data"] = {
        summary: "",
        highlights: [],
        suggestions: [],
        generated_at: new Date().toISOString(),
    };

    try {
        const j = typeof raw?.insightJson === "string" ? JSON.parse(raw.insightJson) : raw?.insightJson;
        if (j) {
            parsed = {
                summary: j.summary ?? "",
                highlights: Array.isArray(j.highlights) ? j.highlights : [],
                suggestions: Array.isArray(j.suggestions) ? j.suggestions : [],
                generated_at: j.generated_at ?? raw?.updatedAt ?? new Date().toISOString(),
            };
        }
    } catch {
        // 파싱 실패 시 기본값 유지
    }

    const wrapped: WeeklyInsightResponse = {
        code: "S200",
        message: "AI 인사이트 조회 성공",
        data: parsed,
    };
    return wrapped.data;
}

/** 옵션: 최근 지난 주 인사이트 */
export async function getLastWeekInsightV1(params: { memberId: number; force?: boolean }, signal?: AbortSignal) {
    const res = await client.get<any>("/v1/dashboard/weekly/insight/last-week", {
        params: { memberId: params.memberId, force: params.force ?? false },
        signal,
    });
    return res.data;
}
