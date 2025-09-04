import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace('/onboarding/login');
        }, 2000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <View className="flex-1 justify-center items-center bg-[#F9F5EE]">
            <Image
                source={require('../../assets/images/logo.png')}
                className="w-32 h-32"
                resizeMode="contain"
            />
        </View>
    );
}
