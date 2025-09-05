import { View, Text } from "react-native";
import MonthHeader from "./MonthHeader";
import CalendarGrid from "./CalendarGrid";
import { useCalendar } from "../hooks/useCalendar";
import { todayYMD } from "../utils/date";
import { getRoutines } from "../api/getRoutines";
import { Alert } from "react-native";

export type CalendarViewProps = { variant?: "month" | "week" };
/** 캘린더 컴포넌트 */
const CalendarView: React.FC<CalendarViewProps> = ({ variant = "month" }) => {
  const { currentMonth, isLoading, matrix, getDayMeta, goPrev, goNext, goToday } = useCalendar();
  const today = todayYMD();

  const handleSelect = async (ymd: string) => {
    // 문자열 비교로도 OK(YYYY-MM-DD 형식)
    if (ymd >= today) {
      try {
        const { routines, totalCount } = await getRoutines(ymd);
        const first = routines[0]?.title ?? '-';
        Alert.alert(`${ymd} 루틴`, `총 ${totalCount}개\n첫번째: ${first}`);
      } catch {
        Alert.alert('오류', `${ymd} 루틴 조회 실패`);
      }
      return;
    }
    // 과거 날짜 → 회고 페이지 이동
    const { useRouter } = await import('expo-router');
    const router = useRouter();
    router.push({ pathname: '/retrospect', params: { date: ymd } });
  };

  return (
    <View className="flex-1">
      <MonthHeader month={currentMonth} onPrev={goPrev} onNext={goNext} onGoToday={goToday} />
      {isLoading ? (
        <Text className="mt-2">Loading...</Text>
      ) : (
        <View className="relative flex-1 bg-[#f2efe6]">
          {/* <GridPaper key={currentMonth} cell={24} majorEvery={5} /> */}
          <CalendarGrid
            matrix={matrix}
            getDayMeta={getDayMeta}
            onSelectDate={handleSelect}
            variant={variant}
          />
        </View>
      )}
    </View>
  );
};

export default CalendarView;
