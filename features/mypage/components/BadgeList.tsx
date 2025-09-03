import React from 'react';
import { View, Text } from 'react-native';

const badges = [1, 2, 3, 4]; // 추후 Zustand/서버 값으로 교체 가능

const BadgeList = () => {
    return (
        <View className="mt-4 flex-row justify-around">
            {badges.map((_, idx) => (
                <View key={idx} className="items-center">
                    <View className="w-14 h-14 rounded-full border border-gray-300 justify-center items-center">
                        <Text className="text-gray-300 text-4xl leading-none">★</Text>
                    </View>
                    <Text className="mt-1 text-xs text-gray-500">뱃지</Text>
                </View>
            ))}
        </View>
    );
};

export default BadgeList;
