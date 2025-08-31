import type { Emotion, DayStatus } from '../types';

/** 감정 우선순위: 기쁨 > 평범 > 슬픔 > 화남 */
const EMOTION_PRIORITY: Record<Emotion, number> = {
    HAPPY: 4,
    NEUTRAL: 3,
    SAD: 2,
    ANGRY: 1,
};

export const pickTopEmotion = (emotions: Emotion[]): Emotion | null => {
    if (emotions.length === 0) return null;
    return emotions.slice().sort((a, b) => EMOTION_PRIORITY[b] - EMOTION_PRIORITY[a])[0] ?? null;
};

/** 0 -> INCOMPLETE, 1~99 -> PARTIAL, 100 -> FULL */
export const mapCompletionToStatus = (v: number): DayStatus => {
    if (v <= 0) return 'INCOMPLETE';
    if (v >= 100) return 'FULL';
    return 'PARTIAL';
};
