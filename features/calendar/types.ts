/**
 * Calendar domain types (feature-scoped). 공용 재사용 필요 시 entities/로 승격.
 */
export type Emotion = "HAPPY" | "NEUTRAL" | "SAD" | "ANGRY";

export interface DayAggregate {
  /** YYYY-MM-DD */
  date: string;
  topEmotion: Emotion | null; // Step2 API에는 감정 정보 없음 → null 유지(후속 확장)
  status: DayStatus;
  hasRecord: boolean;
  avgCompletion: number | null; // 성공률(%)를 그대로 저장
}

export type DayStatus = "UNRECORDED" | "INCOMPLETE" | "PARTIAL" | "FULL";

export interface MonthData {
  /** YYYY-MM */
  month: string;
  days: Record<string, DayAggregate>;
}

export interface DailySuccessRateDto {
  date: string; // YYYY-MM-DD
  success_rate: number; // 0~100 (소수 가능)
}

export interface MonthlySuccessRateDto {
  month: string; // YYYY-MM
  daily_success_rates: DailySuccessRateDto[];
}

export interface GetMonthlySuccessRateResponse {
  code: string;
  message: string;
  data: MonthlySuccessRateDto;
}

export interface RoutineCategoryDto {
  category_id: number;
  category_name: string;
}

export interface RoutineGrowthModeDto {
  enabled: boolean;
  goal_type?: "TIME" | "COUNT";
  goal_value?: number;
  period_days?: number;
  increase_value?: number;
  current_period_end?: string; // YYYY-MM-DD
  auto_rollover?: boolean;
}

export interface RoutineTodayRecordDto {
  record_id: number;
  achieved_value: number;
  completion_rate: number; // 0~100
  is_completed: boolean;
  emotion?: string; // 서버 한글 감정 문자열 (후속 매핑 계획)
  comment?: string;
}

export type RoutineDto = {
  routineId: number;
  category: string; // e.g. "HEALTH"
  title: string;
  description?: string;
  isGrowthMode: boolean;
  targetType?: "NUMBER" | "TIME";
  targetValue?: number;
  targetCycleDays?: number;
  targetIncrement?: number;
  createdAt: string;
  updatedAt: string;
};

export type GetRoutinesResponse = {
  routines: RoutineDto[];
  totalCount: number;
};
