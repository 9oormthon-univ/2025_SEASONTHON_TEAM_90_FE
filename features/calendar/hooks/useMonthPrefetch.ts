import { useEffect } from 'react';
import { addMonths } from '../utils/date';
import { getMonthRecords } from '../api/getMonthRecords';
import { aggregateByDay } from '../utils/emotion';
import { useCalendarStore } from '../store/calendar.store';


/**
* 외부 화면에서 캘린더 진입이 잦을 때, 백그라운드 선로딩 용.
*/
export const useMonthPrefetch = (baseMonth: string) => {
    const { monthCache, setMonthData } = useCalendarStore();
    useEffect(() => {
        const targets = [0, -1, 1].map((d) => addMonths(baseMonth, d));
        targets.forEach(async (m) => {
            if (monthCache[m]) return;
            try {
                const list = await getMonthRecords(m);
                setMonthData(m, { month: m, days: aggregateByDay(list) });
            } catch {
                /* ignore */
            }
        });
    }, [baseMonth, monthCache, setMonthData]);
};