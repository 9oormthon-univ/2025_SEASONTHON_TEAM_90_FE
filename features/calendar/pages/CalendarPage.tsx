import React from 'react';
import { View, Text, Pressable } from 'react-native';
import MonthHeader from '../components/MonthHeader';
import CalendarGrid from '../components/CalendarGrid';
import { useCalendar } from '../hooks/useCalendar';
import { todayYMD } from '../utils/date';


/**
* 홈(캘린더) 화면 엔트리. 네비게이션 연결은 app/navigation에서 처리.
*/
const CalendarPage: React.FC = () => {
    const { currentMonth, isLoading, matrix, getDayMeta, goPrev, goNext } = useCalendar();


    const onSelectDate = (ymd: string) => {
        // TODO: 상세/기록 페이지로 이동 (딥링크 연동 시 사용)
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


export default CalendarPage;