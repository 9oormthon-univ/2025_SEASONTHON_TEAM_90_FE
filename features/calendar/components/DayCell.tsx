import React from 'react';
import { Pressable, Text, View } from 'react-native';
import DayCompletionIcon from './DayCompletionIcon';

type Props = {
    day: Date;
    ymd: string;
    inMonth: boolean;
    isToday: boolean;
    completion: number | null;    // avgCompletion
    hasRecord: boolean;
    onPress: (ymd: string) => void;
};

const DayCell: React.FC<Props> = ({ day, ymd, inMonth, completion, hasRecord, onPress, isToday }) => {
    if (!inMonth) {
        // 다른 달 날짜는 보이지 않음(빈 칸)
        return <View className="flex-1 p-2" />;
    }
    const num = day.getDate(); // 날짜
    const numEl = isToday ? (
        // 오늘 스타일 : rounded-full h-[21px] w-[21px] bg[#816E57] text[#F7F0DE]
        <View className="items-center justify-center rounded-full" style={{ width: 21, height: 21, backgroundColor: '#816E57' }}>
            <Text className="font-choco text-[14px]" style={{ color: '#F7F0DE' }}>{num}</Text>
        </View>
    ) : (
        // 오늘이 아닌 경우 : 글자색만
        <Text className="font-choco text-[14px]" style={{ color: '#5F5548' }}>{num}</Text>
    );
    return (
        <Pressable className="items-center flex-1 px-[10px]" onPress={() => onPress(ymd)} accessibilityRole="button">
            {numEl}
            <View >
                <DayCompletionIcon value={completion} hasRecord={hasRecord} />
            </View>
        </Pressable>
    );
};

export default DayCell;
