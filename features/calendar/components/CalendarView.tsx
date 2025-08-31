import { View, Text, Pressable } from 'react-native';
import MonthHeader from './MonthHeader';
import CalendarGrid from './CalendarGrid';
import { useCalendar } from '../hooks/useCalendar';
import { todayYMD } from '../utils/date';
import { getRoutines } from '../api/getRoutines';
import { Alert } from 'react-native';
import GridPaper from './GridPaper';

export interface CalendarViewProps {
    /** 날짜 선택 시 호출 (YYYY-MM-DD) */
    onSelectDate?: (ymd: string) => void;
    variant?: 'month' | 'week';
}
/** 캘린더 컴포넌트 */
const CalendarView: React.FC<CalendarViewProps> = ({ variant = 'month', onSelectDate }) => {
    const { currentMonth, isLoading, matrix, getDayMeta, goPrev, goNext } = useCalendar();
    const today = todayYMD();

    const handleSelect = async (ymd: string) => {
        if (ymd === today) {
            // [추가] 오늘 루틴 조회 (페이지 이동 없이 Alert로 결과만 보여줌)
            try {
                const { routines, summary } = await getRoutines(today, true);
                const msg = [
                    `총 루틴: ${summary?.total_routines ?? routines.length}`,
                    `완료: ${summary?.completed_today ?? 0}`,
                    `부분완료: ${summary?.partial_completed_today ?? 0}`,
                    `미시작: ${summary?.not_started_today ?? 0}`,
                ].join('\n');
                Alert.alert('오늘의 루틴', msg);
            } catch {
                Alert.alert('오류', '오늘의 루틴을 불러오지 못했습니다.');
            }
        } else {
            // 오늘이 아닌 날짜 → 회고 페이지로 이동 (페이지 이동만 구현)
            const { useRouter } = await import('expo-router');
            const router = useRouter();
            router.push({ pathname: '/retrospect', params: { date: ymd } });
        }
    };

    return (
        <View className="flex-1">
            <MonthHeader month={currentMonth} onPrev={goPrev} onNext={goNext} />
            {isLoading ? (
                <Text className="mt-2">Loading...</Text>
            ) : (
                <View className='relative flex-1'>
                    <GridPaper cell={24} majorEvery={5} />
                    <CalendarGrid matrix={matrix} getDayMeta={getDayMeta} onSelectDate={handleSelect} variant={variant} />
                </View>
            )}
        </View>
    );
};


export default CalendarView;