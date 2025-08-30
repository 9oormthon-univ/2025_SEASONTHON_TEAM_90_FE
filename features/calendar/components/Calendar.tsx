import { View, Text, Pressable } from 'react-native';
import MonthHeader from './MonthHeader';
import CalendarGrid from './CalendarGrid';
import { useCalendar } from '../hooks/useCalendar';
import { todayYMD } from '../utils/date';

/**
* Calendar UI 컴포넌트 (상태/훅 포함).
*/
const Calendar: React.FC = () => {
    const { currentMonth, isLoading, matrix, getDayMeta, goPrev, goNext } = useCalendar();


    const onSelectDate = (ymd: string) => {
        console.log('select', ymd);
    };


    const onRecordToday = () => {
        const today = todayYMD();
        onSelectDate(today);
    };


    return (
        <View className="flex-1 p-4">
            <MonthHeader month={currentMonth} onPrev={goPrev} onNext={goNext} />
            {isLoading ? (
                <Text className="mt-2">Loading...</Text>
            ) : (
                <CalendarGrid matrix={matrix} getDayMeta={getDayMeta} onSelectDate={onSelectDate} />
            )}


            {/* 오늘 기록 CTA */}
            <Pressable className="items-center p-3 mt-4 bg-gray-200 rounded-2xl" onPress={onRecordToday}>
                <Text>오늘 기록하기</Text>
            </Pressable>
        </View>
    );
};


export default Calendar;