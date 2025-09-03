// changed: Emotion 업데이트
export type Emotion = "HAPPY" | "NORMAL" | "SAD" | "EXITED";

export interface WeeklyDashboardResponse {
    code: string;
    message: string;
    data: {
        period: { start_date: string; end_date: string; label: string };
        metrics: {
            record_rate: number;
            completion_rate: number;
            partial_achievement_rate: number;
            current_streak: number;
            max_streak_this_period: number;
        };
        emotion_distribution: Partial<Record<Emotion, number>>;
        daily_completion: Array<{
            date: string; // YYYY-MM-DD
            completion_rate: number;
            partial_rate: number;
            primary_emotion: Emotion;
        }>;
        routine_performance: Array<{
            routine_id: number;
            routine_name: string;
            completion_rate: number;
            average_achievement: number;
            target_value: number;
            streak: number;
        }>;
    };
}

export interface WeeklyInsightResponse {
    // 서버 엔티티에서 insightJson 을 파싱해 아래 형태로 반환
    code: string;
    message: string;
    data: {
        summary: string;
        highlights: string[];
        suggestions: Array<{
            pattern: string;
            suggestion: string;
            tone: "gentle" | "neutral" | "direct";
        }>;
        generated_at: string; // ISO
    };
}
