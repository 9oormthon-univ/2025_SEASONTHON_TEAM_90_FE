import React, { useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoutineStore } from "../store/store";
import type { AddRoutineForm, Routine, RoutineHistoryItem } from "../types";
import { usePopupQueue } from "@features/routine/common/popupQueue";
import GrowthSuggestionModal from "@features/routine/components/GrowthSuggestionModal";

const dOnly = (s?: string) => (s ? s.slice(0, 10) : "");
const isSuccess = (x: RoutineHistoryItem) => {
  const s = String(x?.status ?? "").toUpperCase();
  return x?.completed === true || x?.done === true || s === "DONE" || s === "SUCCESS";
};
const isFailure = (x: RoutineHistoryItem) => {
  const s = String(x?.status ?? "").toUpperCase();
  return x?.completed === false || x?.done === false || s === "FAIL";
};
const todayStr = () => dOnly(new Date().toISOString());
const dateAddDays = (isoDate: string, delta: number) => {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return dOnly(d.toISOString());
};
const dateCmp = (a: string, b: string) => (a === b ? 0 : a < b ? -1 : 1);

function buildDayStatusMap(r: Routine) {
  const m = new Map<string, "success" | "failure">();
  const anchor = dOnly((r as any).lastAdjustAt); // 선택 필드일 수 있음
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
    if (anchor && dateCmp(cursor, anchor) <= 0) break;
    const v = map.get(cursor);
    if (mode === "success") {
      if (v === "success") cnt += 1;
      else break;
    } else {
      if (v === "success") break;
      cnt += 1;
    }
    cursor = dateAddDays(cursor, -1);
  }
  return cnt;
}

export function useGrowthCheck() {
  const { routines, loading, update } = useRoutineStore();
  const enqueue = usePopupQueue((s) => s.enqueue);
  const scanningRef = useRef(false);

  const scanNow = useCallback(async () => {
    if (loading || routines.length === 0) {
      console.log("[GrowthCheck] skip: loading or empty", { loading, count: routines.length });
      return;
    }
    if (scanningRef.current) {
      console.log("[GrowthCheck] skip: already scanning");
      return;
    }
    scanningRef.current = true;
    console.log("[GrowthCheck] scan:start", { routines: routines.map((r) => r.id) });

    try {
      const today = todayStr();
      const lastChecked = await AsyncStorage.getItem("growthCheckDate");
      console.log("[GrowthCheck] lastChecked =", lastChecked);
      if (lastChecked === today) {
        console.log("[GrowthCheck] already processed today");
        return;
      }

      type Cand = { r: Routine; streak: number };
      const failureCands: Cand[] = [];
      const successCands: Cand[] = [];

      for (const r of routines) {
        if (!r.growthMode || !r.growthPeriodDays) continue;
        const need = r.growthPeriodDays!;
        const { map, anchor } = buildDayStatusMap(r);

        const fs = countConsecutiveBounded(map, "failure", need, anchor);
        const ss = fs >= need ? 0 : countConsecutiveBounded(map, "success", need, anchor);

        if (fs >= need) failureCands.push({ r, streak: fs });
        else if (ss >= need) successCands.push({ r, streak: ss });
      }

      console.log("[GrowthCheck] candidates", {
        failure: failureCands.map((c) => ({ id: c.r.id, streak: c.streak })),
        success: successCands.map((c) => ({ id: c.r.id, streak: c.streak })),
      });

      if (failureCands.length === 0 && successCands.length === 0) return;

      failureCands.sort((a, b) => b.streak - a.streak);
      successCands.sort((a, b) => b.streak - a.streak);

      await AsyncStorage.setItem("growthCheckDate", today);

      const batch = [
        ...failureCands.map((c) => ({ r: c.r, kind: "dec" as const })),
        ...successCands.map((c) => ({ r: c.r, kind: "inc" as const })),
      ];
      console.log("[GrowthCheck] enqueue batch size =", batch.length);

      batch.forEach(({ r, kind }) => {
        enqueue((dismiss) => (
          <GrowthSuggestionModal
            visible
            routine={r}
            suggestionKind={kind}
            onClose={() => {
              console.log("[GrowthCheck] modal close", { id: r.id, kind });
              dismiss();
            }}
            onAdjust={async (id, action) => {
              console.log("[GrowthCheck] adjust:start", { id, kind, action });
              try {
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
                };

                await update(id, form);
                console.log("[GrowthCheck] adjust:success", { id, next });
                dismiss();
              } catch (e: any) {
                console.warn(
                  "[GrowthCheck] adjust:error",
                  e?.response?.status,
                  e?.response?.data || e,
                );
              }
            }}
          />
        ));
      });
    } catch (e) {
      console.warn("[GrowthCheck] scan:error", e);
    } finally {
      scanningRef.current = false;
      console.log("[GrowthCheck] scan:end");
    }
  }, [loading, routines, update, enqueue]);

  useEffect(() => {
    scanNow();
  }, [scanNow]);

  const resetTodayOnce = useCallback(async () => {
    await AsyncStorage.removeItem("growthCheckDate");
    console.log("[GrowthCheck] reset today marker");
  }, []);

  return { scanNow, resetTodayOnce };
}
