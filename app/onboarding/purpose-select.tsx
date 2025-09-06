import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import SelectIcon from '@/assets/images/selecticon.svg';

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
            {/* 안내 문구 (말풍선) */}
            <View className="items-center mt-28">
                <View className="bg-white rounded-2xl px-6 py-4 shadow relative">
                    <Text className=" font-bold text-center text-lg text-[#3A332A] mb-1">
                        Habiglow 를{'\n'}사용하는 이유를 알려주세요!
                    </Text>
                    <Text className="text-gray-500 text-xs text-center">
                        복수 선택할 수 있어요!
                    </Text>

                    {/* 말풍선 꼬리 (중앙 정렬) */}
                    <View className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-white rotate-45 " />
                </View>
            </View>

            {/* 캐릭터 */}
            <View className="items-center my-12">
                <SelectIcon width={200} height={170} />
            </View>

            {/* 선택 버튼 (3x3 그리드, 확대됨) */}
            <View className="flex-row flex-wrap justify-center gap-5">
                {purposes.map((item) => {
                    const isSelected = selected.includes(item);
                    return (
                        <TouchableOpacity
                            key={item}
                            onPress={() => toggleSelect(item)}
                            className={`relative w-[100px] h-[80px] rounded-xl border shadow flex justify-center items-center
                                ${isSelected ? 'bg-[#F8761F] border-[#F8761F]' : 'bg-white border-gray-200'}
                            `}
                        >
                            <Text
                                className={`text-center text-base font-medium ${
                                    isSelected ? 'text-white' : 'text-black'
                                }`}
                            >
                                {item}
                            </Text>

                            {/* 선택 아이콘 */}
                            {isSelected && (
                                <View className="absolute top-2 right-2">
                                    <SelectIcon width={22} height={22} />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* 시작하기 버튼 */}
            <View className="px-4 mt-20">
                <TouchableOpacity
                    className="bg-[#5F5548] py-6 rounded-3xl mb-6"
                    onPress={() => router.replace('../(tabs)/_layout')}
                >
                    <Text className="text-center text-white font-bold text-xl">
                        시작하기
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
