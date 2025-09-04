import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 justify-center items-center bg-[#F9F5EE]">
            <Image
                source={require('../../assets/images/logo.png')}
                className="w-24 h-24 mb-16"
                resizeMode="contain"
            />

            <TouchableOpacity
                className="flex-row items-center bg-[#FEE500] px-6 py-4 rounded-md"
                onPress={() => router.replace('/onboarding/purpose-select')}
            >
                <Text className="text-black font-medium">카카오 계정으로 시작하기</Text>
            </TouchableOpacity>
        </View>
    );
}
