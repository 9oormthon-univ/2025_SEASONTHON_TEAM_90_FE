// features/routine/hooks/useGrowthCheck.tsx
import React, { useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoutineStore } from "../store/store";
import type { AddRoutineForm, Routine, RoutineHistoryItem } from "../types";
import { usePopupQueue } from "@features/routine/common/popupQueue";
import GrowthSuggestionModal from "@features/routine/components/GrowthSuggestionModal";

/** yyyy-MM-dd만 사용 */
const dOnly = (s?: string) => (s ? s.slice(0, 10) : "");

/** 성공/실패 판정 (호환) */
const isSuccess = (x: RoutineHistoryItem) => {
  const s = String(x?.status ?? "").toUpperCase();
  return x?.completed === true || x?.done === true || s === "DONE" || s === "SUCCESS";
};
const isFailure = (x: RoutineHistoryItem) => {
  const s = String(x?.status ?? "").toUpperCase();
  return x?.completed === false || x?.done === false || s === "FAIL";
};

/** 날짜 유틸 */
const todayStr = () => dOnly(new Date().toISOString());
const dateAddDays = (isoDate: string, delta: number) => {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return dOnly(d.toISOString());
};
const dateCmp = (a: string, b: string) => (a === b ? 0 : a < b ? -1 : 1);

function buildDayStatusMap(r: Routine) {
  const m = new Map<string, "success" | "failure">();
  const anchor = dOnly(r.lastAdjustAt);
  const hist = Array.isArray(r.history) ? r.history! : [];
  for (const it of hist) {
    const d = dOnly(it?.date);
    if (!d) continue;
    if (anchor && dateCmp(d, anchor) <= 0) continue;
    if (isSuccess(it)) m.set(d, "success");
    else if (isFailure(it) && !m.has(d)) m.set(d, "failure");
  }
  return { map: m, anchor };
}

/** today 이하 최신 기록일 */
function latestRecordedOnOrBefore(map: Map<string, "success" | "failure">, upper: string) {
  let latest: string | null = null;
  for (const d of map.keys()) {
    if (dateCmp(d, upper) > 0) continue;
    if (!latest || dateCmp(d, latest) > 0) latest = d;
  }
  return latest;
}

function countConsecutiveBounded(
  map: Map<string, "success" | "failure">,
  mode: "success" | "failure",
  need: number,
  anchor?: string | null,
) {
  const upper = todayStr();
  const start = latestRecordedOnOrBefore(map, upper) ?? upper;
  let cnt = 0;
  let cursor = start;
  for (let step = 0; step < need; step++) {
    if (anchor && dateCmp(cursor, anchor) <= 0) break; // 앵커 이전 금지
    const v = map.get(cursor);
    if (mode === "success") {
      if (v === "success") cnt += 1;
      else break; // 실패/미기록 → 끊김
    } else {
      if (v === "success") break; // 성공이면 끊김
      cnt += 1; // 실패/미기록 → 실패로 카운트
    }
    cursor = dateAddDays(cursor, -1);
  }
  return cnt;
}

/** 훅: 성장 제안 팝업을 전역 팝업 큐에 '배치'로 enqueue (실패들 → 성공들 순서로 모두) */
export function useGrowthCheck() {
  const { routines, loading, update } = useRoutineStore();
  const enqueue = usePopupQueue((s) => s.enqueue);

  /** 중복 스캔 방지 */
  const scanningRef = useRef(false);

  /** 후보 스캔 + 배치 enqueue (하루 1회) */
  const scanNow = useCallback(async () => {
    if (loading || routines.length === 0) return;
    if (scanningRef.current) return;
    scanningRef.current = true;

    try {
      const today = todayStr();
      const lastChecked = await AsyncStorage.getItem("growthCheckDate");
      if (lastChecked === today) return; // 오늘 이미 배치 처리됨

      type Cand = { r: Routine; streak: number };
      const failureCands: Cand[] = [];
      const successCands: Cand[] = [];

      for (const r of routines) {
        if (!r.growthMode || !r.growthPeriodDays) continue;

        const need = r.growthPeriodDays!;
        const { map, anchor } = buildDayStatusMap(r);

        // 1) 연속 실패(미기록 포함) — 우선순위 높음
        const fs = countConsecutiveBounded(map, "failure", need, anchor);
        if (fs >= need) {
          failureCands.push({ r, streak: fs });
          continue; // 실패 후보면 성공은 안 봐도 됨
        }

        // 2) 연속 성공
        const ss = countConsecutiveBounded(map, "success", need, anchor);
        if (ss >= need) {
          successCands.push({ r, streak: ss });
        }
      }

      // 후보가 하나도 없으면 종료
      if (failureCands.length === 0 && successCands.length === 0) return;

      // 정렬: 각 그룹 내 streak 긴 것 우선
      failureCands.sort((a, b) => b.streak - a.streak);
      successCands.sort((a, b) => b.streak - a.streak);

      // ✅ 하루 1회 제한: 이번 배치를 오늘자로 마킹
      await AsyncStorage.setItem("growthCheckDate", today);

      // 실패들 → 성공들 순으로 모두 큐에 넣기
      const batch = [
        ...failureCands.map((c) => ({ r: c.r, kind: "dec" as const })),
        ...successCands.map((c) => ({ r: c.r, kind: "inc" as const })),
      ];

      batch.forEach(({ r, kind }) => {
        enqueue((dismiss) => (
          <GrowthSuggestionModal
            visible
            routine={r}
            suggestionKind={kind}
            onClose={dismiss}
            onAdjust={async (id, action) => {
              // 버튼 가드: 제안 종류에 맞는 버튼만
              if (kind === "inc" && action === "dec") return;
              if (kind === "dec" && action === "inc") return;

              const cur = r.goalValue ?? 0;
              const step = r.growthIncrement ?? 0;
              let next = cur;
              if (action === "inc") next = cur + step;
              if (action === "dec") next = Math.max(1, cur - step);

              const form: AddRoutineForm = {
                title: r.title,
                category: r.category,
                growthMode: !!r.growthMode,
                goalType: r.growthMode ? r.goalType : undefined,
                goalValue: r.growthMode ? next : undefined,
                growthPeriodDays: r.growthPeriodDays,
                growthIncrement: r.growthIncrement,
                // 조정 시 새 사이클 시작: 원하면 아래 주석 해제
                // lastAdjustAt: new Date().toISOString(),
              };

              await update(id, form);
              dismiss(); // 닫으면 큐가 다음 팝업으로 진행
            }}
          />
        ));
      });
    } finally {
      scanningRef.current = false;
    }
  }, [loading, routines, update, enqueue]);

  /** 화면 진입 시 자동 1회 스캔 */
  useEffect(() => {
    scanNow();
  }, [scanNow]);

  /** 테스트 편의: 오늘 1회 제한 해제 */
  const resetTodayOnce = useCallback(async () => {
    await AsyncStorage.removeItem("growthCheckDate");
  }, []);

  return { scanNow, resetTodayOnce };
}
