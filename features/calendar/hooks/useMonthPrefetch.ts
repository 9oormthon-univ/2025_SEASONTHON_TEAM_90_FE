import { useEffect } from "react";
import { addMonths } from "../utils/date";
import { useCalendarStore } from "../store/calendar.store";
import type { MonthData, DayAggregate, MonthlySuccessRateDto } from "../types";
import { getMonthlySuccessRate } from "../api/getMonthlySuccessRate";

const mapRateToStatus = (rate: number | null | undefined) => {
  if (rate == null) return "UNRECORDED" as const;
  if (rate >= 100) return "FULL" as const;
  if (rate > 0) return "PARTIAL" as const;
  return "INCOMPLETE" as const;
};

/**
 * 인접 월(이전/현재/다음) 선로딩
 * 화면 진입 시 로딩 개선
 */
export const useMonthPrefetch = (baseMonth: string) => {
  const { monthCache, setMonthData } = useCalendarStore();

  useEffect(() => {
    const targets = [0, -1, 1].map((d) => addMonths(baseMonth, d));

    targets.forEach(async (m) => {
      if (monthCache[m]) return;
      try {
        // === [REAL API] ===
        // const monthly: MonthlySuccessRateDto = await getMonthlySuccessRate(m); // [changed]
        // === [MOCK 참고용] ===
        const monthly = await getMonthlySuccessRate(m);

        const days: MonthData["days"] = {};
        monthly.daily_success_rates.forEach((d) => {
          const rate = typeof d.success_rate === "number" ? Math.round(d.success_rate) : null;
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
        /* ignore prefetch error */
      }
    });
  }, [baseMonth, monthCache, setMonthData]);
};
