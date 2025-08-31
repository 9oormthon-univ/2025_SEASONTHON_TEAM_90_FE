// app/modal.tsx
import React from 'react';
import { View, Text } from 'react-native';

const ModalScreen: React.FC = () => {
  return (
    <View style={{ flex: 1, padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>About</Text>
      <Text style={{ lineHeight: 20 }}>
        이 화면은 모달 프리젠테이션으로 표시됩니다. 탭 헤더 우측의 (i) 버튼으로 진입합니다.
      </Text>
    </View>
  );
};

export default ModalScreen;
