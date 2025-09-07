import { api } from "@/features/login/api/client";
import type { Retrospect, RoutineStatus, Mood } from "../types";
import { applyRetrospectResult } from "../../routine/api/routines";
// CHANGED: 실서버 전환용 공용 axios 클라이언트
import client from "@/shared/api/client";

const clone = <T>(obj: T): T => structuredClone(obj);

/* ─────────────────────────────────────────────────────────────
   0) 런타임 모드 스위치
   - 기본(mock): EXPO_PUBLIC_API_MODE 미설정 또는 'mock'
   - 실서버(real): EXPO_PUBLIC_API_MODE=real
────────────────────────────────────────────────────────────── */
const API_MODE = (process.env.EXPO_PUBLIC_API_MODE ?? "mock").toLowerCase();
const USE_MOCK = API_MODE !== "real"; // default: true
// CHANGED: 실서버 엔드포인트 베이스(필요 시 이 상수만 바꾸면 됨)
const DAILY_RECORDS_BASE = "/api/daily-records";

/* ─────────────────────────────────────────────────────────────
   1) 공통 유틸 & 변환
────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────────────────
  서버 스펙 타입 (응답은 래핑 없음, 에러는 { code, message })
────────────────────────────────────────────────────────────────────────────── */
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
  const merged = source.map(
    (s) => byId.get(s.id) ?? { ...s, status: "NONE" as RoutineStatus }
  );
  return { ...existed, routines: merged };
}

/**
 * ✅ 제출 전 회고의 루틴 스냅샷 강제 재병합(리프레시)
 * - 루틴 목록이 바뀌었을 때, 이미 입력 중인 회고에 최신 스냅샷을 덧씌움
 */
async function mock_refreshRetrospectRoutines(
  date: string,
  getDailyRoutines?: (date: string) => RoutineSnapshot[]
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
  getDailyRoutines?: (date: string) => RoutineSnapshot[]
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
 * ✅ 회고 저장(메모 + 감정 + 제출 플래그) + streak/history 반영
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
   - 명세서(주석) 기준: {base}/api/daily-records
   - 필요 시 DAILY_RECORDS_BASE만 교체하면 됨.
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

// [실서버] 날짜별 회고 조회
async function real_fetchRetrospect(date: string): Promise<Retrospect> {
  const res = await client.get<CommonResponse<DailyRecordResponse>>(
    `${DAILY_RECORDS_BASE}/${date}`
  );
  return toRetrospectFromWire(date, res.data.data);
}

// [실서버] 오늘 회고 조회(필요 시 사용)
// async function real_fetchTodayRetrospect(): Promise<Retrospect> {
//   const res = await client.get<CommonResponse<DailyRecordResponse>>(
//     `${DAILY_RECORDS_BASE}/today`
//   );
//   const date = res.data.data?.reflection?.reflectionDate ?? new Date().toISOString().slice(0, 10);
//   return toRetrospectFromWire(date, res.data.data);
// }

// [실서버] 루틴 상태 변경(권장: 클라에서 임시 반영 후 save에서 일괄 POST)
async function real_setRoutineStatus(
  _date: string,
  _routineId: number,
  _status: RoutineStatus
) {
  // 서버가 부분 저장(PATCH)을 제공하면 여기서 호출.
  // 현재는 saveRetrospect에서 통합 POST하는 패턴 유지.
  return;
}

// [실서버] 회고/기록 저장(덮어쓰기)
async function real_saveRetrospect(
  date: string,
  note: string,
  mood: Mood | null,
  routinesSnapshot?: { id: number; status: RoutineStatus }[]
) {
  const body = {
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
    }))
  }

  await client.post<CommonResponse<DailyRecordResponse>>(
    `${DAILY_RECORDS_BASE}/${date}`,
    body
  );
}

// [실서버] 제출 여부(전용 API 없으면 fetch로 판단)
async function real_isSubmitted(date: string) {
  const r = await real_fetchRetrospect(date);
  return !!r.submitted;
}

/* ─────────────────────────────────────────────────────────────
   4) 공개 API (모드에 따라 mock/real로 위임)
   - 외부 사용 코드는 아래 함수들만 import하면 됨.
────────────────────────────────────────────────────────────── */

/**
 * 제출 전 회고의 루틴 스냅샷 강제 재병합(리프레시)
 * - 실서버 모드에선 서버 소스가 단일 진실원이라 보통 no-op
 */
export async function refreshRetrospectRoutines(
  date: string,
  getDailyRoutines?: (date: string) => RoutineSnapshot[]
) {
  if (USE_MOCK) return mock_refreshRetrospectRoutines(date, getDailyRoutines);
  // real: 서버가 루틴 목록을 제공하므로 별도 리프레시 불필요
  return;
}

/** 날짜별 회고 조회 */
export async function fetchRetrospect(
  date: string,
  getDailyRoutines?: (date: string) => RoutineSnapshot[]
): Promise<Retrospect> {
  if (USE_MOCK) return mock_fetchRetrospect(date, getDailyRoutines);
  return real_fetchRetrospect(date);
}

/** 루틴 상태 변경(임시 저장) */
export async function setRoutineStatus(date: string, routineId: number, status: RoutineStatus) {
  if (USE_MOCK) return mock_setRoutineStatus(date, routineId, status);
  return real_setRoutineStatus(date, routineId, status);
}

/**
 * 회고 저장(메모 + 감정 + 제출 플래그)
 * - mock: 내부 DB 저장 후 streak 계산 반영
 * - real: 서버 POST
 */
export async function saveRetrospect(
  date: string,
  note: string,
  mood: Mood | null,
  routinesSnapshot?: { id: number; status: RoutineStatus }[] // real 모드에서 활용
) {
  if (USE_MOCK) return mock_saveRetrospect(date, note, mood);
  return real_saveRetrospect(date, note, mood, routinesSnapshot);
}

/** 오늘 날짜가 제출되었는지 여부 */
export async function isSubmitted(date: string) {
  if (USE_MOCK) return mock_isSubmitted(date);
  return real_isSubmitted(date);
}

/** 테스트/리셋용 */
export function __resetRetrospect(date?: string) {
  if (USE_MOCK) return mock__resetRetrospect(date);
  // real: 서버 상태를 임의로 지울 수 없음. 필요 시 별도 admin API 고려.
  return;
}


function sleep(arg0: number) {
  // ✅ 수정: 임시 구현 추가 (실제로는 비동기 처리를 위해 Promise 사용)
  return new Promise(resolve => setTimeout(resolve, arg0));
}
/* ─────────────────────────────────────────────────────────────
   5) 전환 가이드
   - 현재 기본은 MOCK.
   - 실서버 전환 시:
     1) .env에 EXPO_PUBLIC_API_MODE=real 추가
     2) 필요하면 DAILY_RECORDS_BASE로 엔드포인트 경로 조정
     3) 공용 axios(@/shared/api/client) 토큰 주입 확인(이미 적용)
     await api.post(`/api/daily-records/${date}`, body);
────────────────────────────────────────────────────────────── */