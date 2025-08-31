/**
* Calendar domain types (feature-scoped). 공용 재사용 필요 시 entities/로 승격.
*/
export type Emotion = 'HAPPY' | 'NEUTRAL' | 'SAD' | 'ANGRY';

export interface DayAggregate {
    /** YYYY-MM-DD */
    date: string;
    topEmotion: Emotion | null; // Step2 API에는 감정 정보 없음 → null 유지(후속 확장)
    status: DayStatus;
    hasRecord: boolean;
    avgCompletion: number | null; // 성공률(%)를 그대로 저장
}

export type DayStatus = 'UNRECORDED' | 'INCOMPLETE' | 'PARTIAL' | 'FULL';

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
    goal_type?: 'TIME' | 'COUNT';
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


export interface RoutineDto {
    routine_id: number;
    routine_name: string;
    category: RoutineCategoryDto;
    current_value?: number;
    unit?: string;
    is_active: boolean;
    growth_mode: RoutineGrowthModeDto;
    today_record: RoutineTodayRecordDto | null;
    streak?: number;
    created_at?: string; // ISO
}


export interface GetRoutinesResponse {
    code: string;
    message: string;
    data: {
        routines: RoutineDto[];
        summary?: {
            total_routines: number;
            completed_today: number;
            partial_completed_today: number;
            not_started_today: number;
        };
    };
}
