import React from 'react';
import { View, Text, Pressable } from 'react-native';
import LeftArrow from '@features/calendar/assets/LeftArrow.svg'
import RightArrow from '@features/calendar/assets/RightArrow.svg'
import { useRouter } from 'expo-router';
import { todayYMD } from '../utils/date';

interface Props {
    month: string; // YYYY-MM
    onPrev: () => void;
    onNext: () => void;
}

const MONTHS_EN = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/** 월 네비게이션 헤더 (UI 최소화) */
const MonthHeader: React.FC<Props> = ({ month, onPrev, onNext }) => {
    const router = useRouter();
    const [y, m] = month.split('-').map((v) => parseInt(v, 10));
    const monthName = MONTHS_EN[(m - 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11];
    return (
        <View className="py-[10px] px-[10px]" style={{ backgroundColor: '#816E57' }}>
            <View className="flex-row items-center justify-between ">
                {/* 로고(임시 텍스트) */}
                <Text className="text-[18px]">로고</Text>

                {/* 월 이동 + 타이틀(2줄) */}
                <View className="flex-row items-center gap-3">
                    <View className="items-center">
                        {/* 첫 줄: 연도 */}
                        <Text className="tracking-widest font-normal text-[11px] leading-[13px] text-center align-middle" style={{ color: '#F7F0DE' }}>{y}</Text>
                        <View className='flex-row gap-[8px]'>
                            <Pressable onPress={onPrev} accessibilityRole="button">
                                <LeftArrow />
                            </Pressable>
                            {/* 둘째 줄: 월(영문) */}
                            <Text className="text-[24px] font-choco" style={{ color: '#F7F0DE' }}>{monthName}</Text>
                            <Pressable onPress={onNext} accessibilityRole="button">
                                <RightArrow />
                            </Pressable>
                        </View>
                    </View>
                </View>
                {/* 오늘의회고 (오늘 날짜로 이동만) */}
                <Pressable
                    onPress={() => router.push({ pathname: '/retrospect', params: { date: todayYMD() } })}
                    accessibilityRole="button"
                >
                    <Text className="text-[20px] font-nanum" style={{ color: '#FF9752' }}>오늘의회고</Text>
                </Pressable>
            </View>
        </View>
    );
};


export default MonthHeader;