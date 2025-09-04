// features/routine/store/routine.store.ts
import { create } from "zustand";
import {
  addRoutineApi,
  completeRoutineApi,
  deleteRoutineApi,
  fetchRoutines,
  updateRoutineApi,
} from "../api/routines";
import type { AddRoutineForm, Routine } from "../types";

type State = {
  routines: Routine[];
  loading: boolean;
  error?: string;
  mutatingId?: number | null; // 업데이트/완료 중인 아이템
  deletingId?: number | null; // 삭제 중인 아이템
};

type Actions = {
  load: () => Promise<void>;
  create: (form: AddRoutineForm) => Promise<void>;
  update: (id: number, form: AddRoutineForm) => Promise<void>;
  remove: (id: number) => Promise<void>;
  toggleComplete: (id: number) => Promise<void>;
};

const byId = (arr: Routine[], id: number) => arr.find((r) => Number(r.id) === Number(id));
const replace = (arr: Routine[], id: number, patch: Partial<Routine>) =>
  arr.map((r) => (Number(r.id) === Number(id) ? { ...r, ...patch } : r));
const drop = (arr: Routine[], id: number) => arr.filter((r) => Number(r.id) !== Number(id));

export const useRoutineStore = create<State & Actions>((set, get) => ({
  routines: [],
  loading: false,
  error: undefined,
  mutatingId: null,
  deletingId: null,

  load: async () => {
    set({ loading: true, error: undefined });
    try {
      const rows = await fetchRoutines();
      set({ routines: rows });
    } catch {
      set({ error: "루틴을 불러오지 못했습니다." });
    } finally {
      set({ loading: false });
    }
  },

  create: async (form) => {
    // API가 목인 경우에도 즉시 반영되도록
    const created = await addRoutineApi(form);
    set((s) => ({ routines: [created, ...s.routines] }));
  },

  update: async (id, form) => {
    // 낙관적 반영
    const prev = get().routines;
    set({
      routines: replace(prev, id, form as Partial<Routine>),
      mutatingId: id,
      error: undefined,
    });
    try {
      const saved = await updateRoutineApi(id, form);
      // API에서 계산된 필드가 오면 덮어씀
      set((s) => ({
        routines: replace(s.routines, id, saved as Partial<Routine>),
        mutatingId: null,
      }));
    } catch (e) {
      set({ routines: prev, mutatingId: null, error: "루틴 수정 실패" });
      throw e;
    }
  },

  remove: async (id) => {
    // 낙관적 삭제
    const prev = get().routines;
    set({ routines: drop(prev, id), deletingId: id, error: undefined });
    try {
      await deleteRoutineApi(id);
      set({ deletingId: null });
    } catch (e) {
      set({ routines: prev, deletingId: null, error: "루틴 삭제 실패" });
      throw e;
    }
  },

  toggleComplete: async (id) => {
    // 현재 상태 기준으로 토글
    const prev = get().routines;
    const target = byId(prev, id);
    if (!target) return;

    const nextCompleted = !target.completedToday;
    set({
      routines: replace(prev, id, { completedToday: nextCompleted }),
      mutatingId: id,
      error: undefined,
    });

    try {
      // 서버가 상태값을 받는 형태라면: await completeRoutineApi(id, nextCompleted)
      await completeRoutineApi(id);
      set({ mutatingId: null });
    } catch (e) {
      set({ routines: prev, mutatingId: null, error: "완료 상태 변경 실패" });
    }
  },
}));
