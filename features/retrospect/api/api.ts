import type { Retrospect, RoutineStatus, Mood } from "../types";
import { applyRetrospectResult } from "../../routine/api/routines";
// 실서버 전환용 공용 axios 클라이언트
import client from "@/shared/api/client";

/* ─────────────────────────────────────────────────────────────
   0) 런타임 모드 스위치
   - 기본(mock): EXPO_PUBLIC_API_MODE 미설정 또는 'mock'
   - 실서버(real): EXPO_PUBLIC_API_MODE=real
────────────────────────────────────────────────────────────── */
const API_MODE = (process.env.EXPO_PUBLIC_API_MODE ?? "mock").toLowerCase();
const USE_MOCK = API_MODE !== "real"; // default: true
const DAILY_RECORDS_BASE = "/api/daily-records";

/* ─────────────────────────────────────────────────────────────
   1) 공통 유틸 & 변환
────────────────────────────────────────────────────────────── */

export type ApiErrorBody = { code: string; message: string }; // DAILY001, MEMBER001 ...

type PerformanceLevel = "FULL_SUCCESS" | "PARTIAL_SUCCESS" | "NOT_PERFORMED";
type EmotionWire = "HAPPY" | "SOSO" | "SAD" | "MAD" | null;

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

const toEmotion = (mood: Mood | null): EmotionWire => mood ?? null;
const toMood = (emotion?: EmotionWire): Mood | null => (emotion ?? null) as Mood | null;

/* ─────────────────────────────────────────────────────────────
   2) MOCK 구현 (메모리 DB)
────────────────────────────────────────────────────────────── */

// 날짜별 회고 저장소
const DB = new Map<string, Retrospect>();

// 루틴 등록 파트와 실제 연동되면 교체될 임시 스냅샷
const fallbackRoutines = [
  { id: 1, title: "물 2L 마시기", category: "운동" as const },
  { id: 2, title: "영단어 20개 외우기", category: "학업" as const },
  { id: 3, title: "독서 30분 하기", category: "문화" as const },
];

type RoutineSnapshot = { id: number; title: string; category: string };

function mergeRoutines(existed: Retrospect, source: RoutineSnapshot[]): Retrospect {
  const byId = new Map(existed.routines.map((r) => [r.id, r]));
  const merged = source.map((s) => byId.get(s.id) ?? { ...s, status: "NONE" as RoutineStatus });
  return { ...existed, routines: merged };
}

/**
 * 제출 전 회고의 루틴 스냅샷 강제 재병합(리프레시)
 */
async function mock_refreshRetrospectRoutines(
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

async function mock_fetchRetrospect(
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

async function mock_setRoutineStatus(date: string, routineId: number, status: RoutineStatus) {
  await sleep(40);
  const r = DB.get(date);
  if (!r) return;
  r.routines = r.routines.map((it) => (it.id === routineId ? { ...it, status } : it));
}

/**
 * 회고 저장(메모 + 감정 + 제출 플래그) + streak/history 반영
 */
async function mock_saveRetrospect(date: string, note: string, mood: Mood | null) {
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

async function mock_isSubmitted(date: string) {
  await sleep(20);
  return DB.get(date)?.submitted ?? false;
}

function mock__resetRetrospect(date?: string) {
  if (date) DB.delete(date);
  else DB.clear();
}

/* ─────────────────────────────────────────────────────────────
   3) 실서버 연동 구현
────────────────────────────────────────────────────────────── */

type CommonResponse<T> = { code: string; message: string; data: T };

type DailyRecordResponse = {
  reflection: {
    content: string | null;
    emotion: EmotionWire;
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

// 서버 → 프론트 모델 변환
const toRetrospectFromWire = (date: string, resp: DailyRecordResponse): Retrospect => {
  const routinesFromRecords = resp.routineRecords.map((rec) => ({
    id: rec.routineId,
    title: rec.routineTitle,
    category: rec.category,
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

  const routines = [...routinesFromRecords, ...supplement];

  // 서버 emotion은 문자열(any) → 프론트 Mood로 들어가는 값은 일단 그대로 허용
  const emotion = resp.reflection?.emotion ?? null;
  const mood: Mood | null = toMood(emotion);

  return {
    date,
    routines,
    note: resp.reflection?.content ?? "",
    mood,
    submitted: Boolean(resp.reflection || resp.routineRecords.length > 0),
  };
};

// [실서버] 날짜별 회고 조회
async function real_fetchRetrospect(date: string): Promise<Retrospect> {
  const res = await client.get<CommonResponse<DailyRecordResponse>>(
    `${DAILY_RECORDS_BASE}/${date}`,
  );
  return toRetrospectFromWire(date, res.data.data);
}

// [실서버] 루틴 상태 변경(부분 저장 미지원 → no-op)
async function real_setRoutineStatus(_date: string, _routineId: number, _status: RoutineStatus) {
  return;
}

// [실서버] 회고/기록 저장(덮어쓰기)
async function real_saveRetrospect(
  date: string,
  note: string,
  mood: Mood | null,
  routinesSnapshot?: { id: number; status: RoutineStatus }[],
) {
  const body: {
    reflection?: { content?: string | null; emotion?: string | null };
    routineRecords?: { routineId: number; performanceLevel: PerformanceLevel }[];
  } = {
    reflection:
      note || mood
        ? {
          content: note || "",
          emotion: toEmotion(mood),
        }
        : undefined,
    routineRecords: (routinesSnapshot ?? []).map((it) => ({
      routineId: it.id,
      performanceLevel: toPerformanceLevel(it.status),
    })),
  };

  await client.post<CommonResponse<DailyRecordResponse>>(`${DAILY_RECORDS_BASE}/${date}`, body);
}

// [실서버] 제출 여부(전용 API 없으면 fetch로 판단)
async function real_isSubmitted(date: string) {
  const r = await real_fetchRetrospect(date);
  return !!r.submitted;
}

/* ─────────────────────────────────────────────────────────────
   4) 공개 API (모드에 따라 mock/real로 위임)
────────────────────────────────────────────────────────────── */

export async function refreshRetrospectRoutines(
  date: string,
  getDailyRoutines?: (date: string) => RoutineSnapshot[],
) {
  if (USE_MOCK) return mock_refreshRetrospectRoutines(date, getDailyRoutines);
  return;
}

export async function fetchRetrospect(
  date: string,
  getDailyRoutines?: (date: string) => RoutineSnapshot[],
): Promise<Retrospect> {
  if (USE_MOCK) return mock_fetchRetrospect(date, getDailyRoutines);
  return real_fetchRetrospect(date);
}

export async function setRoutineStatus(date: string, routineId: number, status: RoutineStatus) {
  if (USE_MOCK) return mock_setRoutineStatus(date, routineId, status);
  return real_setRoutineStatus(date, routineId, status);
}

export async function saveRetrospect(
  date: string,
  note: string,
  mood: Mood | null,
  routinesSnapshot?: { id: number; status: RoutineStatus }[],
) {
  if (USE_MOCK) return mock_saveRetrospect(date, note, mood);
  return real_saveRetrospect(date, note, mood, routinesSnapshot);
}

export async function isSubmitted(date: string) {
  if (USE_MOCK) return mock_isSubmitted(date);
  return real_isSubmitted(date);
}

export function __resetRetrospect(date?: string) {
  if (USE_MOCK) return mock__resetRetrospect(date);
  return;
}

/* ─────────────────────────────────────────────────────────────
   유틸
────────────────────────────────────────────────────────────── */
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}
