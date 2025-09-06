export type Emotion = "LOW" | "NORMAL" | "GOOD" | "VERY_GOOD";

/** AI 인사이트 제안(Suggestion) 개별 객체 타입 */
export interface Suggestion {
    pattern: string;
    suggestion: string;
    tone: "gentle" | "neutral" | "direct";
}

/**
 * 6.1 주간 대시보드 API 응답 (`/api/dashboard/weekly/stats`)
 * CommonApiResponse의 data 필드에 해당하는 타입
 */
export interface WeeklyDashboardData {
    period: { start_date: string; end_date: string; label: string };
    metrics: {
        record_rate: number;
        completion_rate: number;
        partial_achievement_rate: number;
        current_streak: number;
        max_streak_this_period: number;

        total_routines?: number;
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
}


/**
 * 서버에서 오는 AI 인사이트 원본 `data` 객체 타입
 * - insightJson을 포함하는 순수 서버 데이터
 */
export interface WeeklyInsightEntity {
    insightJson: any;
    updatedAt?: string;
    // insightJson에 포함될 데이터 (파싱 후에도 사용)
    summary: string;
    highlights: string[];
    suggestions: Suggestion[];
    generated_at: string;
}

/**
 * AI 인사이트 API의 전체 원본 응답 타입
 * - client.get<T>에 사용될 타입
 */
export interface WeeklyInsightApiResponse {
    code: string;
    message: string;
    data: WeeklyInsightEntity;
}

/**
 * 프론트엔드에서 최종적으로 사용할 AI 인사이트 데이터 타입
 * - JSON 파싱이 끝나고 UI에 전달될 데이터 형태입니다.
 */
export interface WeeklyInsightData {
    summary: string;
    highlights: string[];
    suggestions: Suggestion[];
    generated_at: string;
}