import type { Emotion, DayStatus, DayAggregate, RecordDto } from '../types';

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

/**
* 일자 단위 집계.
* - status 규칙: 일자 내 레코드에 100이 하나라도 있으면 FULL, 아니고 1~99가 있으면 PARTIAL, 모두 0이면 INCOMPLETE.
* - 미기록일은 hasRecord=false로 구분 (dot 처리용).
*/
export const aggregateByDay = (records: RecordDto[]): Record<string, DayAggregate> => {
    const byDate: Record<string, RecordDto[]> = {};
    records.forEach((r) => {
        if (!byDate[r.date]) byDate[r.date] = [];
        byDate[r.date].push(r);
    });


    const out: Record<string, DayAggregate> = {};
    for (const date of Object.keys(byDate)) {
        const list = byDate[date];
        const emotions = list.map((r) => r.emotion);
        const topEmotion = pickTopEmotion(emotions);


        let status: DayStatus = 'INCOMPLETE';
        if (list.some((r) => r.completion >= 100)) status = 'FULL';
        else if (list.some((r) => r.completion > 0)) status = 'PARTIAL';


        const avg = Math.round(list.reduce((s, r) => s + r.completion, 0) / list.length);


        out[date] = {
            date,
            topEmotion,
            status,
            hasRecord: true,
            avgCompletion: isFinite(avg) ? avg : null,
        };
    }
    return out;
};