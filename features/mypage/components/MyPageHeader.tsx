import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LogoutIcon from '../assets/logout.svg';

interface MyPageHeaderProps {
    onPressLogout: () => void;
}

export default function MyPageHeader({ onPressLogout }: MyPageHeaderProps) {
    return (
        <View className="flex-row justify-between items-center px-6 py-3 pt-14">
            <Text className="text-lg font-bold">마이페이지</Text>
            <TouchableOpacity onPress={onPressLogout}>
                <LogoutIcon width={24} height={24} />
            </TouchableOpacity>
        </View>
    );
}
