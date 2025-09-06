import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface Props {
    title: string;
    onPress?: () => void;
}

const SettingsItem = ({ title, onPress }: Props) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="mx-4 rounded-2xl shadow p-4 flex-row justify-between items-center"
            style={{ backgroundColor: '#F7F7F7' }} 
        >
            <Text
                className="text-base text-black"
                style={{ fontFamily: 'Pretendard', fontSize: 14, lineHeight: 21 }}
            >
                {title}
            </Text>
            <ChevronRight size={20} color="#999" />
        </TouchableOpacity>
    );
};

export default SettingsItem;