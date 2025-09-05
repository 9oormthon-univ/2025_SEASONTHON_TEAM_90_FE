import { useQuery } from '@tanstack/react-query';
import client from '@/shared/api/client';

interface DailyStat {
  day: number;
  successfulRoutines: number;
  totalRoutines: number;
  successRate: number;
}

interface MonthlyStatsResponse {
  year: number;
  month: number;
  dailyStats: DailyStat[];
}

/**
 * 월별 루틴 통계 조회
 */
const fetchMonthlyStats = async (
  year: number,
  month: number,
  signal?: AbortSignal
): Promise<MonthlyStatsResponse> => {
  const res = await client.get(`/api/daily-records/monthly-stats/${year}/${month}`, { signal });
  return res.data as MonthlyStatsResponse;
};

export const useMonthlyStats = (year: number, month: number) => {
  return useQuery({
    queryKey: ['monthlyStats', year, month],
    queryFn: ({ signal }) => fetchMonthlyStats(year, month, signal),
  });
};
