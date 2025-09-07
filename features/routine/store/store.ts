// features/routine/store/store.ts
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
  creating: boolean; // 생성 중
  mutatingId: number | null; // 수정/완료 중
  deletingId: number | null; // 삭제 중
  hasLoaded: boolean; // 최초 로드 여부
};

type Actions = {
  load: () => Promise<void>;
  create: (form: AddRoutineForm) => Promise<void>;
  update: (id: number, form: AddRoutineForm) => Promise<void>;
  remove: (id: number) => Promise<void>;
  toggleComplete: (id: number) => Promise<void>;
};

// 유틸
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
  hasLoaded: false,

  // ===== LOAD ================================================================
  load: async () => {
    const { loading, hasLoaded } = get();
    if (loading) {
      console.log("[RoutineStore] load:skip (already loading)");
      return;
    }
    // 이미 한 번 로딩 완료 + 데이터가 있으면 스킵(원하면 주석 처리)
    if (hasLoaded && get().routines.length > 0) {
      console.log("[RoutineStore] load:skip (already loaded)");
      return;
    }

    console.log("[RoutineStore] load:start");
    set({ loading: true, error: undefined });
    try {
      const rows = await fetchRoutines();
      console.log("[RoutineStore] load:success", { count: rows.length });
      set({ routines: rows, hasLoaded: true });
    } catch (e: unknown) {
      const anyE = e as any;
      console.warn("[RoutineStore] load:error", anyE?.response?.status, anyE?.response?.data || e);
      set({ error: "루틴을 불러오지 못했습니다.", hasLoaded: true });
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
    } catch (e: unknown) {
      const anyE = e as any;
      const status = anyE?.response?.status;
      const payload = anyE?.response?.data;
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

    // 낙관적 반영
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
    } catch (e: unknown) {
      const anyE = e as any;
      console.warn(
        "[RoutineStore] update:error",
        anyE?.response?.status,
        anyE?.response?.data || e,
      );
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

    // 낙관적 삭제
    set({ routines: drop(prev, id), deletingId: id, error: undefined });

    try {
      await deleteRoutineApi(id);
      console.log("[RoutineStore] remove:success", { id });
      set({ deletingId: null });
    } catch (e: unknown) {
      const anyE = e as any;
      console.warn(
        "[RoutineStore] remove:error",
        anyE?.response?.status,
        anyE?.response?.data || e,
      );
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

    // 낙관적 반영
    set({
      routines: replace(prev, id, { completedToday: nextCompleted }),
      mutatingId: id,
      error: undefined,
    });

    try {
      // 서버가 완료/취소 토글을 모두 허용한다고 가정
      const saved = await completeRoutineApi(id);
      console.log("[RoutineStore] toggleComplete:api:success", { id, saved });

      // ✅ 수정: 'void' 타입으로 추론된 API 응답을 'any'로 처리하여 타입 에러를 해결합니다.
      // 이는 'completeRoutineApi' 함수의 반환 타입 선언이 실제 반환 값과 다른 경우에 임시로 사용될 수 있습니다.
      const savedRoutine = saved as any;

      // 서버 응답에 완료상태가 들어오면 반영, 없으면 낙관값 유지
      const patch: Partial<Routine> =
        savedRoutine && typeof savedRoutine.completedToday === "boolean"
          ? { completedToday: savedRoutine.completedToday }
          : { completedToday: nextCompleted };
      set((s) => ({ routines: replace(s.routines, id, patch), mutatingId: null }));
      console.log("[RoutineStore] toggleComplete:success", { id });
    } catch (e: unknown) {
      const anyE = e as any;
      console.warn(
        "[RoutineStore] toggleComplete:error",
        anyE?.response?.status,
        anyE?.response?.data || e,
      );
      // 롤백
      set({ routines: prev, mutatingId: null, error: "완료 상태 변경 실패" });
    } finally {
      console.log("[RoutineStore] toggleComplete:end", { id });
    }
  },
}));
