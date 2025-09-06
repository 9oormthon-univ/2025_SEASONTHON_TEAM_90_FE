import type { Emotion, WeeklyDashboardData } from "../types";

/** LOW(0) → NORMAL(1) → GOOD(2) → VERY_GOOD(3) */
export const EMOTION_ORDER: Emotion[] = ["LOW", "NORMAL", "GOOD", "VERY_GOOD"];

export function emotionFromScore(score: number): Emotion {
    if (score <= 24) return "LOW";
    if (score <= 49) return "NORMAL";
    if (score <= 74) return "GOOD";
    return "VERY_GOOD";
}

export function emotionToY(emotion: Emotion, minTop = 10, maxBottom = 90): number {
    const idx = EMOTION_ORDER.indexOf(emotion);
    const t = idx / (EMOTION_ORDER.length - 1); // 0..1
    return maxBottom - t * (maxBottom - minTop);
}

/** 서버 키(예: HAPPY/SOSO 등) → 프론트 Emotion 매핑 */
export function normalizeEmotionKey(key: string): Emotion | null {
    const k = key.toUpperCase();
    if (["VERY_GOOD", "VERYGOOD", "EXCELLENT", "HAPPY"].includes(k)) return "VERY_GOOD";
    if (["GOOD"].includes(k)) return "GOOD";
    if (["NORMAL", "SOSO", "OK"].includes(k)) return "NORMAL";
    if (["LOW", "BAD", "SAD"].includes(k)) return "LOW";
    return null;
}

/** 하루 데이터에 '감정'이 실제로 존재하는가? (점수 or 라벨) */
export function hasEmotion(
    d: WeeklyDashboardData["daily_completion"][number]
): boolean {
    const score = (d as any)?.primary_emotion_score ?? (d as any)?.primaryEmotionScore;
    if (typeof score === "number" && score >= 0 && score <= 100) return true;

    const e = (d as any)?.primary_emotion;
    return EMOTION_ORDER.includes(e);
}
