import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';

const purposes: string[] = [
    '습관 개선', '건강', '학습',
    '마음 챙김', '소비 관리', '취미',
    '식습관', '수면', '자기 관리',
];

export default function PurposeSelectScreen() {
    const [selected, setSelected] = useState<string[]>([]);
    const router = useRouter();

    const toggleSelect = (item: string) => {
        setSelected((prev) =>
            prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
        );
    };

    return (
        <View className="flex-1 bg-[#F9F5EE] px-6">
            {/* 안내 문구 */}
            <View className="items-center mt-12">
                <Text className="text-lg font-bold mb-2">
                    Habiglow 를 이용하는 이유를 알려주세요!
                </Text>
                <Text className="text-gray-500 text-sm">복수 선택할 수 있어요!</Text>
            </View>

            {/* 캐릭터 (로고 활용) */}
            <View className="items-center my-6">
                <Image
                    source={require('../../assets/images/logo.png')}
                    className="w-24 h-24"
                    resizeMode="contain"
                />
            </View>

            {/* 선택 버튼 */}
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                }}
            >
                {purposes.map((item) => (
                    <TouchableOpacity
                        key={item}
                        onPress={() => toggleSelect(item)}
                        className={`w-[30%] py-3 my-2 rounded-lg border 
                            ${selected.includes(item) ? 'bg-[#F8761F] border-[#F8761F]' : 'bg-white border-gray-300'}
                        `}
                    >
                        <Text
                            className={`text-center ${
                                selected.includes(item) ? 'text-white' : 'text-black'
                            }`}
                        >
                            {item}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* 시작하기 버튼 */}
            <TouchableOpacity
                className="bg-[#4E342E] py-4 rounded-lg mb-8"
                onPress={() => router.replace('../(tabs)/_layout')}
            >
                <Text className="text-center text-white font-bold">시작하기</Text>
            </TouchableOpacity>
        </View>
    );
}
