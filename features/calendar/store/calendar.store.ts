import { create } from "zustand";
import type { MonthData } from "../types";
import { toMonth, todayYMD } from "../utils/date";

interface CalendarState {
  currentMonth: string; // YYYY-MM
  selectedDate: string; // YYYY-MM-DD
  monthCache: Record<string, MonthData>; // month -> data
  isLoading: boolean;

  setMonth: (m: string) => void;
  setSelectedDate: (d: string) => void;
  setMonthData: (m: string, data: MonthData) => void;
  setLoading: (v: boolean) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  currentMonth: toMonth(new Date()),
  selectedDate: todayYMD(),
  monthCache: {},
  isLoading: false,

  setMonth: (m) => set({ currentMonth: m }),
  setSelectedDate: (d) => set({ selectedDate: d }),
  setMonthData: (m, data) => set((s) => ({ monthCache: { ...s.monthCache, [m]: data } })),
  setLoading: (v) => set({ isLoading: v }),
}));
