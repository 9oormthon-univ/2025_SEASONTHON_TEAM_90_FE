import React from 'react';
import { View, Text } from 'react-native';

const StatsCard = () => {
    return (
        <View className="flex-row justify-between items-center">
            {/* 최대 연속 성공일 */}
            <View className="items-center flex-1">
                <Text
                    className="font-bold text-[22px] leading-[22px] text-black text-center"
                    style={{ fontFamily: 'Pretendard' }}
                >
                    50일
                </Text>
                <Text className="text-xs text-gray-500 mt-1">최대 연속 성공일</Text>
            </View>

            {/* 구분선 */}
            <View style={{ width: 1.5, height: 50, backgroundColor: '#D8D6CF' }} />

            {/* 평균 성공률 */}
            <View className="items-center flex-1">
                <Text
                    className="font-bold text-[22px] leading-[22px] text-center"
                    style={{ fontFamily: 'Pretendard', color: '#F8761F' }}
                >
                    73%
                </Text>
                <Text className="text-xs text-gray-500 mt-1">평균 성공률</Text>
            </View>
        </View>
    );
};

export default StatsCard;
