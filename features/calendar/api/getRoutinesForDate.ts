import client from '@/shared/api/client';


export interface RoutineForDateDto {
    id: string;
    name: string;
    categoryId: string;
    active: boolean;
    /** 오늘 목표 표시용 (선택: 성장 모드 적용 후 서버 계산값이면 그대로 사용) */
    todayTarget?: string;
}


/** GET /v1/routines?date=YYYY-MM-DD */
export const getRoutinesForDate = async (date: string, signal?: AbortSignal): Promise<RoutineForDateDto[]> => {
    const res = await client.get('/v1/routines', { params: { date }, signal });
    return (res.data?.data as RoutineForDateDto[]) ?? [];
};