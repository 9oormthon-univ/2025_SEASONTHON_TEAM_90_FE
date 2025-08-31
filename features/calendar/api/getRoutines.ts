import client from '@/shared/api/client';
import type { GetRoutinesResponse, RoutineDto } from '../types';

/**
 * 그날 루틴 가져오기
* GET /routines?date=YYYY-MM-DD&active_only=true
*/
export const getRoutines = async (
    date?: string,
    activeOnly: boolean = true,
    signal?: AbortSignal
): Promise<{ routines: RoutineDto[]; summary?: GetRoutinesResponse['data']['summary'] }> => {
    const res = await client.get('/routines', { params: { date, active_only: activeOnly }, signal });
    const data = (res.data as GetRoutinesResponse)?.data;
    return { routines: data?.routines ?? [], summary: data?.summary };
};