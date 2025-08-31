import { useEffect } from 'react';
import { addMonths } from '../utils/date';
import { useCalendarStore } from '../store/calendar.store';
import type { MonthData, DayAggregate, MonthlySuccessRateDto } from '../types';
import { getMonthlySuccessRate } from '../api/getMonthlySuccessRate'; // ← 현재는 MOCK-first 파일

// import { getMonthlySuccessRate as getMonthlySuccessRateReal } from '../api/getMonthlySuccessRate';
// ↑ [REAL]로 스왑 시 위 import 그대로 사용(파일 내 주석 코드로 자동 전환 가능)

const mapRateToStatus = (rate: number | null | undefined) => {
    if (rate == null) return 'UNRECORDED' as const;
    if (rate >= 100) return 'FULL' as const;
    if (rate > 0) return 'PARTIAL' as const;
    return 'INCOMPLETE' as const;
};

/** 외부 화면에서 캘린더 진입이 잦을 때, 백그라운드 선로딩 */
export const useMonthPrefetch = (baseMonth: string) => {
    const { monthCache, setMonthData } = useCalendarStore();

    useEffect(() => {
        const targets = [0, -1, 1].map((d) => addMonths(baseMonth, d));

        targets.forEach(async (m) => {
            if (monthCache[m]) return;
            try {
                // === [MOCK] ===
                const monthly: MonthlySuccessRateDto = await getMonthlySuccessRate(m);
                // const monthly: MonthlySuccessRateDto = await getMonthlySuccessRateReal(m); // ← [REAL] 사용 시
                // ========================

                const days: MonthData['days'] = {};
                monthly.daily_success_rates.forEach((d) => {
                    const rate = typeof d.success_rate === 'number' ? Math.round(d.success_rate) : null;
                    days[d.date] = {
                        date: d.date,
                        topEmotion: null,
                        status: mapRateToStatus(rate),
                        hasRecord: rate != null,
                        avgCompletion: rate,
                    } satisfies DayAggregate;
                });
                setMonthData(m, { month: m, days });
            } catch {
                /* ignore */
            }
        });
    }, [baseMonth, monthCache, setMonthData]);
};
