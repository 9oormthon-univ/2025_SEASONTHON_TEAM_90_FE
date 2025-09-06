import { useEffect } from "react";
import { useRoutineStore } from "../store/store";

export const useRoutines = () => {
  const { routines, loading, error, load, create, toggleComplete } = useRoutineStore();

  useEffect(() => {
    if (!routines.length) void load();
  }, [routines.length, load]);

  return { routines, loading, error, create, toggleComplete, reload: load };
};
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
// features/routine/types.ts

export type GoalType = "count" | "time";

export type RoutineHistoryItem = {
  date: string; // "yyyy-MM-dd" 또는 ISO
  completed?: boolean; // true=성공, false=실패
  done?: boolean; // 호환
  status?: "DONE" | "SUCCESS" | "FAIL" | string; // 호환
};

export type Routine = {
  id: number;
  title: string;
  category: string;

  // 성장 모드
  growthMode?: boolean;
  goalType?: GoalType; // count=회, time=분
  goalValue?: number; // 현재 목표(회/분)
  growthPeriodDays?: number; // N일(연속 기준)
  growthIncrement?: number; // 증감 수치(회/분)

  // 사이클 기준점(이 이후부터 연속 계산)
  lastAdjustAt?: string; // ISO

  // UI 보조(옵션)
  subtitleHint?: string;
  streakDays?: number;

  // 히스토리
  history?: RoutineHistoryItem[];
  completedToday?: boolean;
};

/** 루틴 추가/수정 폼 */
export type AddRoutineForm = {
  title: string;
  category: string;
  growthMode: boolean;
  goalType?: GoalType;
  goalValue?: number;
  growthPeriodDays?: number;
  growthIncrement?: number;
  lastAdjustAt?: string;
};
// features/common/PopupHost.tsx
import React from "react";
import { usePopupQueue } from "./popupQueue";

export default function PopupHost() {
  // 개별 selector로 분리하면 디버깅도 쉬움
  const current = usePopupQueue((s) => s.current);
  const dismiss = usePopupQueue((s) => s.dismiss);

  if (!current) return null;
  return current.render(dismiss);
}
// features/common/popupQueue.ts
import { create } from "zustand";
import { nanoid } from "nanoid/non-secure";
import type { ReactElement } from "react";

export type PopupItem = {
  id: string;
  render: (dismiss: () => void) => ReactElement | null;
};

type PopupQueueState = {
  queue: PopupItem[];
  current: PopupItem | null;
  enqueue: (render: PopupItem["render"]) => string;
  dismiss: () => void;
  clear: () => void;
};

export const usePopupQueue = create<PopupQueueState>((set, get) => ({
  queue: [],
  current: null,
  enqueue: (render) => {
    const id = nanoid();
    const item: PopupItem = { id, render };
    const { current, queue } = get();
    if (!current) set({ current: item });
    else set({ queue: [...queue, item] });
    return id;
  },
  dismiss: () => {
    const { queue } = get();
    if (queue.length === 0) set({ current: null });
    else {
      const [next, ...rest] = queue;
      set({ current: next, queue: rest });
    }
  },
  clear: () => set({ queue: [], current: null }),
}));