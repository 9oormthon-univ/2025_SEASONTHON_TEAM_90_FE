import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LogOut } from 'lucide-react-native';

const MyPageHeader = () => {
    return (
        <View className="flex-row justify-between items-center px-4 pt-14 pb-4 bg-[#F2EFE6]">
            <Text className="text-lg font-semibold text-black">마이페이지</Text>
            <TouchableOpacity onPress={() => console.log('로그아웃')}>
                <LogOut size={20} color="#333" />
            </TouchableOpacity>
        </View>
    );
};

export default MyPageHeader;
