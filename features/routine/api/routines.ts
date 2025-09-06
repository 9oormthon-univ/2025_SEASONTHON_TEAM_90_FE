/**
 * ✅ 실서버 연동본 (v3.1 명세 반영)
 *
 * 사용 엔드포인트
 * - GET    /api/routines
 * - POST   /api/routines
 * - GET    /api/routines/{id}
 * - PUT    /api/routines/{id}            // 제목(title) 수정 불가
 * - DELETE /api/routines/{id}
 * - GET    /api/routines/categories      // 비인증
 * - GET    /api/routines/adaptation-check
 * - PATCH  /api/routines/{id}/target?action=INCREASE|DECREASE|RESET
 */

import { api } from "@/features/login/api/client";
import type { AddRoutineForm, Routine } from "../types";

/* ─────────────────────────────────────────────────────────────────────────────
  섹션) 서버 모델 & 매퍼
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
  currentCycleDays?: number; // v3.1
  failureCycleDays?: number; // v3.1
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

// 서버 → 프론트 모델 변환 (RoutineResp → Routine)
// NOTE: 네 프로젝트의 Routine 타입 필드에 맞춰 최대한 매핑.
// v3.1의 currentCycleDays/failureCycleDays는 별도 화면에서 쓸 수 있어
// 필요하면 Routine 타입에 선택 필드로 추가해도 OK.
const toRoutine = (r: RoutineResp): Routine => ({
  id: r.routineId,
  title: r.title,
  category: categoryCodeToLabel(r.category) ?? r.category,
  subtitleHint: "", // 서버엔 별도 힌트 없음 → 화면 로직으로 표현
  streakDays: r.currentCycleDays ?? 0, // 연속 성공일수 비슷한 개념으로 매핑
  growthMode: !!r.isGrowthMode,
  goalType: r.isGrowthMode
    ? r.targetType === "TIME"
      ? "time"
      : "count" // NUMBER/DATE → count 우선, 필요 시 타입 확장
    : undefined,
  goalValue: r.isGrowthMode ? (r.targetValue ?? undefined) : undefined,
  growthPeriodDays: r.isGrowthMode ? (r.growthCycleDays ?? undefined) : undefined,
  growthIncrement: r.isGrowthMode ? (r.targetIncrement ?? undefined) : undefined,
  history: [], // v3.1 응답에 히스토리 없음 → 화면에서 별도 관리
  // 필요하면 아래처럼 보조 필드로 붙여도 됨(타입 확장 필요)
  // currentCycleDays: r.currentCycleDays ?? 0,
  // failureCycleDays: r.failureCycleDays ?? 0,
});

/* ─────────────────────────────────────────────────────────────────────────────
  섹션) 실서버 API
────────────────────────────────────────────────────────────────────────────── */

/** 목록 조회 */
export async function fetchRoutines(): Promise<Routine[]> {
  const res = await api.get<CommonResponse<RoutineListResp>>("/api/routines");
  const list = res.data.data?.routines ?? [];
  return list.map(toRoutine);
}

/** 생성 */
export async function addRoutineApi(form: AddRoutineForm): Promise<Routine> {
  const body = {
    category: categoryLabelToCode(form.category),
    title: form.title,
    description: "", // 폼에 설명 필드가 없다면 공백으로
    isGrowthMode: !!form.growthMode,
    targetType: form.growthMode ? (form.goalType === "time" ? "TIME" : "NUMBER") : undefined,
    targetValue: form.growthMode ? form.goalValue : undefined,
    growthCycleDays: form.growthMode ? form.growthPeriodDays : undefined,
    targetIncrement: form.growthMode ? form.growthIncrement : undefined,
  };
  const res = await api.post<CommonResponse<RoutineResp>>("/api/routines", body);
  return toRoutine(res.data.data);
}

/** 수정(제목은 수정 불가) */
export async function updateRoutineApi(id: number, form: AddRoutineForm): Promise<Routine> {
  const body: any = {
    category: categoryLabelToCode(form.category),
    description: "", // 필요 시 폼 추가
    isGrowthMode: !!form.growthMode,
    targetType: form.growthMode ? (form.goalType === "time" ? "TIME" : "NUMBER") : undefined,
    targetValue: form.growthMode ? form.goalValue : undefined,
    growthCycleDays: form.growthMode ? form.growthPeriodDays : undefined,
    targetIncrement: form.growthMode ? form.growthIncrement : undefined,
  };
  // 명세: title 수정 불가 → 전송하지 않음
  const res = await api.put<CommonResponse<RoutineResp>>(`/api/routines/${id}`, body);
  return toRoutine(res.data.data);
}

/** 삭제 */
export async function deleteRoutineApi(id: number): Promise<void> {
  await api.delete<CommonResponse<null>>(`/api/routines/${id}`);
}

/** 완료 토글(서버 스펙에 별도 엔드포인트 없음) */
export async function completeRoutineApi(_id: number): Promise<void> {
  // 서버 확정 시 구현
  return;
}

/** 카테고리 목록 (비인증) */
export async function fetchRoutineCategories(): Promise<{ code: string; description: string }[]> {
  const res = await api.get<CommonResponse<{ code: string; description: string }[]>>(
    "/api/routines/categories",
  );
  return res.data.data ?? [];
}

/** 적응형 루틴 후보 (v3.1 통합 응답) */
export async function fetchAdaptationCheck(): Promise<{
  growthReadyRoutines: any[];
  reductionReadyRoutines: any[];
  totalGrowthReadyCount: number;
  totalReductionReadyCount: number;
  totalAdaptiveCount: number;
}> {
  const res = await api.get<CommonResponse<any>>("/api/routines/adaptation-check");
  return res.data.data;
}

/** 목표 조정(INCREASE/DECREASE/RESET) */
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
