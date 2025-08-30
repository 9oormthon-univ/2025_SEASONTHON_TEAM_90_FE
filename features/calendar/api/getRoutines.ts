import client from '@/shared/api/client';

export interface RoutineDto {
    routine_id: number;
    routine_name: string;
    category: {
        category_id: number;
        category_name: string;
    };
    current_value: number;
    unit: string;
    is_active: boolean;
    growth_mode: {
        enabled: boolean;
        goal_type?: 'COUNT' | 'TIME';
        goal_value?: number;
        period_days?: number;
        increase_value?: number;
        current_period_end?: string;
        auto_rollover?: boolean;
    };
    today_record: {
        record_id: number;
        achieved_value: number;
        completion_rate: number;
        is_completed: boolean;
        emotion: string;
        comment: string;
    } | null;
    streak: number;
    created_at?: string;
}

export interface RoutineSummaryDto {
    total_routines: number;
    completed_today: number;
    partial_completed_today: number;
    not_started_today: number;
}

export interface RoutineListResponseDto {
    routines: RoutineDto[];
    summary: RoutineSummaryDto;
}


/**
 * 그날 루틴 가져오기
* GET /routines?date=YYYY-MM-DD&active_only=true
*/
export const getRoutines = async (
    date?: string,
    activeOnly: boolean = true,
    signal?: AbortSignal
): Promise<RoutineListResponseDto> => {
    const res = await client.get('/routines', { params: { date, active_only: activeOnly }, signal });
    return (res.data?.data as RoutineListResponseDto) ?? { routines: [], summary: { total_routines: 0, completed_today: 0, partial_completed_today: 0, not_started_today: 0 } };
};