import React from 'react';
import { View, Text } from 'react-native';

const TabTwoScreen: React.FC = () => {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Second Tab</Text>
            <Text style={{ opacity: 0.6, marginTop: 8, fontSize: 12 }}>임시 화면</Text>
        </View>
    );
};

export default TabTwoScreen;
