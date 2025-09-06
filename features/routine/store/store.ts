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
  creating?: boolean; // ✅ 생성 중
  mutatingId?: number | null; // 수정/완료 중
  deletingId?: number | null; // 삭제 중
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
  creating: false,
  mutatingId: null,
  deletingId: null,

  // ===== LOAD ================================================================
  load: async () => {
    console.log("[RoutineStore] load:start");
    set({ loading: true, error: undefined });
    try {
      const rows = await fetchRoutines();
      console.log("[RoutineStore] load:success", { count: rows.length });
      set({ routines: rows });
    } catch (e: any) {
      console.warn("[RoutineStore] load:error", e?.response?.status, e?.response?.data || e);
      set({ error: "루틴을 불러오지 못했습니다." });
    } finally {
      set({ loading: false });
      console.log("[RoutineStore] load:end");
    }
  },

  // ===== CREATE ==============================================================
  create: async (form) => {
    if (get().creating) {
      console.warn("[RoutineStore] create:blocked (in-flight)");
      return;
    }
    console.log("[RoutineStore] create:start", { form });
    set({ creating: true, error: undefined });
    try {
      const created = await addRoutineApi(form);
      console.log("[RoutineStore] create:api:success", { id: created?.id, created });
      set((s) => ({ routines: [created, ...s.routines] }));
      console.log("[RoutineStore] create:success");
    } catch (e: any) {
      const status = e?.response?.status;
      const payload = e?.response?.data;
      console.warn("[RoutineStore] create:error", status, payload || e);
      if (status === 401) console.warn("[RoutineStore] hint → 토큰 만료/누락 여부 확인");
      if (status === 409) console.warn("[RoutineStore] hint → DUPLICATE_ROUTINE_TITLE 가능");
      if (status === 400) console.warn("[RoutineStore] hint → 유효성 검증 실패");
      set({ error: "루틴 생성 실패" });
      throw e;
    } finally {
      set({ creating: false });
      console.log("[RoutineStore] create:end");
    }
  },

  // ===== UPDATE ==============================================================
  update: async (id, form) => {
    const prev = get().routines;
    console.log("[RoutineStore] update:start", { id, form });

    set({
      routines: replace(prev, id, form as Partial<Routine>),
      mutatingId: id,
      error: undefined,
    });

    try {
      const saved = await updateRoutineApi(id, form);
      console.log("[RoutineStore] update:api:success", { id, saved });
      set((s) => ({
        routines: replace(s.routines, id, saved as Partial<Routine>),
        mutatingId: null,
      }));
      console.log("[RoutineStore] update:success", { id });
    } catch (e: any) {
      console.warn("[RoutineStore] update:error", e?.response?.status, e?.response?.data || e);
      set({ routines: prev, mutatingId: null, error: "루틴 수정 실패" });
      throw e;
    } finally {
      console.log("[RoutineStore] update:end", { id });
    }
  },

  // ===== REMOVE ==============================================================
  remove: async (id) => {
    const prev = get().routines;
    console.log("[RoutineStore] remove:start", { id });

    set({ routines: drop(prev, id), deletingId: id, error: undefined });

    try {
      await deleteRoutineApi(id);
      console.log("[RoutineStore] remove:success", { id });
      set({ deletingId: null });
    } catch (e: any) {
      console.warn("[RoutineStore] remove:error", e?.response?.status, e?.response?.data || e);
      set({ routines: prev, deletingId: null, error: "루틴 삭제 실패" });
      throw e;
    } finally {
      console.log("[RoutineStore] remove:end", { id });
    }
  },

  // ===== TOGGLE COMPLETE =====================================================
  toggleComplete: async (id) => {
    const prev = get().routines;
    const target = byId(prev, id);
    if (!target) {
      console.warn("[RoutineStore] toggleComplete:target:not-found", { id });
      return;
    }
    const nextCompleted = !target.completedToday;
    console.log("[RoutineStore] toggleComplete:start", { id, nextCompleted });

    set({
      routines: replace(prev, id, { completedToday: nextCompleted }),
      mutatingId: id,
      error: undefined,
    });

    try {
      await completeRoutineApi(id);
      console.log("[RoutineStore] toggleComplete:success", { id, completedToday: nextCompleted });
      set({ mutatingId: null });
    } catch (e: any) {
      console.warn(
        "[RoutineStore] toggleComplete:error",
        e?.response?.status,
        e?.response?.data || e,
      );
      set({ routines: prev, mutatingId: null, error: "완료 상태 변경 실패" });
    } finally {
      console.log("[RoutineStore] toggleComplete:end", { id });
    }
  },
}));
