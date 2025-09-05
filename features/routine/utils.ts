// features/routine/utils/index.ts
import type { Routine } from "./types";

export type Suggestion = "increase" | "keep" | "decrease";
export interface OverloadResult {
  suggestion: Suggestion;
  nextValue: number;
  reason: string;
}

/** 최근 기록 성공률 기반 다음 목표 제안 */
export function calculateSuggestion(r: Routine, lookback = 7): OverloadResult {
  const current = r.goalValue ?? 1;
  const growthMode = !!r.growthMode;
  const hist = (r.history ?? []).slice(-lookback);

  if (!growthMode) {
    return { suggestion: "keep", nextValue: current, reason: "성장모드 아님" };
  }
  if (!hist.length) {
    return { suggestion: "keep", nextValue: current, reason: "데이터 부족" };
  }

  const success = hist.filter((h) => h.completed).length;
  const rate = success / hist.length;

  if (rate >= 0.8) {
    return {
      suggestion: "increase",
      nextValue: Math.max(1, Math.round(current * 1.1)),
      reason: `성공률 ${(rate * 100).toFixed(0)}%`,
    };
  }
  if (rate <= 0.4) {
    return {
      suggestion: "decrease",
      nextValue: Math.max(1, Math.floor(current * 0.9)),
      reason: `성공률 ${(rate * 100).toFixed(0)}%`,
    };
  }
  return { suggestion: "keep", nextValue: current, reason: `성공률 ${(rate * 100).toFixed(0)}%` };
}

/** 주기/증가치로 n일치 목표 배열 생성 (예: base=30, period=3, inc=1 ⇒ 30,30,31,31,32,…) */
export function generateProgression(
  base: number,
  period: number,
  increment: number,
  totalDays: number,
): number[] {
  const arr: number[] = [];
  for (let d = 0; d < totalDays; d++) {
    const step = Math.floor(d / Math.max(1, period));
    arr.push(base + step * increment);
  }
  return arr;
}

// 호환용 별칭 (원 코드에서 쓰던 이름 대응)
export const calculateProgressiveOverload = calculateSuggestion;
