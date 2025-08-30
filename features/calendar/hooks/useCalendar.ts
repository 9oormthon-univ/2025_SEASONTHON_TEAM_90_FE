import { useEffect, useMemo, useRef } from 'react';
import { getMonthRecords } from '../api/getMonthRecords';
import { addMonths, getMonthMatrix, isSameMonth } from '../utils/date';
import { useCalendarStore } from '../store/calendar.store';
import { aggregateByDay } from '../utils/emotion';
import { MonthData } from '../types';


/**
* 캘린더 핵심 훅: 월 데이터 로드, 네비게이션, 매트릭스 계산.
* - 500ms 내 로딩 체감 개선: 인접 월 선(先)프리패치 + 캐시 사용.
*/
export const useCalendar = () => {
    const { currentMonth, monthCache, setMonthData, isLoading, setLoading, setMonth } = useCalendarStore();
    const abortRef = useRef<AbortController | null>(null);


    // 현재 월 데이터 가져오기 (캐시 우선)
    useEffect(() => {
        const run = async () => {
            if (monthCache[currentMonth]) return; // cache hit
            abortRef.current?.abort();
            const ctl = new AbortController();
            abortRef.current = ctl;
            setLoading(true);
            try {
                const list = await getMonthRecords(currentMonth, ctl.signal);
                const days = aggregateByDay(list);
                const data: MonthData = { month: currentMonth, days };
                setMonthData(currentMonth, data);
            } finally {
                setLoading(false);
            }
        };
        void run();
        return () => abortRef.current?.abort();
    }, [currentMonth, monthCache, setLoading, setMonthData]);


    // 인접 월 프리패치(체감 로딩↓)
    useEffect(() => {
        const prev = addMonths(currentMonth, -1);
        const next = addMonths(currentMonth, 1);
        const preload = async (m: string) => {
            if (monthCache[m]) return;
            try {
                const list = await getMonthRecords(m);
                const data: MonthData = { month: m, days: aggregateByDay(list) };
                setMonthData(m, data);
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
        return {
            ymd,
            inMonth: isSameMonth(currentMonth, d),
            aggregate: agg, // undefined면 미기록(점)
        } as const;
    };


    return {
        currentMonth,
        isLoading,
        matrix,
        getDayMeta,
        goPrev,
        goNext,
    } as const;
};