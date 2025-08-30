import client from '@/shared/api/client';

export interface DailySuccessRateDto {
    date: string; // YYYY-MM-DD
    success_rate: number; // 0~100 float
}

export interface MonthSuccessRateDto {
    month: string; // YYYY-MM
    daily_success_rates: DailySuccessRateDto[];
}

/**
 * 월별 성공 척도 가져오는 api 호출
* GET /records/monthly-success-rate?month=YYYY-MM
*/
export const getMonthSuccessRate = async (
    month: string,
    signal?: AbortSignal
): Promise<MonthSuccessRateDto> => {
    const res = await client.get('/records/monthly-success-rate', { params: { month }, signal });
    return (res.data?.data as MonthSuccessRateDto) ?? { month, daily_success_rates: [] };
};