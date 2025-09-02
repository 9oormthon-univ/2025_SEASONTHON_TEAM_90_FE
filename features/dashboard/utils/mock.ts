import type { WeeklyDashboardResponse, WeeklyInsightResponse } from "../types";

export const mockWeekStart = "2024-08-26";
export const mockFirstWeek = "2024-08-12";
export const mockCurrentWeek = "2024-09-02";

export const mockWeeklyDashboard: WeeklyDashboardResponse["data"] = {
    period: { start_date: "2024-08-26", end_date: "2024-09-01", label: "이번 주" },
    metrics: {
        record_rate: 85.7,
        completion_rate: 73,
        partial_achievement_rate: 14.3,
        current_streak: 3,
        max_streak_this_period: 5,
    },
    // changed: ANGRY 제거
    emotion_distribution: { HAPPY: 3, NORMAL: 3, SAD: 1, EXITED: 0 },
    daily_completion: [
        { date: "2024-08-26", completion_rate: 100, partial_rate: 0, primary_emotion: "HAPPY" },
        { date: "2024-08-27", completion_rate: 60, partial_rate: 10, primary_emotion: "NORMAL" },
        { date: "2024-08-28", completion_rate: 70, partial_rate: 20, primary_emotion: "HAPPY" },
        { date: "2024-08-29", completion_rate: 80, partial_rate: 10, primary_emotion: "SAD" },
        { date: "2024-08-30", completion_rate: 60, partial_rate: 20, primary_emotion: "EXITED" },
        { date: "2024-08-31", completion_rate: 80, partial_rate: 0, primary_emotion: "HAPPY" },
        { date: "2024-09-01", completion_rate: 50, partial_rate: 10, primary_emotion: "NORMAL" },
    ],
    routine_performance: [
        { routine_id: 101, routine_name: "건강", completion_rate: 85, average_achievement: 7.2, target_value: 8, streak: 3 },
        { routine_id: 102, routine_name: "공부", completion_rate: 67, average_achievement: 4.7, target_value: 7, streak: 2 },
        { routine_id: 103, routine_name: "운동", completion_rate: 74, average_achievement: 5.1, target_value: 7, streak: 1 },
    ],
};

export const mockWeeklyInsight: WeeklyInsightResponse["data"] = {
    summary: "이번 주 기록률 85.7%로 지난주보다 10% 향상!",
    highlights: ["물 마시기 3일 연속 완주", "운동 달성률 70% 유지"],
    suggestions: [
        { pattern: "월요일 기록률 낮음", suggestion: "월요일 목표를 조금 낮춰 시작해보세요.", tone: "gentle" },
    ],
    generated_at: "2024-08-27T23:00:00Z",
};
