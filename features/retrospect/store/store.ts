import { create } from "zustand";
import type { Retrospect, RoutineStatus, Mood } from "../types";

// ✅ 실서버 API 사용
import { fetchRetrospect, saveRetrospect } from "@features/retrospect/api/api";

type State = {
  data: Retrospect | null;
  loading: boolean;
  error?: string;
};

type Actions = {
  // 🔧 서버가 해당 날짜의 루틴 목록을 함께 내려주므로 인자는 date만
  load: (date: string) => Promise<void>;

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

  /** 로드: 서버 데이터 그대로 사용 (병합 불필요) */
  load: async (date) => {
    set({ loading: true, error: undefined });
    try {
      const r = await fetchRetrospect(date);
      set({ data: r, loading: false, error: undefined });
    } catch (e: any) {
      const body = e?.response?.data as { code?: string; message?: string } | undefined;
      set({
        error: body?.message ?? "데이터를 불러오지 못했어요.",
        loading: false,
      });
    }
  },

  /** 상태 순환 토글 (로컬 상태) */
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

  /** 직접 세팅 (로컬 상태) */
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

  /** 저장(제출): 루틴 스냅샷과 함께 서버에 POST */
  submit: async () => {
    const s = get();
    const data = s.data;
    if (!data) return;

    // 서버 saveRetrospect는 (date, note, mood, routinesSnapshot?) 서명
    const routinesSnapshot = data.routines.map((r) => ({
      id: r.id, // ✅ 숫자 id
      status: r.status as RoutineStatus,
    }));

    try {
      await saveRetrospect(data.date, data.note, data.mood, routinesSnapshot);
      set({
        data: {
          ...data,
          submitted: true,
        },
      });
    } catch (e) {
      set({ error: "저장에 실패했어요. 잠시 후 다시 시도해 주세요." });
      throw e;
    }
  },
}));
