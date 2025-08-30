import client from '@/shared/api/client';
import type { RecordDto } from '../types';


/**
* GET /v1/records?month=YYYY-MM
* @param month YYYY-MM
*/
export const getMonthRecords = async (month: string, signal?: AbortSignal): Promise<RecordDto[]> => {
    const res = await client.get('/v1/records', { params: { month }, signal });
    // 통합 응답 구조에서 data를 파싱한다고 가정
    return (res.data?.data as RecordDto[]) ?? [];
};