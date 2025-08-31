import { useEffect, useMemo, useRef } from 'react';
import { useCalendarStore } from '../store/calendar.store';
import { addMonths, getMonthMatrix, isSameMonth } from '../utils/date';
import type { MonthData, DayAggregate, MonthlySuccessRateDto } from '../types';
import { getMonthlySuccessRate } from '../api/getMonthlySuccessRate'; // ← 현재는 MOCK-first 파일
import { todayYMD } from '../utils/date';

// import { getMonthlySuccessRate as getMonthlySuccessRateReal } from '../api/getMonthlySuccessRate'; 
// ↑ [REAL]로 스왑 시 위 import 그대로 사용(파일 내 주석 코드로 자동 전환 가능)

const mapRateToStatus = (rate: number | null | undefined) => {
    if (rate == null) return 'UNRECORDED' as const;
    if (rate >= 100) return 'FULL' as const;
    if (rate > 0) return 'PARTIAL' as const;
    return 'INCOMPLETE' as const;
};

export const useCalendar = () => {
    const { currentMonth, monthCache, setMonthData, isLoading, setLoading, setMonth } = useCalendarStore();
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const run = async () => {
            if (monthCache[currentMonth]) return;

            abortRef.current?.abort();
            const ctl = new AbortController();
            abortRef.current = ctl;
            setLoading(true);
            try {
                // === [MOCK] ===
                const monthly: MonthlySuccessRateDto = await getMonthlySuccessRate(currentMonth, ctl.signal);
                // const monthly: MonthlySuccessRateDto = await getMonthlySuccessRateReal(currentMonth, ctl.signal); // ← [REAL] 사용 시
                // ========================

                const days: Record<string, DayAggregate> = {};
                monthly.daily_success_rates.forEach((d) => {
                    const rate = typeof d.success_rate === 'number' ? Math.round(d.success_rate) : null;
                    days[d.date] = {
                        date: d.date,
                        topEmotion: null, // 감정은 후속 API에서 매핑
                        status: mapRateToStatus(rate),
                        hasRecord: rate != null,
                        avgCompletion: rate,
                    };
                });
                const data: MonthData = { month: currentMonth, days };
                setMonthData(currentMonth, data);
            } finally {
                setLoading(false);
            }
        };
        void run();
        return () => abortRef.current?.abort();
    }, [currentMonth, monthCache, setLoading, setMonthData]);

    // 인접 월 프리패치
    useEffect(() => {
        const prev = addMonths(currentMonth, -1);
        const next = addMonths(currentMonth, 1);
        const preload = async (m: string) => {
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
                    };
                });
                setMonthData(m, { month: m, days });
            } catch {
                /* ignore */
            }
        };
        void preload(prev);
        void preload(next);
    }, [currentMonth, monthCache, setMonthData]);

    const matrix = useMemo(() => getMonthMatrix(currentMonth, 0), [currentMonth]);
    const goPrev = () => setMonth(addMonths(currentMonth, -1));
    const goNext = () => setMonth(addMonths(currentMonth, 1));

    const getDayMeta = (d: Date) => {
        const m = monthCache[currentMonth];
        const ymd = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d
            .getDate()
            .toString()
            .padStart(2, '0')}`;
        const agg = m?.days[ymd];

        const isT = ymd === todayYMD(); // 오늘 저장
        return { ymd, inMonth: isSameMonth(currentMonth, d), isToday: isT, aggregate: agg } as const;
    };

    return { currentMonth, isLoading, matrix, getDayMeta, goPrev, goNext } as const;
};
