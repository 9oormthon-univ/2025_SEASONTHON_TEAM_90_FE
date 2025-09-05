// features/retrospect/store/store.ts
import { create } from "zustand";
import type { Retrospect, RoutineStatus, Mood } from "../types";

// ✅ 현재 활성: 목 API
import {
  fetchRetrospect as fetchRetrospectMock,
  saveRetrospect as saveRetrospectMock,
} from "../api/api";

// ──────────────────────────────────────────────────────────────
//  실서버 연동 시 사용할 주석 (명세서 기반)
//  import { api } from "@/utils/api/client";
//  type CommonResponse<T> = { code: string; message: string; data: T };
//  ↓ 필요 타입/매핑은 features/retrospect/api.ts 주석 섹션 참고
// ──────────────────────────────────────────────────────────────

type State = {
  data: Retrospect | null;
  loading: boolean;
  error?: string;
};

type Actions = {
  /** 날짜별 회고 로드 (없으면 템플릿 생성) */
  load: (
    date: string,
    getDailyRoutines?: (date: string) => { id: number; title: string; category: any }[],
  ) => Promise<void>;

  /** 루틴 상태를 순환(NONE→PARTIAL→DONE) */
  cycleStatus: (id: number) => void;

  /** 루틴 상태를 직접 세팅 */
  setStatus: (date: string, id: number, status: RoutineStatus) => void;

  /** 회고 메모 업데이트 */
  updateNote: (text: string) => void;

  /** 오늘의 기분 선택 */
  pickMood: (mood: Mood) => void;

  /** 저장(제출) */
  submit: () => Promise<void>;
};

export const useRetrospectStore = create<State & Actions>((set, get) => ({
  data: null,
  loading: false,
  error: undefined,

  /** 로드 */
  load: async (date, getDailyRoutines) => {
    set({ loading: true, error: undefined });

    try {
      // ✅ 목 API
      const r = await fetchRetrospectMock(date, getDailyRoutines);
      set({ data: r, loading: false });

      // ─────────────────────────────────────────────
      // 🔻 실서버 연동 예시 (주석)
      // const res = await api.get<CommonResponse<DailyRecordResponse>>(`/api/daily-records/${date}`);
      // const mapped = toRetrospect(date, res.data.data); // api.ts 주석의 toRetrospect 참고
      // set({ data: mapped, loading: false });
      // ─────────────────────────────────────────────
    } catch (e) {
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

  /** 직접 세팅 (Bottom Sheet에서 사용) */
  setStatus: (date, id, status) => {
    set((s) => {
      if (!s.data || s.data.date !== date) return s;
      const next = s.data.routines.map((r) => (r.id === id ? { ...r, status } : r));
      return { data: { ...s.data, routines: next } };
    });

    // ─────────────────────────────────────────────
    // 🔻 실서버에 즉시 반영하려면 PATCH 엔드포인트 필요
    // (명세서에는 날짜 POST 덮어쓰기만 있어, 보통 submit에서 한번에 저장)
    // await api.patch(`/api/daily-records/${date}/routines/${id}`, {
    //   performanceLevel: toPerformanceLevel(status),
    // });
    // ─────────────────────────────────────────────
  },

  updateNote: (text) => set((s) => (s.data ? { data: { ...s.data, note: text } } : s)),

  pickMood: (mood) => set((s) => (s.data ? { data: { ...s.data, mood } } : s)),

  /** 저장 = 제출 */
  submit: async () => {
    const s = get();
    const data = s.data;
    if (!data) return;

    try {
      // ✅ 목 API (덮어쓰기 저장)
      await saveRetrospectMock(data.date, data.note, data.mood);

      // 저장 후 submitted 플래그 온
      set((prev) => (prev.data ? { data: { ...prev.data, submitted: true } } : prev));

      // ─────────────────────────────────────────────
      // 🔻 실서버 연동 (명세서: POST /api/daily-records/{date})
      // const body = {
      //   reflection: (data.note || data.mood)
      //     ? { content: data.note, emotion: data.mood }
      //     : undefined,
      //   routineRecords: data.routines.map((it) => ({
      //     routineId: it.id,
      //     performanceLevel: toPerformanceLevel(it.status), // api.ts 주석 함수 참고
      //   })),
      // };
      // await api.post<CommonResponse<DailyRecordResponse>>(`/api/daily-records/${data.date}`, body);
      // set({ data: { ...data, submitted: true } });
      // ─────────────────────────────────────────────
    } catch (e) {
      set({ error: "저장에 실패했어요. 잠시 후 다시 시도해 주세요." });
      throw e;
    }
  },
}));
