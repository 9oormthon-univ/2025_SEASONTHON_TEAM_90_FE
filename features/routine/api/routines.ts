// features/routine/api/routines.ts
/**
 * ✅ 현재는 "목데이터"로 동작합니다.
 * ✅ 아래 각 함수 안에 명세서에 맞춘 "실서버 연동 코드"를 주석으로 함께 제공하니,
 *    나중에 주석 해제 + api 클라이언트 연결만 하면 바로 실제 API로 전환할 수 있습니다.
 *
 * API 명세서 요약 (필요 엔드포인트)
 * - GET    /api/routines                          : 내 루틴 목록
 * - POST   /api/routines                          : 루틴 생성
 * - GET    /api/routines/:id                      : 루틴 상세 (옵션)
 * - PUT    /api/routines/:id                      : 루틴 수정(제목은 수정 불가)
 * - DELETE /api/routines/:id                      : 루틴 삭제
 * - GET    /api/routines/categories               : 카테고리 목록 (비인증)
 * - GET    /api/routines/adaptation-check         : 성장/감소 후보 (옵션)
 * - PATCH  /api/routines/:id/target?action=...    : 목표 조정(INCREASE/DECREASE/RESET) (옵션)
 */

import type { AddRoutineForm, Routine } from "../types";

/* ─────────────────────────────────────────────────────────────────────────────
  섹션 1) 목데이터 (현재 활성)
────────────────────────────────────────────────────────────────────────────── */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 카테고리 표시명(프론트) 예시: "운동" | "학업" | "기타"
// 명세서의 서버 카테고리 코드는 "HEALTH" | "LEARNING" | ...
// 지금은 목이므로 프론트 표시명을 그대로 사용합니다.
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
    goalValue: 60, // 분 단위
    growthPeriodDays: 3,
    growthIncrement: 5, // 분 단위 증가
    history: [
      { date: "2025-09-02", completed: false },
      { date: "2025-09-03", completed: false },
      { date: "2025-09-04", completed: false }, // 오늘까지 3일 연속 실패
    ],
  },

  {
    id: 3,
    title: "독서 30분 하기",
    category: "기타",
    subtitleHint: "",
    streakDays: 10,
    growthMode: false, // 성장 모드 아님
    history: [],
  },
];

/** 루틴 목록 조회 (목) */
export async function fetchRoutines(): Promise<Routine[]> {
  await sleep(120);
  // 깊은 복사로 안전하게 반환
  return JSON.parse(JSON.stringify(DB));
}

/** 루틴 생성 (목) */
export async function addRoutineApi(form: AddRoutineForm): Promise<Routine> {
  await sleep(100);
  const r: Routine = {
    id: Date.now(), // 임시 ID
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

/** 루틴 수정 (목) — 제목은 수정하지 않는다고 가정(명세서와 맞춤) */
export async function updateRoutineApi(id: number, form: AddRoutineForm): Promise<Routine> {
  await sleep(120);
  DB = DB.map((r) =>
    r.id === id
      ? ({
          ...r,
          // 명세서상 title 수정은 불가 → title은 유지하고 나머지만 반영
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

/** 루틴 삭제 (목) */
export async function deleteRoutineApi(id: number): Promise<void> {
  await sleep(80);
  DB = DB.filter((r) => r.id !== id);
}

/** 완료 토글 (목) — 서버 명세에 별도 완료 API가 없으므로 목에서는 no-op */
export async function completeRoutineApi(_id: number): Promise<void> {
  await sleep(60);
}

/** (옵션) 카테고리 목록 (목) */
export async function fetchRoutineCategories(): Promise<{ code: string; description: string }[]> {
  await sleep(60);
  return [
    { code: "HEALTH", description: "건강" },
    { code: "LEARNING", description: "학습" },
    { code: "MINDFULNESS", description: "마음 챙김" },
    { code: "DIET", description: "식습관" },
    { code: "HOBBY", description: "취미" },
  ];
}

/** (옵션) 적응형 후보 (목) */
export async function fetchAdaptationCheck(): Promise<any> {
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

/** (옵션) 목표 조정 (목) */
export async function patchRoutineTarget(
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

// === PATCH: Streak/History 유틸 추가 시작 ===============================

/** YYYY-MM-DD 문자열 비교 (오름차순) */
const _cmpDate = (a: string, b: string) => a.localeCompare(b);

/** 해당 날짜 기록을 없으면 추가, 있으면 갱신(idempotent) */
function _upsertHistoryForDate(r: Routine, date: string, completed: boolean): Routine {
  const hist = Array.isArray(r.history) ? [...r.history] : [];
  const idx = hist.findIndex((h) => h.date && _cmpDate(h.date, date) === 0);

  const rec = { date, completed, done: completed, status: completed ? "DONE" : ("FAIL" as const) };
  if (idx >= 0) hist[idx] = rec;
  else hist.push(rec);

  // 정렬 유지(선택)
  hist.sort((a, b) => _cmpDate(a.date, b.date));

  return { ...r, history: hist };
}

/**
 * history를 기준으로 현재 streakDays 계산
 * - 규칙: 가장 최근 날짜부터 거꾸로 보며 연속된 "completed=true" 개수
 * - lastAdjustAt(선택)이 있으면 그 날짜 이후만 계산 (그 이전은 무시)
 */
function _recomputeStreakDays(r: Routine): number {
  const hist = Array.isArray(r.history) ? r.history : [];
  if (hist.length === 0) return 0;

  const floor = r.lastAdjustAt ?? ""; // 없으면 전체 허용
  // 최신순으로 훑기
  const sorted = [...hist].sort((a, b) => _cmpDate(a.date, b.date));
  let streak = 0;

  // 최근 날짜부터 역순 카운트
  for (let i = sorted.length - 1; i >= 0; i--) {
    const h = sorted[i];
    if (floor && _cmpDate(h.date, floor) < 0) break; // 바닥 이전이면 끝
    if (h.completed === true || h.done === true || h.status === "DONE" || h.status === "SUCCESS") {
      streak += 1;
    } else {
      // 실패가 나오면 연속성 끊김
      break;
    }
  }
  return streak;
}

/**
 * 회고 저장 결과를 루틴 DB에 반영
 * - items: 해당 날짜에 사용자가 선택한 상태 스냅샷
 * - DONE → completed=true, PARTIAL/NONE → completed=false
 * - idempotent: 같은 날짜 다시 저장 시 기존 기록을 덮어씀
 */
export async function applyRetrospectResult(
  date: string,
  items: { id: number; status: "NONE" | "PARTIAL" | "DONE" }[],
): Promise<void> {
  await sleep(10);

  // DB는 이 파일 상단의 모킹 배열(DB)을 사용
  DB = DB.map((r) => {
    const picked = items.find((it) => it.id === r.id);
    if (!picked) return r;

    const completed = picked.status === "DONE";
    // 1) 해당 날짜 history upsert
    let next = _upsertHistoryForDate(r, date, completed);

    // 2) streak 재계산 규칙
    //   - DONE이면 연속 +1이 되도록 전체 히스토리를 다시 계산
    //   - PARTIAL/NONE이면 해당 날짜 false로 기록되어 일관되게 0으로 초기화됨
    const newStreak = _recomputeStreakDays(next);
    next = { ...next, streakDays: newStreak };

    // 3) 오늘 완료 표시 보조 플래그(옵션)
    if (_cmpDate(date, new Date().toISOString().slice(0, 10)) === 0) {
      next.completedToday = completed;
    }

    return next;
  });
}

// === PATCH: Streak/History 유틸 추가 끝 =================================

/* ─────────────────────────────────────────────────────────────────────────────
  섹션 2) 실서버 연동 코드 (주석) — 명세서에 맞춰 즉시 사용 가능
  ⚠️ 실제 사용 시: 아래 주석을 해제하고, 상단 목 코드를 제거/분기하세요.
  - axios 클라이언트 예시: utils/api/client.ts 의 api 인스턴스(Authorization 자동 주입)
  - 카테고리 코드 ↔ 프론트 표시명 매핑 유틸 포함
────────────────────────────────────────────────────────────────────────────── */
/*
import { api } from "@/utils/api/client";

// 공통 래퍼 타입
type CommonResponse<T> = { code: string; message: string; data: T };

// 서버 응답 모델
type RoutineResp = {
  routineId: number;
  category: string;           // ex) "HEALTH"
  title: string;
  description?: string | null;
  isGrowthMode: boolean;
  targetType?: "NUMBER" | "TIME" | "DATE";
  targetValue?: number | null;
  growthCycleDays?: number | null;
  targetIncrement?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

type RoutineListResp = {
  routines: RoutineResp[];
  totalCount: number;
};

// 카테고리 매핑 (표시명 ↔ 코드)
const categoryLabelToCode = (label?: string): string | undefined => {
  const map: Record<string, string> = {
    "운동": "HEALTH",
    "학업": "LEARNING",
    "마음 챙김": "MINDFULNESS",
    "식습관": "DIET",
    "취미": "HOBBY",
    "사회적 관계": "SOCIAL",
    "업무": "WORK",
    "재정 관리": "FINANCE",
    "환경 정리": "ENVIRONMENT",
    "습관 개선": "HABIT_IMPROVEMENT",
  };
  if (!label) return undefined;
  return map[label] ?? label; // 이미 코드면 그대로
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
    description: "", // 필요 시 폼 확장
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
  streakDays: 0,
  growthMode: !!r.isGrowthMode,
  goalType: r.isGrowthMode ? (r.targetType === "TIME" ? "time" : "count") : undefined,
  goalValue: r.isGrowthMode ? (r.targetValue ?? undefined) : undefined,
  growthPeriodDays: r.isGrowthMode ? (r.growthCycleDays ?? undefined) : undefined,
  growthIncrement: r.isGrowthMode ? (r.targetIncrement ?? undefined) : undefined,
  history: [],
});

// [실서버] 목록
export async function fetchRoutines(): Promise<Routine[]> {
  const res = await api.get<CommonResponse<RoutineListResp>>("/api/routines");
  return (res.data.data?.routines ?? []).map(toRoutine);
}

// [실서버] 생성
export async function addRoutineApi(form: AddRoutineForm): Promise<Routine> {
  const body = toCreateBody(form);
  const res = await api.post<CommonResponse<RoutineResp>>("/api/routines", body);
  return toRoutine(res.data.data);
}

// [실서버] 수정 (title 수정 불가 규칙 반영)
export async function updateRoutineApi(id: number, form: AddRoutineForm): Promise<Routine> {
  const body = toCreateBody(form);
  delete (body as any).title; // 명세서: 제목 수정 불가
  const res = await api.put<CommonResponse<RoutineResp>>(`/api/routines/${id}`, body);
  return toRoutine(res.data.data);
}

// [실서버] 삭제
export async function deleteRoutineApi(id: number): Promise<void> {
  await api.delete<CommonResponse<null>>(`/api/routines/${id}`);
}

// [실서버] 완료 토글 — 명세서에 별도 엔드포인트가 없으므로 서버 스펙 확정 후 구현
export async function completeRoutineApi(_id: number): Promise<void> {
  // 예) await api.post(`/api/routines/${_id}/complete`);
  return;
}

// [실서버] 카테고리
export async function fetchRoutineCategories(): Promise<{ code: string; description: string }[]> {
  const res = await api.get<CommonResponse<{ code: string; description: string }[]>>(
    "/api/routines/categories",
  );
  return res.data.data || [];
}

// [실서버] 적응형 후보
export async function fetchAdaptationCheck(): Promise<any> {
  const res = await api.get<CommonResponse<any>>("/api/routines/adaptation-check");
  return res.data.data;
}

// [실서버] 목표 조정
export async function patchRoutineTarget(
  routineId: number,
  action: "INCREASE" | "DECREASE" | "RESET",
) {
  const res = await api.patch<CommonResponse<any>>(
    `/api/routines/${routineId}/target`,
    {},
    { params: { action } },
  );
  return res.data.data;
}
*/

/* ─────────────────────────────────────────────────────────────────────────────
  섹션 3) 전환 가이드
  - 지금은 목(섹션1)만 사용 중.
  - 실서버로 바꿀 때는:
    1) 위 섹션2의 주석을 해제하고
    2) 섹션1의 목 코드를 제거(혹은 환경변수로 분기)
    3) utils/api/client.ts 에서 Authorization 헤더가 자동으로 붙도록 설정
────────────────────────────────────────────────────────────────────────────── */
