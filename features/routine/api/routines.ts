import { api } from "@/features/login/api/client";
import type { AddRoutineForm, Routine } from "../types";

/* ─────────────────────────────────────────────────────────────────────────────
  서버 응답 타입 (스펙 그대로)
────────────────────────────────────────────────────────────────────────────── */
export type ApiErrorBody = { code: string; message: string }; // 예) ROUTINE003, MEMBER001

// /api/routines/{id}, POST/PUT /api/routines 등의 단일 루틴 응답
type RoutineResp = {
  routineId: number;
  category: string; // "HEALTH" ...
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

/* ─────────────────────────────────────────────────────────────────────────────
  서버 → 프론트 모델 변환
  (프론트 Routine 타입에 currentCycleDays/failureCycleDays optional 확장 추천)
────────────────────────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────────────────────
  API 함수 (최신 스펙: 래핑 없음, 에러는 {code,message})
────────────────────────────────────────────────────────────────────────────── */

// [GET] /api/routines  → { routines, totalCount }
export async function fetchRoutines(): Promise<Routine[]> {
  const { data } = await api.get<RoutineListResp>("/api/routines");
  return (data.routines ?? []).map(toRoutine);
}

// [GET] /api/routines/category?category=HEALTH
export async function fetchRoutinesByCategory(categoryCode: string): Promise<Routine[]> {
  const { data } = await api.get<RoutineListResp>("/api/routines/category", {
    params: { category: categoryCode },
  });
  return (data.routines ?? []).map(toRoutine);
}

// [GET] /api/routines/{id}  → RoutineResp
export async function fetchRoutineById(id: number): Promise<Routine> {
  const { data } = await api.get<RoutineResp>(`/api/routines/${id}`);
  return toRoutine(data);
}

// [POST] /api/routines  → RoutineResp
export async function addRoutineApi(form: AddRoutineForm): Promise<Routine> {
  const body = {
    category: categoryLabelToCode(form.category),
    title: form.title,
    description: "", // 폼에 설명 없이 사용 중이라면 공백
    isGrowthMode: !!form.growthMode,
    targetType: form.growthMode ? (form.goalType === "time" ? "TIME" : "NUMBER") : undefined,
    targetValue: form.growthMode ? form.goalValue : undefined,
    growthCycleDays: form.growthMode ? form.growthPeriodDays : undefined,
    targetIncrement: form.growthMode ? form.growthIncrement : undefined,
  };
  const { data } = await api.post<RoutineResp>("/api/routines", body);
  return toRoutine(data);
}

// [PUT] /api/routines/{id}  → RoutineResp  (title 수정 불가)
export async function updateRoutineApi(id: number, form: AddRoutineForm): Promise<Routine> {
  const body: any = {
    category: categoryLabelToCode(form.category),
    description: "",
    isGrowthMode: !!form.growthMode,
    targetType: form.growthMode ? (form.goalType === "time" ? "TIME" : "NUMBER") : undefined,
    targetValue: form.growthMode ? form.goalValue : undefined,
    growthCycleDays: form.growthMode ? form.growthPeriodDays : undefined,
    targetIncrement: form.growthMode ? form.growthIncrement : undefined,
  };
  const { data } = await api.put<RoutineResp>(`/api/routines/${id}`, body);
  return toRoutine(data);
}

// [DELETE] /api/routines/{id} → 204 or 본문 없음
export async function deleteRoutineApi(id: number): Promise<void> {
  await api.delete(`/api/routines/${id}`);
}

// [GET] /api/routines/categories → CategoryResp[]
export async function fetchRoutineCategories(): Promise<CategoryResp[]> {
  const { data } = await api.get<CategoryResp[]>("/api/routines/categories");
  return data ?? [];
}

// [GET] /api/routines/adaptation-check → AdaptationCheckResp
export async function fetchAdaptationCheck(): Promise<AdaptationCheckResp> {
  const { data } = await api.get<AdaptationCheckResp>("/api/routines/adaptation-check");
  return data;
}

// [PATCH] /api/routines/{routineId}/target?action=INCREASE|DECREASE|RESET → TargetAdjustResp
export async function patchRoutineTarget(
  routineId: number,
  action: TargetAdjustAction,
): Promise<TargetAdjustResp> {
  const { data } = await api.patch<TargetAdjustResp>(
    `/api/routines/${routineId}/target`,
    {},
    { params: { action } },
  );
  return data;
}
