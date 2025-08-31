import { View, Text } from 'react-native';
import MonthHeader from './MonthHeader';
import CalendarGrid from './CalendarGrid';
import { useCalendar } from '../hooks/useCalendar';
import { todayYMD } from '../utils/date';
import { getRoutines } from '../api/getRoutines';
import { Alert } from 'react-native';
import GridPaper from './GridPaper';

export type CalendarViewProps = { variant?: 'month' | 'week' };
/** 캘린더 컴포넌트 */
const CalendarView: React.FC<CalendarViewProps> = ({ variant = 'month' }) => {
    const { currentMonth, isLoading, matrix, getDayMeta, goPrev, goNext } = useCalendar();
    const today = todayYMD();

    const handleSelect = async (ymd: string) => {
        if (ymd === today) {
            try {
                const { routines, totalCount } = await getRoutines();
                Alert.alert('오늘의 루틴', `총 루틴: ${totalCount}\n첫번째: ${routines[0]?.title ?? '-'}`);
            } catch {
                Alert.alert('오류', '루틴을 불러오지 못했습니다.');
            }
        } else {
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
                    <GridPaper key={currentMonth} cell={24} majorEvery={5} />
                    <CalendarGrid matrix={matrix} getDayMeta={getDayMeta} onSelectDate={handleSelect} variant={variant} />
                </View>
            )}
        </View>
    );
};


export default CalendarView;