import React from 'react';
import { View } from 'react-native';
import Calendar from '../components/Calendar';


/**
* 임시 메인 페이지: Calendar 컴포넌트가 정상적으로 렌더되는지 확인하기 위함.
*/
const CalendarMainPage: React.FC = () => {
return (
<View className="flex-1">
<Calendar />
</View>
);
};


export default CalendarMainPage;