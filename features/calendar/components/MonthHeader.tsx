import React from 'react';
import { View, Text, Pressable } from 'react-native';


interface Props {
    month: string; // YYYY-MM
    onPrev: () => void;
    onNext: () => void;
}


/** 월 네비게이션 헤더 (UI 최소화) */
const MonthHeader: React.FC<Props> = ({ month, onPrev, onNext }) => {
    return (
        <View className="flex-row items-center justify-between">
            <Pressable accessibilityRole="button" onPress={onPrev}>
                <Text>{'<'}</Text>
            </Pressable>
            <Text className="text-lg font-semibold">{month}</Text>
            <Pressable accessibilityRole="button" onPress={onNext}>
                <Text>{'>'}</Text>
            </Pressable>
        </View>
    );
};


export default MonthHeader;