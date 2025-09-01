import client from '@/shared/api/client';
import type { GetRoutinesResponse } from '../types';

/**
 * 그날 루틴 가져오기
*/
export const getRoutines = async (signal?: AbortSignal): Promise<GetRoutinesResponse> => {
    const res = await client.get('/api/routines', { signal });
    return res.data as GetRoutinesResponse;
};