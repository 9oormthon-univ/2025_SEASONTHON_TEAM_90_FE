import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import { useRouter } from 'expo-router';
// ✅ Habiglow 텍스트 SVG import
import HabiglowText from '@/assets/images/Habiglow.svg';

export default function SplashScreen() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            // router.replace('/onboarding/login');
        }, 2000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <View className="flex-1 justify-center items-center bg-[#F9F5EE]">
            {/* 로고 이미지 */}
            <Image
                source={require('../../assets/images/logo.png')}
                className="w-32 h-32"
                resizeMode="contain"
            />
            {/* Habiglow 텍스트 SVG */}
            <View className="mt-4">
                <HabiglowText width={120} height={40} />
            </View>
        </View>
    );
}
