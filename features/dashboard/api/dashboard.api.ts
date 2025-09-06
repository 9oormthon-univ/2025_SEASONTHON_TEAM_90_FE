import client from "@/shared/api/client";
import { addDays, formatISO, parseISO } from "date-fns";
import type {
  WeeklyDashboardData,
  WeeklyInsightApiResponse,
  WeeklyInsightData,
  WeeklyInsightEntity,
  Emotion,
} from "../types";
import { emotionFromScore, normalizeEmotionKey } from "../utils/emotion";

/* 서버 원본 응답(시연 스펙)에 맞춘 최소 타입) */
interface WeeklyStatsApiResponse {
  code: string;
  message: string;
  data: {
    period: { weekStart: string; currentWeek?: boolean };
    metrics: {
      totalRoutines?: number;
      overall?: { rate?: number };
      /* 혹시 백엔드가 이하 값들을 줄 수도 있음 */
      record_rate?: number;
      completion_rate?: number;
      partial_achievement_rate?: number;
      current_streak?: number;
      max_streak_this_period?: number;
    };
    emotionDistribution?: Record<string, number>;
    dailyCompletion?: any[];
    routinePerformance?: any[];
  };
}

/** 서버 → 프론트 표준 WeeklyDashboardData 변환 */
/* changed */
function transformWeeklyStats(data: WeeklyStatsApiResponse["data"]): WeeklyDashboardData {
  const start = data.period.weekStart;
  const endISO = formatISO(addDays(parseISO(start), 6), { representation: "date" });

  // 라벨(간단 판별)
  const label = data.period.currentWeek ? "이번 주" : "지난 주";

  // 메트릭 매핑
  const completion_rate =
    data.metrics.completion_rate ??
    data.metrics.overall?.rate ??
    0;

  const transformed: WeeklyDashboardData = {
    period: {
      start_date: start,
      end_date: endISO,
      label,
    },
    metrics: {
      record_rate: data.metrics.record_rate ?? 0,
      completion_rate,
      partial_achievement_rate: data.metrics.partial_achievement_rate ?? 0,
      current_streak: data.metrics.current_streak ?? 0,
      max_streak_this_period: data.metrics.max_streak_this_period ?? 0,
      total_routines: data.metrics.totalRoutines, /* changed: 보존 */
    },
    emotion_distribution: {},
    daily_completion: [],
    routine_performance: [],
  };

  // 감정 분포 매핑(HAPPY/SOSO 등 → Emotion)
  if (data.emotionDistribution) {
    for (const [k, v] of Object.entries(data.emotionDistribution)) {
      const e = normalizeEmotionKey(k);
      if (e) transformed.emotion_distribution[e] = v ?? 0;
    }
  }

  // 일별 매핑
  if (Array.isArray(data.dailyCompletion)) {
    transformed.daily_completion = data.dailyCompletion.map((d: any) => {
      const date: string = d.date ?? d.day ?? d.ds ?? "";
      const completion_rate: number = d.completion_rate ?? d.completionRate ?? d.completion ?? d.rate ?? 0;
      const partial_rate: number = d.partial_rate ?? d.partialRate ?? d.partial ?? 0;

      let primary_emotion: Emotion = "NORMAL";
      if (typeof d.primaryEmotionScore === "number") {
        primary_emotion = emotionFromScore(d.primaryEmotionScore);
      } else if (typeof d.primaryEmotion === "string") {
        primary_emotion = normalizeEmotionKey(d.primaryEmotion) ?? "NORMAL";
      }

      return { date, completion_rate, partial_rate, primary_emotion };
    });
  }

  // 루틴 성과가 오면 매핑(없으면 빈 배열 유지)
  if (Array.isArray(data.routinePerformance)) {
    transformed.routine_performance = data.routinePerformance.map((r: any, i: number) => ({
      routine_id: Number(r.routine_id ?? r.id ?? i + 1),
      routine_name: String(r.routine_name ?? r.name ?? `루틴 ${i + 1}`),
      completion_rate: Number(r.completion_rate ?? r.rate ?? 0),
      average_achievement: Number(r.average_achievement ?? r.avg ?? 0),
      target_value: Number(r.target_value ?? r.target ?? 0),
      streak: Number(r.streak ?? 0),
    }));
  }

  return transformed;
}

/** 6.1 주간 대시보드 (시연 스펙) */
/* changed: /api/dashboard/weekly/stats?memberId&weekStart */
export async function getWeeklyDashboard(params: {
  memberId: number;
  weekStart: string; // YYYY-MM-DD
}, signal?: AbortSignal) {
  const res = await client.get<WeeklyStatsApiResponse>(
    "/api/dashboard/weekly/stats",
    { params, signal }
  );
  return transformWeeklyStats(res.data.data);
}

/** WeeklyInsightEntity → WeeklyInsightData 파싱 */
/* changed */
export function parseWeeklyInsightEntity(entity: WeeklyInsightEntity): WeeklyInsightData {
  const raw = entity?.insightJson ?? entity;
  try {
    const j = typeof raw === "string" ? JSON.parse(raw) : raw ?? {};
    return {
      summary: j.summary ?? entity.summary ?? "",
      highlights: Array.isArray(j.highlights) ? j.highlights : entity.highlights ?? [],
      suggestions: Array.isArray(j.suggestions) ? j.suggestions : entity.suggestions ?? [],
      generated_at: j.generated_at ?? entity.updatedAt ?? entity.generated_at ?? new Date().toISOString(),
    };
  } catch {
    return {
      summary: entity.summary ?? "",
      highlights: entity.highlights ?? [],
      suggestions: entity.suggestions ?? [],
      generated_at: entity.updatedAt ?? entity.generated_at ?? new Date().toISOString(),
    };
  }
}

/** 6.2 특정 주차 AI 인사이트 */
/* changed: /api/dashboard/weekly/insight?weekStart&memberId&force */
export async function getWeeklyInsight(params: {
  weekStart: string;
  memberId: number;
  force?: boolean;
}, signal?: AbortSignal) {
  const res = await client.get<WeeklyInsightApiResponse>(
    "/api/dashboard/weekly/insight",
    { params: { ...params, force: params.force ?? false }, signal }
  );
  return parseWeeklyInsightEntity(res.data.data);
}

/** 6.3 지난주 AI 인사이트 */
/* changed: /api/dashboard/weekly/insight/last-week?memberId&force */
export async function getWeeklyInsightLastWeek(params: {
  memberId: number;
  force?: boolean;
}, signal?: AbortSignal) {
  const res = await client.get<WeeklyInsightApiResponse>(
    "/api/dashboard/weekly/insight/last-week",
    { params: { ...params, force: params.force ?? false }, signal }
  );
  return parseWeeklyInsightEntity(res.data.data);
}
