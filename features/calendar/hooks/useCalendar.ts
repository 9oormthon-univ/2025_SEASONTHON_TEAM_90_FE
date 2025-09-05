import { useEffect, useMemo, useRef } from "react";
import { useCalendarStore } from "../store/calendar.store";
import { addMonths, getMonthMatrix, isSameMonth } from "../utils/date";
import type { MonthData, DayAggregate, MonthlySuccessRateDto } from "../types";
import { getMonthlySuccessRate } from "../api/getMonthlySuccessRate";
import { todayYMD } from "../utils/date";

const mapRateToStatus = (rate: number | null | undefined) => {
  if (rate == null) return "UNRECORDED" as const;
  if (rate >= 100) return "FULL" as const;
  if (rate > 0) return "PARTIAL" as const;
  return "INCOMPLETE" as const;
};

/**
 * 캘린더 월 단위 데이터 로딩 훅
 * - monthCache 미보유 시 실 API 호출
 * - 인접 월은 useMonthPrefetch에서 선로딩
 */
export const useCalendar = () => {
  const { currentMonth, monthCache, setMonthData, isLoading, setLoading, setMonth } =
    useCalendarStore();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const run = async () => {
      if (monthCache[currentMonth]) return;

      abortRef.current?.abort();
      const ctl = new AbortController();
      abortRef.current = ctl;

      setLoading(true);
      try {
        // === [REAL API] ===
        const monthly: MonthlySuccessRateDto = await getMonthlySuccessRate(
          currentMonth,
          ctl.signal,
        ); // [changed]
        // === [MOCK 참고용] ===
        // const monthly = await getMonthlySuccessRateMock(currentMonth, ctl.signal);

        const days: Record<string, DayAggregate> = {};
        monthly.daily_success_rates.forEach((d) => {
          const rate = typeof d.success_rate === "number" ? Math.round(d.success_rate) : null;
          days[d.date] = {
            date: d.date,
            topEmotion: null, // 감정 매핑은 후속 API 사용 시 교체
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

  // 월 뷰 행렬
  const matrix = useMemo(() => getMonthMatrix(currentMonth, 0), [currentMonth]);

  const goPrev = () => setMonth(addMonths(currentMonth, -1));
  const goNext = () => setMonth(addMonths(currentMonth, 1));
  /** 오늘 이동 추가 */
  const goToday = () => {
    const tm = todayYMD().slice(0, 7);
    setMonth(tm);
  };
  const getDayMeta = (d: Date) => {
    const cached = monthCache[currentMonth];
    const ymd = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
      .getDate()
      .toString()
      .padStart(2, "0")}`;

    const agg = cached?.days[ymd];
    const isT = ymd === todayYMD();

    return {
      ymd,
      inMonth: isSameMonth(currentMonth, d),
      isToday: isT,
      aggregate: agg,
    } as const;
  };

  return {
    currentMonth,
    isLoading,
    matrix,
    getDayMeta,
    goPrev,
    goNext,
    goToday,
  } as const;
};
