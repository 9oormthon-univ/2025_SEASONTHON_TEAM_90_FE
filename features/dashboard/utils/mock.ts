import { addDays, format } from "date-fns";
import type { WeeklyDashboardData, WeeklyInsightData, Emotion } from "../types";

const EMOTIONS: Emotion[] = ["LOW", "NORMAL", "GOOD", "VERY_GOOD"];

function pickEmotion(i: number): Emotion {
    return EMOTIONS[i % EMOTIONS.length];
}

/** 주간 대시보드 더미 (weekStartISO 기준 생성) */
export function mockWeeklyDashboard(weekStartISO: string): WeeklyDashboardData {
    const start = new Date(weekStartISO);
    const end = addDays(start, 6);

    const daily = Array.from({ length: 7 }).map((_, i) => {
        const d = addDays(start, i);
        const em = pickEmotion(i);
        return {
            date: format(d, "yyyy-MM-dd"),
            completion_rate: Math.max(50, 85 - i * 3),
            partial_rate: Math.min(30, 5 + i * 3),
            primary_emotion: em,
            // 참고: 점수 기반 API 대응 테스트용 (있어도 되고 없어도 됨)
            // primary_emotion_score: 25 + i * 10,
        };
    });

    // 감정 분포 카운팅
    const emotion_distribution: Partial<Record<Emotion, number>> = {};
    for (const d of daily) {
        emotion_distribution[d.primary_emotion] =
            (emotion_distribution[d.primary_emotion] ?? 0) + 1;
    }

    return {
        period: {
            start_date: format(start, "yyyy-MM-dd"),
            end_date: format(end, "yyyy-MM-dd"),
            label: "시연 주차",
        },
        metrics: {
            record_rate: 88,
            completion_rate: 74,
            partial_achievement_rate: 12,
            current_streak: 4,
            max_streak_this_period: 5,
        },
        emotion_distribution,
        daily_completion: daily,
        routine_performance: [
            { routine_id: 1, routine_name: "아침 러닝", completion_rate: 86, average_achievement: 0.82, target_value: 1, streak: 3 },
            { routine_id: 2, routine_name: "물 2L", completion_rate: 78, average_achievement: 0.76, target_value: 1, streak: 5 },
            { routine_id: 3, routine_name: "독서", completion_rate: 72, average_achievement: 0.61, target_value: 1, streak: 2 },
        ],
    };
}

/** 주간 AI 인사이트 더미 */
export function mockWeeklyInsight(_weekStartISO: string): WeeklyInsightData {
    return {
        summary: "이번 주는 전반적으로 안정적이에요. 특히 수·목에 집중력이 좋았어요!",
        highlights: [
            "수요일 완료율 최고치 갱신",
            "아침 루틴(러닝) 꾸준함 유지",
            "주말엔 휴식 위주 패턴",
        ],
        suggestions: [
            {
                pattern: "목·금 피로 누적",
                suggestion: "금요일 저녁 루틴 강도를 10% 낮춰보세요.",
                tone: "gentle",
            },
            {
                pattern: "물 섭취량 주중 후반 감소",
                suggestion: "오후 3시에 물 마시기 알림을 켜보세요.",
                tone: "neutral",
            },
        ],
        generated_at: new Date().toISOString(),
    };
}
