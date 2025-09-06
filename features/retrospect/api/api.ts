// features/retrospect/api.ts
// 목적: 회고(작성/조회) 기능을 실제 서버 스펙(/api/daily-records)로 연동.

import { api } from "@/features/login/api/client";
import type { Retrospect, RoutineStatus, Mood } from "../types";

/* ─────────────────────────────────────────────────────────────────────────────
  서버 스펙 타입 (응답은 래핑 없음, 에러는 { code, message })
────────────────────────────────────────────────────────────────────────────── */
export type ApiErrorBody = { code: string; message: string }; // DAILY001, MEMBER001 ...

type PerformanceLevel = "FULL_SUCCESS" | "PARTIAL_SUCCESS" | "NOT_PERFORMED";

type DailyRecordResponse = {
  reflection: {
    content: string | null;
    // 서버 샘플에 "LOW"가 존재. 표준 감정셋이 무엇이든 문자열로 수용하고 UI에서 매핑.
    emotion: string | null; // e.g. "HAPPY" | "SOSO" | "SAD" | "MAD" | "LOW" | ...
    reflectionDate: string; // yyyy-MM-dd
  } | null;
  routineRecords: {
    routineId: number;
    routineTitle: string;
    category: string; // HEALTH | LEARNING | ...
    performanceLevel: PerformanceLevel;
    consecutiveDays: number;
    isGrowthMode: boolean;
    targetType?: "NUMBER" | "TIME" | "DATE";
    targetValue?: number;
    growthCycleDays?: number;
    targetIncrement?: number;
  }[];
  allRoutines: {
    routineId: number;
    category: string;
    title: string;
    description?: string | null;
    isGrowthMode: boolean;
    targetType?: "NUMBER" | "TIME" | "DATE";
    targetValue?: number;
    growthCycleDays?: number;
    targetIncrement?: number;
    currentCycleDays?: number;
    failureCycleDays?: number;
    createdAt?: string;
    updatedAt?: string;
  }[];
};

type SaveDailyRecordRequest = {
  reflection?: {
    content?: string | null;
    // 서버가 허용하는 문자열을 그대로 전달 (UI에서 선별)
    emotion?: string | null;
  };
  routineRecords?: {
    routineId: number;
    performanceLevel: PerformanceLevel;
  }[];
};

/* ─────────────────────────────────────────────────────────────────────────────
  변환 유틸
────────────────────────────────────────────────────────────────────────────── */

// RoutineStatus(프론트) → PerformanceLevel(서버)
const toPerformanceLevel = (s: RoutineStatus): PerformanceLevel => {
  switch (s) {
    case "DONE":
      return "FULL_SUCCESS";
    case "PARTIAL":
      return "PARTIAL_SUCCESS";
    default:
      return "NOT_PERFORMED";
  }
};

// PerformanceLevel(서버) → RoutineStatus(프론트)
const toRoutineStatus = (p: PerformanceLevel): RoutineStatus => {
  switch (p) {
    case "FULL_SUCCESS":
      return "DONE";
    case "PARTIAL_SUCCESS":
      return "PARTIAL";
    default:
      return "NONE";
  }
};

// 서버 → 프론트 Retrospect
const toRetrospect = (date: string, resp: DailyRecordResponse): Retrospect => {
  const recorded = resp.routineRecords.map((rec) => ({
    id: rec.routineId,
    title: rec.routineTitle,
    category: rec.category, // 필요하면 코드→라벨 매핑을 UI에서
    status: toRoutineStatus(rec.performanceLevel),
  }));

  // 기록에 없는 allRoutines를 NONE으로 보강
  const recordedIds = new Set(resp.routineRecords.map((r) => r.routineId));
  const supplement = resp.allRoutines
    .filter((r) => !recordedIds.has(r.routineId))
    .map((r) => ({
      id: r.routineId,
      title: r.title,
      category: r.category,
      status: "NONE" as RoutineStatus,
    }));

  const routines = [...recorded, ...supplement];

  // 서버 emotion은 문자열(any) → 프론트 Mood로 들어가는 값은 일단 그대로 허용(또는 매핑 테이블 적용)
  const emotion = resp.reflection?.emotion ?? null;
  const mood: Mood | null = (emotion as any) ?? null;

  return {
    date,
    routines,
    note: resp.reflection?.content ?? "",
    mood,
    submitted: Boolean(resp.reflection || resp.routineRecords.length > 0),
  };
};

/* ─────────────────────────────────────────────────────────────────────────────
  API 함수
────────────────────────────────────────────────────────────────────────────── */

// [GET] /api/daily-records/{date}
export async function fetchRetrospect(date: string): Promise<Retrospect> {
  const { data } = await api.get<DailyRecordResponse>(`/api/daily-records/${date}`);
  return toRetrospect(data?.reflection?.reflectionDate || date, data);
}

// [GET] /api/daily-records/today
export async function fetchTodayRetrospect(): Promise<Retrospect> {
  const { data } = await api.get<DailyRecordResponse>(`/api/daily-records/today`);
  const date = data?.reflection?.reflectionDate ?? new Date().toISOString().slice(0, 10);
  return toRetrospect(date, data);
}

/**
 * [POST] /api/daily-records/{date}
 * - note/mood, 루틴 상태 스냅샷을 한 번에 저장(덮어쓰기)
 * - 서버가 streak/주기 계산을 담당하므로 applyRetrospectResult 같은 로컬 후처리는 제거
 */
export async function saveRetrospect(
  date: string,
  note: string,
  mood: Mood | string | null,
  routinesSnapshot?: { id: number; status: RoutineStatus }[],
): Promise<void> {
  const body: SaveDailyRecordRequest = {};

  if (note || mood) {
    body.reflection = {
      content: note || "",
      // 서버가 허용하는 문자열 그대로 전달 (예: "LOW")
      emotion: (mood as any) ?? null,
    };
  }

  if (routinesSnapshot?.length) {
    body.routineRecords = routinesSnapshot.map((it) => ({
      routineId: it.id,
      performanceLevel: toPerformanceLevel(it.status),
    }));
  }

  await api.post(`/api/daily-records/${date}`, body);
}

/**
 * 개별 루틴 상태 즉시 저장용 엔드포인트는 스펙에 없음.
 * 화면에서는 로컬 상태만 바꾸고, 최종 저장 시 saveRetrospect로 통합 POST하는 패턴 권장.
 * 필요 시 서버와 PATCH 엔드포인트 협의 후 아래 함수 구현.
 */
export async function setRoutineStatus(_date: string, _routineId: number, _status: RoutineStatus) {
  // no-op (실서버에 개별 패치 스펙 없음)
  return;
}

// 제출 여부 확인: 별도 엔드포인트 없으므로 get으로 판단
export async function isSubmitted(date: string): Promise<boolean> {
  const r = await fetchRetrospect(date);
  return !!r.submitted;
}
