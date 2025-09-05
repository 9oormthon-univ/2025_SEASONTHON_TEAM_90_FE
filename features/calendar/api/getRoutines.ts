import client from '@/shared/api/client';

export type RoutineItem = {
    routineId: number;
    category: string;
    title: string;
    description?: string;
    isGrowthMode: boolean;
    targetType?: 'NUMBER' | 'TIME';
    targetValue?: number;
    targetCycleDays?: number;
    targetIncrement?: number;
    createdAt: string;
    updatedAt: string;
};

export type GetRoutinesResponse = {
    routines: RoutineItem[];
    totalCount: number;
};

/**
 * GET /api/routines
 * - 날짜별 조회가 가능하면 ?date=YYYY-MM-DD 로 전달
 * - 서버가 해당 파라미터를 무시해도 호환
 */
export const getRoutines = async (
    date?: string,
    signal?: AbortSignal
): Promise<GetRoutinesResponse> => {
    const res = await client.get('/api/routines', {
        params: date ? { date } : undefined,
        signal,
    });
    return res.data as GetRoutinesResponse;
};
