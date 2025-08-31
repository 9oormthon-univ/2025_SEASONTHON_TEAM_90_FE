import React from 'react';
import { View,Text } from 'react-native';
import CalendarView from '../components/CalendarView';

const CalendarDemoPage: React.FC = () => {
    // 모달이 아니라면 기본 'month'
    return (
        <View className="flex-1" style={{ backgroundColor: '#F7F0DE' }}>
            <CalendarView variant="month" />
        </View>
    );
};

export default CalendarDemoPage;
