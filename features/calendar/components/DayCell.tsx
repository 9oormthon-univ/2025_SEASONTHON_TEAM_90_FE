import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { Emotion, DayStatus, DayAggregate } from '../types';


interface Props {
    ymd: string;
    day: number;
    inMonth: boolean;
    aggregate?: DayAggregate; // 없으면 미기록(점)
    isToday?: boolean;
    onPress?: (ymd: string) => void;
}


const EMOJI: Record<Emotion, string> = {
    HAPPY: '😊',
    NEUTRAL: '😐',
    SAD: '😢',
    ANGRY: '😠',
};


const statusDot = (s: DayStatus | undefined) => {
    if (!s) return '·'; // 미기록 dot
    if (s === 'FULL') return '●';
    if (s === 'PARTIAL') return '◐';
    return '○'; // INCOMPLETE
};


/** 날짜 셀 (스타일은 최소, 의미만 제공) */
const DayCell: React.FC<Props> = ({ ymd, day, inMonth, aggregate, isToday, onPress }) => {
    const emoji = aggregate?.topEmotion ? EMOJI[aggregate.topEmotion] : '·';
    const dot = statusDot(aggregate?.status);


    return (
        <Pressable
            accessibilityRole="button"
            onPress={() => onPress?.(ymd)}
            className="items-center justify-center p-2"
        >
            <View className={`items-center justify-center ${!inMonth ? 'opacity-40' : ''}`}>
                <Text className={`text-xs ${isToday ? 'font-bold' : ''}`}>{day}</Text>
                <Text>{emoji}</Text>
                <Text className="text-xs">{dot}</Text>
            </View>
        </Pressable>
    );
};


export default DayCell;