// features/retrospect/api.ts
// 목적: 회고(작성/조회) 기능을 서버 없이 "메모리 DB"로 먼저 개발.

import type { Retrospect, RoutineStatus, Mood } from "../types";
import { applyRetrospectResult } from "../../routine/api/routines";

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const toPerformanceLevel = (s: RoutineStatus) => {
  switch (s) {
    case "DONE":
      return "FULL_SUCCESS";
    case "PARTIAL":
      return "PARTIAL_SUCCESS";
    default:
      return "NOT_PERFORMED";
  }
};

const toRoutineStatus = (p: "FULL_SUCCESS" | "PARTIAL_SUCCESS" | "NOT_PERFORMED") => {
  switch (p) {
    case "FULL_SUCCESS":
      return "DONE";
    case "PARTIAL_SUCCESS":
      return "PARTIAL";
    default:
      return "NONE";
  }
};

const toEmotion = (mood: Mood | null) => mood ?? null;
const toMood = (emotion?: "HAPPY" | "SOSO" | "SAD" | "MAD" | null) =>
  (emotion ?? null) as Mood | null;

// 날짜별 회고 저장소
const DB = new Map<string, Retrospect>();

// 루틴 등록 파트와 실제 연동되면 교체될 임시 스냅샷
const fallbackRoutines = [
  { id: 1, title: "물 2L 마시기", category: "운동" as const },
  { id: 2, title: "영단어 20개 외우기", category: "학업" as const },
  { id: 3, title: "독서 30분 하기", category: "문화" as const },
];

type RoutineSnapshot = { id: number; title: string; category: any };

function mergeRoutines(existed: Retrospect, source: RoutineSnapshot[]): Retrospect {
  const byId = new Map(existed.routines.map((r) => [r.id, r]));
  const merged = source.map((s) => byId.get(s.id) ?? { ...s, status: "NONE" as RoutineStatus });
  return { ...existed, routines: merged };
}

/** ✅ 제출 전 회고의 루틴 스냅샷 강제 재병합(리프레시) */
export async function refreshRetrospectRoutines(
  date: string,
  getDailyRoutines?: (date: string) => RoutineSnapshot[],
) {
  await sleep(20);
  const existed = DB.get(date);
  if (!existed || existed.submitted) return;

  const source = getDailyRoutines?.(date) ?? fallbackRoutines;
  const next = mergeRoutines(existed, source);
  DB.set(date, next);
}

export async function fetchRetrospect(
  date: string,
  getDailyRoutines?: (date: string) => RoutineSnapshot[],
): Promise<Retrospect> {
  await sleep(100);

  const existed = DB.get(date);
  if (existed) {
    if (!existed.submitted) {
      const source = getDailyRoutines?.(date) ?? fallbackRoutines;
      const next = mergeRoutines(existed, source);
      DB.set(date, next);
      return clone(next);
    }
    return clone(existed);
  }

  const source = getDailyRoutines?.(date) ?? fallbackRoutines;
  const fresh: Retrospect = {
    date,
    routines: source.map((v) => ({ ...v, status: "NONE" as RoutineStatus })),
    note: "",
    mood: null,
    submitted: false,
  };
  DB.set(date, fresh);
  return clone(fresh);
}

export async function setRoutineStatus(date: string, routineId: number, status: RoutineStatus) {
  await sleep(40);
  const r = DB.get(date);
  if (!r) return;
  r.routines = r.routines.map((it) => (it.id === routineId ? { ...it, status } : it));
}

/** ✅ 회고 저장(메모 + 감정 + 제출 플래그) + streak/history 반영 */
export async function saveRetrospect(date: string, note: string, mood: Mood | null) {
  await sleep(120);
  const r = DB.get(date);
  if (!r) return;

  r.note = note;
  r.mood = mood;
  r.submitted = true;
  DB.set(date, r);

  const snapshot = r.routines.map((it) => ({ id: it.id, status: it.status }));
  await applyRetrospectResult(date, snapshot);
}

export async function isSubmitted(date: string) {
  await sleep(20);
  return DB.get(date)?.submitted ?? false;
}

export function __resetRetrospect(date?: string) {
  if (date) DB.delete(date);
  else DB.clear();
}

/* ─────────────────────────────────────────────────────────────
  2) ✅ 실제 서버 연동 코드 (주석)
     명세서: {base}/api/daily-records
     - POST /api/daily-records/{date}
     - GET  /api/daily-records/{date}
     - GET  /api/daily-records/today (편의)
────────────────────────────────────────────────────────────── */
/*
import { api } from "@/utils/api/client";

type CommonResponse<T> = { code: string; message: string; data: T };

type DailyRecordResponse = {
  reflection: {
    content: string | null;
    emotion: "HAPPY" | "SOSO" | "SAD" | "MAD" | null;
    reflectionDate: string; // yyyy-MM-dd
  } | null;
  routineRecords: {
    routineId: number;
    routineTitle: string;
    category: string; // HEALTH | LEARNING | ...
    performanceLevel: "FULL_SUCCESS" | "PARTIAL_SUCCESS" | "NOT_PERFORMED";
    consecutiveDays: number;
    isGrowthMode: boolean;
    targetType?: "COUNT" | "TIME" | "DATE";
    targetValue?: number;
    growthCycleDays?: number;
    targetIncrement?: number;
  }[];
  allRoutines: {
    routineId: number;
    category: string;
    title: string;
    isGrowthMode: boolean;
    targetType?: "COUNT" | "TIME" | "DATE";
    targetValue?: number;
    growthCycleDays?: number;
    targetIncrement?: number;
    createdAt?: string;
  }[];
};

// 서버 → 프론트 모델 변환
const toRetrospect = (date: string, resp: DailyRecordResponse): Retrospect => {
  const routinesFromRecords = resp.routineRecords.map((rec) => ({
    id: rec.routineId,
    title: rec.routineTitle,
    category: rec.category, // 필요 시 코드→표시명 매핑
    status: toRoutineStatus(rec.performanceLevel),
  }));

  // allRoutines에 있으나 기록이 없는 항목을 NONE으로 보강(선택)
  const recordedIds = new Set(resp.routineRecords.map((r) => r.routineId));
  const supplement = resp.allRoutines
    .filter((r) => !recordedIds.has(r.routineId))
    .map((r) => ({
      id: r.routineId,
      title: r.title,
      category: r.category,
      status: "NONE" as RoutineStatus,
    }));

  const routines = [...routinesFromRecords, ...supplement];

  return {
    date,
    routines,
    note: resp.reflection?.content ?? "",
    mood: toMood(resp.reflection?.emotion ?? null),
    submitted: Boolean(resp.reflection || resp.routineRecords.length > 0),
  };
};

// [실서버] 날짜별 회고 조회
export async function fetchRetrospect(date: string): Promise<Retrospect> {
  const res = await api.get<CommonResponse<DailyRecordResponse>>(
    `/api/daily-records/${date}`,
  );
  return toRetrospect(date, res.data.data);
}

// [실서버] 오늘 회고 조회(편의) — 필요 시 사용
export async function fetchTodayRetrospect(): Promise<Retrospect> {
  const res = await api.get<CommonResponse<DailyRecordResponse>>(
    `/api/daily-records/today`,
  );
  // 서버가 오늘 날짜를 reflectionDate로 내려줄 수도 있으니 우선 응답에서 추론
  const date =
    res.data.data?.reflection?.reflectionDate ??
    new Date().toISOString().slice(0, 10);
  return toRetrospect(date, res.data.data);
}

// [실서버] 루틴 상태 변경(부분 저장: 서버 스펙은 전체 POST만 제공하므로,
//  - 보통 클라이언트에 임시 상태를 들고 있다가 saveRetrospect에서 한번에 POST.
//  - 개별 패치가 필요하면 백엔드와 PATCH 엔드포인트 협의가 필요)
export async function setRoutineStatus(
  date: string,
  routineId: number,
  status: RoutineStatus,
) {
  // 임시 로컬 상태에 반영 후, saveRetrospect에서 POST로 통합 저장하는 패턴 권장.
  // 혹시 별도 엔드포인트가 생기면 여기에 연결:
  // await api.patch(`/api/daily-records/${date}/routines/${routineId}`, {
  //   performanceLevel: toPerformanceLevel(status),
  // });
  return;
}

// [실서버] 회고/기록 저장 (덮어쓰기)
export async function saveRetrospect(
  date: string,
  note: string,
  mood: Mood | null,
  // 선택: 현재 화면의 루틴 목록을 받아 서버 스키마로 변환하여 함께 저장
  routinesSnapshot?: { id: number; status: RoutineStatus }[],
) {
  const body = {
    reflection: (note || mood) ? {
      content: note || "",
      emotion: toEmotion(mood), // "HAPPY" | "SOSO" | "SAD" | "MAD" | null
    } : undefined,
    routineRecords: (routinesSnapshot ?? []).map((it) => ({
      routineId: it.id,
      performanceLevel: toPerformanceLevel(it.status),
    })),
  };

  await api.post<CommonResponse<DailyRecordResponse>>(
    `/api/daily-records/${date}`,
    body,
  );
}

// [실서버] 제출 여부
export async function isSubmitted(date: string) {
  // 별도 엔드포인트가 없다면 fetchRetrospect(date)로 판단:
  const r = await fetchRetrospect(date);
  return !!r.submitted;
}
*/

/* ─────────────────────────────────────────────────────────────
  3) 전환 가이드
  - 지금은 MOCK만 사용 중.
  - 실서버 전환 시:
    1) 위 "실서버 연동 코드 (주석)" 블록을 주석 해제
    2) 본 MOCK 구현을 제거하거나 환경변수(API_MODE=mock|real)로 분기
    3) axios 클라이언트(utils/api/client.ts)에서 토큰 주입 확인
────────────────────────────────────────────────────────────── */
