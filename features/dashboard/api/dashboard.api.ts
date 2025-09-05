// features/dashboard/api/dashboard.api.ts

import client from "@/shared/api/client";
import type {
  WeeklyDashboardData,
  WeeklyInsightApiResponse,
  WeeklyInsightData,
  WeeklyInsightEntity,
} from "../types";

/**
 * 6.1 주간 대시보드
 */
export async function getWeeklyDashboard(
  weekStartISO: string,
  memberId: number,
  signal?: AbortSignal
) {
  // 경로 및 파라미터명(weekStart), memberId 파라미터 추가
  const res = await client.get<{ data: WeeklyDashboardData }>( // CommonApiResponse 구조를 직접 명시
    "/api/dashboard/weekly/stats",
    {
      params: { weekStart: weekStartISO, memberId },
      signal,
    }
  );

  //CommonApiResponse 구조에 따라 .data.data에서 데이터 추출
  return res.data.data;
}

/**
 * 6.2 AI 인사이트
 */
export async function getWeeklyInsightV1(
  params: { weekStart: string; memberId: number; force?: boolean },
  signal?: AbortSignal
): Promise<WeeklyInsightData> {
  // API 경로 변경 및 제네릭 타입 명시
  const res = await client.get<WeeklyInsightApiResponse>(
    "/api/dashboard/weekly/insight",
    {
      params: {
        weekStart: params.weekStart,
        memberId: params.memberId,
        force: params.force ?? false,
      },
      signal,
    }
  );

  // CommonApiResponse 구조에 따라 .data.data에서 원본 데이터 추출
  const raw = res.data.data;

  let parsed: WeeklyInsightData = {
    summary: "",
    highlights: [],
    suggestions: [],
    generated_at: new Date().toISOString(),
  };

  try {
    const j =
      typeof raw?.insightJson === "string"
        ? JSON.parse(raw.insightJson)
        : raw?.insightJson;
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

  return parsed;
}

/**
 * 6.3 지난 주 인사이트
 */
export async function getLastWeekInsightV1(
  params: { memberId: number; force?: boolean },
  signal?: AbortSignal
) {
  // API 경로 변경
  const res = await client.get<WeeklyInsightApiResponse>(
    "/api/dashboard/weekly/insight/last-week",
    {
      params: { memberId: params.memberId, force: params.force ?? false },
      signal,
    }
  );

  // CommonApiResponse 구조 고려 (파싱 로직은 필요에 따라 추가)
  return res.data.data;
}