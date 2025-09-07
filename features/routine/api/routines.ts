/**
 * ✅ 현재는 "목데이터"로 동작합니다.
 * ✅ EXPO_PUBLIC_API_MODE=real 로 설정하면 주석 해제 없이도 실서버로 전환됩니다.
 *
 * API 명세서 요약 (필요 엔드포인트)
 * - GET    /api/routines                          : 내 루틴 목록
 * - POST   /api/routines                          : 루틴 생성
 * - GET    /api/routines/:id                      : 루틴 상세 (옵션)
 * - PUT    /api/routines/:id                      : 루틴 수정(제목은 수정 불가)
 * - DELETE /api/routines/:id                      : 루틴 삭제
 * - GET    /api/routines/categories               : 카테고리 목록 (비인증)
 * - GET    /api/routines/adaptation-check         : 성장/감소 후보 (옵션)
 * - PATCH  /api/routines/:id/target?action=...    : 목표 조정(INCREASE/DECREASE/RESET) (옵션)
 */

import client from "@/shared/api/client"; // CHANGED: 실서버 전환 시 사용
import type { AddRoutineForm, Routine } from "../types";

/* ─────────────────────────────────────────────────────────────────────────────
  모드 스위치 (mock | real)
────────────────────────────────────────────────────────────────────────────── */
const API_MODE = (process.env.EXPO_PUBLIC_API_MODE ?? "mock").toLowerCase();
const USE_MOCK = API_MODE !== "real"; // CHANGED: 기본 mock

/* ─────────────────────────────────────────────────────────────────────────────
  섹션 1) 목데이터 (현재 활성)
────────────────────────────────────────────────────────────────────────────── */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 카테고리 표시명(프론트) 예시: "운동" | "학업" | "기타"
let DB: Routine[] = [
  {
    id: 1,
    title: "영단어 20개 암기",
    category: "학업",
    subtitleHint: "7일 연속 성공! 강도를 높여볼까요?",
    streakDays: 30,
    growthMode: true,
    goalType: "count",
    goalValue: 20,
    growthPeriodDays: 1,
    growthIncrement: 1,
    history: [
      { date: "2025-09-01", completed: true },
      { date: "2025-09-02", completed: true },
      { date: "2025-09-03", completed: true },
    ],
  },
  {
    id: 2,
    title: "근력운동 1시간",
    category: "운동",
    subtitleHint: "3일 연속 실패! 강도를 줄여볼까요?",
    streakDays: 0,
    growthMode: true,
    goalType: "time",
    goalValue: 60,
    growthPeriodDays: 3,
    growthIncrement: 5,
    history: [
      { date: "2025-09-02", completed: false },
      { date: "2025-09-03", completed: false },
      { date: "2025-09-04", completed: false },
    ],
  },

  {
    id: 3,
    title: "독서 30분 하기",
    category: "기타",
    subtitleHint: "",
    streakDays: 10,
    growthMode: false,
    history: [],
  },
];

/** 루틴 목록 조회 (mock) */
async function mock_fetchRoutines(): Promise<Routine[]> {
  await sleep(120);
  return JSON.parse(JSON.stringify(DB)); // 깊은 복사
}

/** 루틴 생성 (mock) */
async function mock_addRoutineApi(form: AddRoutineForm): Promise<Routine> {
  await sleep(100);
  const r: Routine = {
    id: Date.now(),
    title: form.title,
    category: form.category,
    growthMode: form.growthMode,
    goalType: form.growthMode ? form.goalType : undefined,
    goalValue: form.growthMode ? form.goalValue : undefined,
    growthPeriodDays: form.growthMode ? form.growthPeriodDays : undefined,
    growthIncrement: form.growthMode ? form.growthIncrement : undefined,
    subtitleHint: "",
    streakDays: 0,
    history: [],
  };
  DB = [r, ...DB];
  return JSON.parse(JSON.stringify(r));
}

/** 루틴 수정 (mock) — 제목은 수정하지 않는다고 가정(명세서와 맞춤) */
async function mock_updateRoutineApi(id: number, form: AddRoutineForm): Promise<Routine> {
  await sleep(120);
  DB = DB.map((r) =>
    r.id === id
      ? ({
        ...r,
        category: form.category ?? r.category,
        growthMode: !!form.growthMode,
        goalType: form.growthMode ? form.goalType : undefined,
        goalValue: form.growthMode ? form.goalValue : undefined,
        growthPeriodDays: form.growthMode ? form.growthPeriodDays : undefined,
        growthIncrement: form.growthMode ? form.growthIncrement : undefined,
      } as Routine)
      : r,
  );
  const found = DB.find((r) => r.id === id)!;
  return JSON.parse(JSON.stringify(found));
}

/** 루틴 삭제 (mock) */
async function mock_deleteRoutineApi(id: number): Promise<void> {
  await sleep(80);
  DB = DB.filter((r) => r.id !== id);
}

/** 완료 토글 (mock) — no-op */
async function mock_completeRoutineApi(_id: number): Promise<void> {
  await sleep(60);
}

/** (옵션) 카테고리 목록 (mock) */
async function mock_fetchRoutineCategories(): Promise<{ code: string; description: string }[]> {
  await sleep(60);
  return [
    { code: "HEALTH", description: "건강" },
    { code: "LEARNING", description: "학습" },
    { code: "MINDFULNESS", description: "마음 챙김" },
    { code: "DIET", description: "식습관" },
    { code: "HOBBY", description: "취미" },
  ];
}

/** (옵션) 적응형 후보 (mock) */
async function mock_fetchAdaptationCheck(): Promise<any> {
  await sleep(60);
  return {
    growthCandidates: {
      candidates: [
        {
          routineId: 1,
          routineTitle: "푸쉬업 챌린지",
          category: "HEALTH",
          currentTarget: 10,
          suggestedTarget: 12,
          completedCycleDays: 7,
          totalCycleDays: 7,
        },
      ],
      totalCount: 1,
      type: "GROWTH",
    },
    reductionCandidates: {
      candidates: [
        {
          routineId: 2,
          routineTitle: "독서하기",
          category: "LEARNING",
          currentTarget: 60,
          suggestedTarget: 50,
          failedDays: 5,
          totalCycleDays: 7,
        },
      ],
      totalCount: 1,
      type: "REDUCTION",
    },
  };
}

/** (옵션) 목표 조정 (mock) */
async function mock_patchRoutineTarget(
  _routineId: number,
  _action: "INCREASE" | "DECREASE" | "RESET",
): Promise<any> {
  await sleep(60);
  return {
    routineId: _routineId,
    routineTitle: "푸쉬업 챌린지",
    previousValue: 10,
    newValue: _action === "INCREASE" ? 12 : 10,
    action: _action,
  };
}

// === PATCH: Streak/History 유틸 (mock 전용) ===============================

/** YYYY-MM-DD 문자열 비교 (오름차순) */
const _cmpDate = (a: string, b: string) => a.localeCompare(b);

/** 해당 날짜 기록을 없으면 추가, 있으면 갱신(idempotent) */
function _upsertHistoryForDate(r: Routine, date: string, completed: boolean): Routine {
  const hist = Array.isArray(r.history) ? [...r.history] : [];
  const idx = hist.findIndex((h) => h.date && _cmpDate(h.date, date) === 0);

  const rec = { date, completed, done: completed, status: completed ? "DONE" : ("FAIL" as const) };
  if (idx >= 0) hist[idx] = rec;
  else hist.push(rec);

  hist.sort((a, b) => _cmpDate(a.date, b.date));
  return { ...r, history: hist };
}

/** history를 기준으로 현재 streakDays 계산 */
function _recomputeStreakDays(r: Routine): number {
  const hist = Array.isArray(r.history) ? r.history : [];
  if (hist.length === 0) return 0;

  const floor = r.lastAdjustAt ?? "";
  const sorted = [...hist].sort((a, b) => _cmpDate(a.date, b.date));
  let streak = 0;

  for (let i = sorted.length - 1; i >= 0; i--) {
    const h = sorted[i];
    if (floor && _cmpDate(h.date, floor) < 0) break;
    if (h.completed === true || h.done === true || h.status === "DONE" || h.status === "SUCCESS") {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * 회고 저장 결과를 루틴 DB에 반영 (mock 전용)
 * - DONE → completed=true, PARTIAL/NONE → completed=false
 * - idempotent: 같은 날짜 다시 저장 시 덮어씀
 */
export async function applyRetrospectResult(
  date: string,
  items: { id: number; status: "NONE" | "PARTIAL" | "DONE" }[],
): Promise<void> {
  if (!USE_MOCK) return; // CHANGED: real 모드에서는 서버가 상태를 보유
  await sleep(10);

  DB = DB.map((r) => {
    const picked = items.find((it) => it.id === r.id);
    if (!picked) return r;

    const completed = picked.status === "DONE";
    let next = _upsertHistoryForDate(r, date, completed);

    const newStreak = _recomputeStreakDays(next);
    next = { ...next, streakDays: newStreak };

    if (_cmpDate(date, new Date().toISOString().slice(0, 10)) === 0) {
      next.completedToday = completed;
    }
    return next;
  });
}
// === PATCH: Streak/History 유틸 끝 =================================

/* ─────────────────────────────────────────────────────────────────────────────
  섹션 2) 실서버 연동 (USE_MOCK=false 시 사용)
────────────────────────────────────────────────────────────────────────────── */

type CommonResponse<T> = { code: string; message: string; data: T };

type RoutineResp = {
  routineId: number;
  category: string; // ex) "HEALTH"
  title: string;
  description?: string | null;
  isGrowthMode: boolean;
  targetType?: "NUMBER" | "TIME" | "DATE";
  targetValue?: number | null;
  growthCycleDays?: number | null;
  targetIncrement?: number | null;
  currentCycleDays?: number;
  failureCycleDays?: number;
  createdAt?: string;
  updatedAt?: string;
};

// GET /api/routines, /api/routines/category
type RoutineListResp = {
  routines: RoutineResp[];
  totalCount: number;
};

// GET /api/routines/categories
type CategoryResp = { code: string; description: string };

// GET /api/routines/adaptation-check
type AdaptationCheckResp = {
  growthReadyRoutines: any[];
  reductionReadyRoutines: any[];
  totalGrowthReadyCount: number;
  totalReductionReadyCount: number;
  totalAdaptiveCount: number;
};

// PATCH /api/routines/{routineId}/target
type TargetAdjustAction = "INCREASE" | "DECREASE" | "RESET";
type TargetAdjustResp = {
  routineId: number;
  routineTitle: string;
  previousValue: number;
  newValue: number;
  action: TargetAdjustAction;
  success: boolean;
  message: string;
};

/* ─────────────────────────────────────────────────────────────────────────────
  매핑 유틸 (코드 ↔ 라벨)
────────────────────────────────────────────────────────────────────────────── */
const categoryLabelToCode = (label?: string): string | undefined => {
  const map: Record<string, string> = {
    운동: "HEALTH",
    학업: "LEARNING",
    "마음 챙김": "MINDFULNESS",
    식습관: "DIET",
    취미: "HOBBY",
    "사회적 관계": "SOCIAL",
    업무: "WORK",
    "재정 관리": "FINANCE",
    "환경 정리": "ENVIRONMENT",
    "습관 개선": "HABIT_IMPROVEMENT",
  };
  if (!label) return undefined;
  return map[label] ?? label;
};

const categoryCodeToLabel = (code?: string): string | undefined => {
  const map: Record<string, string> = {
    HEALTH: "운동",
    LEARNING: "학업",
    MINDFULNESS: "마음 챙김",
    DIET: "식습관",
    HOBBY: "취미",
    SOCIAL: "사회적 관계",
    WORK: "업무",
    FINANCE: "재정 관리",
    ENVIRONMENT: "환경 정리",
    HABIT_IMPROVEMENT: "습관 개선",
  };
  if (!code) return undefined;
  return map[code] ?? code;
};

// 요청 바디 변환 (AddRoutineForm → 서버)
const toCreateBody = (f: AddRoutineForm) => {
  const targetType = f.growthMode ? (f.goalType === "time" ? "TIME" : "NUMBER") : undefined;
  return {
    category: categoryLabelToCode(f.category),
    title: f.title,
    description: "",
    isGrowthMode: !!f.growthMode,
    targetType,
    targetValue: f.growthMode ? f.goalValue : undefined,
    growthCycleDays: f.growthMode ? f.growthPeriodDays : undefined,
    targetIncrement: f.growthMode ? f.growthIncrement : undefined,
  };
};

// 서버 → 프론트 모델 변환 (RoutineResp → Routine)

const toRoutine = (r: RoutineResp): Routine => ({
  id: r.routineId,
  title: r.title,
  category: categoryCodeToLabel(r.category) ?? r.category,
  subtitleHint: "",
  streakDays: r.currentCycleDays ?? 0,
  growthMode: !!r.isGrowthMode,
  goalType: r.isGrowthMode ? (r.targetType === "TIME" ? "time" : "count") : undefined,
  goalValue: r.isGrowthMode ? (r.targetValue ?? undefined) : undefined,
  growthPeriodDays: r.isGrowthMode ? (r.growthCycleDays ?? undefined) : undefined,
  growthIncrement: r.isGrowthMode ? (r.targetIncrement ?? undefined) : undefined,
  history: [],
  // (선택) Routine 타입에 아래 필드 추가해 활용 가능
  // currentCycleDays: r.currentCycleDays ?? 0,
  // failureCycleDays: r.failureCycleDays ?? 0,
});

/** [real] 목록 */
async function real_fetchRoutines(): Promise<Routine[]> {
  const res = await client.get<CommonResponse<RoutineListResp>>("/api/routines");
  return (res.data.data?.routines ?? []).map(toRoutine);
}

/** [real] 생성 */
async function real_addRoutineApi(form: AddRoutineForm): Promise<Routine> {
  const body = toCreateBody(form);
  const res = await client.post<CommonResponse<RoutineResp>>("/api/routines", body);
  return toRoutine(res.data.data);
}

/** [real] 수정 (title 수정 불가) */
async function real_updateRoutineApi(id: number, form: AddRoutineForm): Promise<Routine> {
  const body = toCreateBody(form);
  delete (body as any).title;
  const res = await client.put<CommonResponse<RoutineResp>>(`/api/routines/${id}`, body);
  return toRoutine(res.data.data);
}

/** [real] 삭제 */
async function real_deleteRoutineApi(id: number): Promise<void> {
  await client.delete<CommonResponse<null>>(`/api/routines/${id}`);
}

/** [real] 완료 토글 — 서버 스펙 확정 후 구현 */
async function real_completeRoutineApi(_id: number): Promise<void> {
  // 예) await client.post(`/api/routines/${_id}/complete`);
  return;
}

/** [real] 카테고리 */
async function real_fetchRoutineCategories(): Promise<{ code: string; description: string }[]> {
  const res = await client.get<CommonResponse<{ code: string; description: string }[]>>(
    "/api/routines/categories",
  );
  return res.data.data || [];
}

/** [real] 적응형 후보 */
async function real_fetchAdaptationCheck(): Promise<any> {
  const res = await client.get<CommonResponse<any>>("/api/routines/adaptation-check");
  return res.data.data;
}

/** [real] 목표 조정 */
async function real_patchRoutineTarget(
  routineId: number,
  action: "INCREASE" | "DECREASE" | "RESET",
) {
  const res = await client.patch<CommonResponse<any>>(
    `/api/routines/${routineId}/target`,
    {},
    { params: { action } },
  );
  // ✅ 수정: 'data' 변수가 선언되지 않아 'res.data.data'를 반환하도록 수정했습니다.
  return res.data.data;
}

/* ─────────────────────────────────────────────────────────────────────────────
  섹션 3) 공개 API — 모드에 따라 mock/real로 위임
────────────────────────────────────────────────────────────────────────────── */

export async function fetchRoutines(): Promise<Routine[]> {
  return USE_MOCK ? mock_fetchRoutines() : real_fetchRoutines(); // CHANGED
}

export async function addRoutineApi(form: AddRoutineForm): Promise<Routine> {
  return USE_MOCK ? mock_addRoutineApi(form) : real_addRoutineApi(form); // CHANGED
}

export async function updateRoutineApi(id: number, form: AddRoutineForm): Promise<Routine> {
  return USE_MOCK ? mock_updateRoutineApi(id, form) : real_updateRoutineApi(id, form); // CHANGED
}

export async function deleteRoutineApi(id: number): Promise<void> {
  return USE_MOCK ? mock_deleteRoutineApi(id) : real_deleteRoutineApi(id); // CHANGED
}

export async function completeRoutineApi(id: number): Promise<void> {
  return USE_MOCK ? mock_completeRoutineApi(id) : real_completeRoutineApi(id); // CHANGED
}

export async function fetchRoutineCategories(): Promise<{ code: string; description: string }[]> {
  return USE_MOCK ? mock_fetchRoutineCategories() : real_fetchRoutineCategories(); // CHANGED
}

export async function fetchAdaptationCheck(): Promise<any> {
  return USE_MOCK ? mock_fetchAdaptationCheck() : real_fetchAdaptationCheck(); // CHANGED
}

export async function patchRoutineTarget(
  routineId: number,
  action: "INCREASE" | "DECREASE" | "RESET",
) {
  return USE_MOCK
    ? mock_patchRoutineTarget(routineId, action)
    : real_patchRoutineTarget(routineId, action); // CHANGED
}
