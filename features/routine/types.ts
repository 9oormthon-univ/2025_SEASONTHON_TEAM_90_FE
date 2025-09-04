// features/routine/types.ts

export type GoalType = "count" | "time";

export type RoutineHistoryItem = {
  date: string; // "yyyy-MM-dd" 또는 ISO
  completed?: boolean; // true=성공, false=실패
  done?: boolean; // 호환
  status?: "DONE" | "SUCCESS" | "FAIL" | string; // 호환
};

export type Routine = {
  id: number;
  title: string;
  category: string;

  // 성장 모드
  growthMode?: boolean;
  goalType?: GoalType; // count=회, time=분
  goalValue?: number; // 현재 목표(회/분)
  growthPeriodDays?: number; // N일(연속 기준)
  growthIncrement?: number; // 증감 수치(회/분)

  // 사이클 기준점(이 이후부터 연속 계산)
  lastAdjustAt?: string; // ISO

  // UI 보조(옵션)
  subtitleHint?: string;
  streakDays?: number;

  // 히스토리
  history?: RoutineHistoryItem[];
  completedToday?: boolean;
};

/** 루틴 추가/수정 폼 */
export type AddRoutineForm = {
  title: string;
  category: string;
  growthMode: boolean;
  goalType?: GoalType;
  goalValue?: number;
  growthPeriodDays?: number;
  growthIncrement?: number;
  lastAdjustAt?: string;
};
