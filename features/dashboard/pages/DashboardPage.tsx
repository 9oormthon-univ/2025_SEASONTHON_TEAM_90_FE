import { useMemo, useState, useCallback } from "react";
import { View, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Text } from "react-native";
import TopBar from "@/components/Common/TopBar";
import WeeklyRoutine from "@/features/dashboard/components/WeeklyRoutine";
import EmotionChange from "@/features/dashboard/components/EmotionChange";
import WeeklyAiAnalyze from "@/features/dashboard/components/WeeklyAiAnalyze";
import ReportSheet from "@/features/dashboard/components/ReportSheet";
import { addDays, formatISO, parseISO, startOfWeek } from "date-fns";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Fire from "../assets/fire.svg";
import Ai from "../assets/ai.svg";
import Smile from "../assets/smile.svg";
import { getReportLabel, getWeekLabel } from "../utils/date";
import { hasEmotion } from "../utils/emotion";

// 더미 데이터 고정 사용
import { mockWeeklyDashboard, mockWeeklyInsight } from "../utils/mock";

function toISO(d: Date) {
  return formatISO(d, { representation: "date" });
}
function getCurrentWeekStartISO() {
  // 월요일 시작
  return formatISO(startOfWeek(new Date(), { weekStartsOn: 1 }), { representation: "date" });
}

// 🚩 파라미터 제거 후 단순 컴포넌트
export default function DashboardPage() {
  // 초기 주차 (항상 현재 주차 기준)
  const [weekStartISO, setWeekStartISO] = useState<string>(() => getCurrentWeekStartISO()); // 수정됨
  const [sheetVisible, setSheetVisible] = useState(false);

  // 라벨
  const weekLabel = getWeekLabel(weekStartISO);
  const reportLabel = getReportLabel(weekStartISO);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > 30) setSheetVisible(true);
    if (y <= 0) setSheetVisible(false);
  }, []);

  const currentWeekISO = useMemo(() => getCurrentWeekStartISO(), []);
  const canPrev = true;
  const canNext = useMemo(
    () => parseISO(weekStartISO) < parseISO(currentWeekISO),
    [weekStartISO, currentWeekISO],
  );

  const goPrev = () => canPrev && setWeekStartISO(toISO(addDays(parseISO(weekStartISO), -7)));
  const goNext = () => canNext && setWeekStartISO(toISO(addDays(parseISO(weekStartISO), +7)));

  // === 항상 더미 데이터 사용 ===
  const dashboardData = useMemo(() => mockWeeklyDashboard(weekStartISO), [weekStartISO]);
  const insightData = useMemo(() => mockWeeklyInsight(weekStartISO), [weekStartISO]);

  const summary = {
    completionRate: dashboardData.metrics.completion_rate,
    recordRate: dashboardData.metrics.record_rate,
    totalRoutines: dashboardData.routine_performance.length,
  };

  // 하루라도 감정 데이터 있으면 그래프 표시
  const showEmotionGraph = useMemo(
    () => dashboardData.daily_completion?.some(hasEmotion) ?? false,
    [dashboardData.daily_completion]
  );

  // EmotionChange 하단 문구 = AI 요약(더미)
  const emotionSummaryText = insightData?.summary ?? "";

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#f3efe3" }} edges={["top"]}>
      <StatusBar translucent backgroundColor="transparent" style="dark" />
      <TopBar title="대시보드" bgColor="#f3efe3" />
      <ScrollView className="flex-1 px-4" onScroll={onScroll} scrollEventThrottle={16}>
        <View className="flex-row gap-[8px] items-center my-4">
          <Fire />
          <Text className="text-[#5F5548] text-xl">루틴 실행률</Text>
        </View>

        <WeeklyRoutine
          weekLabel={weekLabel}
          completionRate={summary.completionRate}
          routines={dashboardData.routine_performance}
        />

        <View className="flex-row gap-[8px] items-center my-4">
          <Smile />
          <Text className="text-[#5F5548] text-xl">감정 변화</Text>
        </View>

        {showEmotionGraph ? (
          <EmotionChange
            daily={dashboardData.daily_completion}
            summaryText={emotionSummaryText}
          />
        ) : (
          <View className="px-6 py-8 bg-white rounded-xl">
            <Text className="text-center text-[16px] text-[#3A332A]">
              감정 데이터가 없어요.
            </Text>
          </View>
        )}

        <View className="flex-row gap-[8px] items-center my-4">
          <Ai />
          <Text className="text-[#5F5548] text-xl">AI 주간 분석</Text>
        </View>

        <WeeklyAiAnalyze
          weekStartISO={weekStartISO}
          routines={dashboardData.routine_performance}
        />

        <View className="h-10" />
      </ScrollView>

      <ReportSheet
        visible={sheetVisible}
        label={reportLabel}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={goPrev}
        onNext={goNext}
      />
    </SafeAreaView>
  );
}
