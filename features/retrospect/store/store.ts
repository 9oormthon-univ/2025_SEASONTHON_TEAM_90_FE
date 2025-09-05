// features/retrospect/store/store.ts
import { create } from "zustand";
import type { Retrospect, RoutineStatus, Mood } from "../types";

// ✅ 목 API
import {
  fetchRetrospect as fetchRetrospectMock,
  saveRetrospect as saveRetrospectMock,
} from "../api/api";

type State = {
  data: Retrospect | null;
  loading: boolean;
  error?: string;
};

type Actions = {
  load: (
    date: string,
    getDailyRoutines?: (date: string) => { id: number; title: string; category: any }[],
  ) => Promise<void>;

  cycleStatus: (id: number) => void;
  setStatus: (date: string, id: number, status: RoutineStatus) => void;
  updateNote: (text: string) => void;
  pickMood: (mood: Mood) => void;
  submit: () => Promise<void>;
};

export const useRetrospectStore = create<State & Actions>((set, get) => ({
  data: null,
  loading: false,
  error: undefined,

  /** 로드: 저장본 우선 → 스냅샷으로 보정/추가 */
  load: async (date, getDailyRoutines) => {
    set({ loading: true, error: undefined });

    try {
      // 1) 저장본 먼저 로드 (없으면 null)
      const saved = await fetchRetrospectMock(date, undefined);

      // 2) 오늘 스냅샷 (기본 NONE)
      const base =
        getDailyRoutines?.(date)?.map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category ?? "기타",
          status: "NONE" as RoutineStatus,
        })) ?? [];

      // 3) 병합: id는 문자열로 정규화해서 비교
      let routines = base;
      if (saved?.routines?.length) {
        const baseMap = new Map<string, (typeof base)[number]>(
          base.map((b) => [String(b.id), { ...b }]),
        );

        for (const sr of saved.routines) {
          const key = String(sr.id);
          if (baseMap.has(key)) {
            baseMap.set(key, { ...baseMap.get(key)!, status: sr.status });
          } else {
            baseMap.set(key, {
              id: sr.id,
              title: sr.title,
              category: sr.category ?? "기타",
              status: sr.status as RoutineStatus,
            });
          }
        }
        routines = Array.from(baseMap.values());
      }

      // 4) 최종 상태 세팅 (저장본이 있으면 note/mood/submitted 유지)
      set({
        data: {
          date,
          routines,
          note: saved?.note ?? "",
          mood: (saved?.mood ?? null) as Mood,
          submitted: !!saved?.submitted,
        },
        loading: false,
        error: undefined,
      });
    } catch {
      set({ error: "데이터를 불러오지 못했어요.", loading: false });
    }
  },

  /** 상태 순환 토글 */
  cycleStatus: (id) => {
    set((s) => {
      if (!s.data) return s;
      const next = s.data.routines.map((r) => {
        if (r.id !== id) return r;
        const ns: RoutineStatus =
          r.status === "NONE" ? "PARTIAL" : r.status === "PARTIAL" ? "DONE" : "NONE";
        return { ...r, status: ns };
      });
      return { data: { ...s.data, routines: next } };
    });
  },

  /** 직접 세팅 */
  setStatus: (date, id, status) => {
    set((s) => {
      if (!s.data || s.data.date !== date) return s;
      const key = String(id);
      const next = s.data.routines.map((r) => (String(r.id) === key ? { ...r, status } : r));
      return { data: { ...s.data, routines: next } };
    });
  },

  updateNote: (text) => set((s) => (s.data ? { data: { ...s.data, note: text } } : s)),

  pickMood: (mood) => set((s) => (s.data ? { data: { ...s.data, mood } } : s)),

  /** 저장(제출): 루틴까지 함께 저장 */
  submit: async () => {
    const s = get();
    const data = s.data;
    if (!data) return;

    // 루틴 id를 문자열로 정규화해서 저장 (병합 시 안정적)
    const routinesPayload = data.routines.map((r) => ({
      id: String(r.id),
      title: r.title,
      category: r.category ?? "기타",
      status: r.status,
    }));

    try {
      // ✅ 목 API: (date, note, mood, routines?) 형태로 저장
      await saveRetrospectMock(data.date, data.note, data.mood, routinesPayload);

      set({
        data: {
          ...data,
          submitted: true,
          routines: data.routines, // 그대로 유지
        },
      });
    } catch {
      set({ error: "저장에 실패했어요. 잠시 후 다시 시도해 주세요." });
      throw new Error("save failed");
    }
  },
}));
