import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import SadIcon from '../assets/sad.svg';
import { useSessionStore } from '@/features/auth/store/session.store';
import client, { setAccessToken, setRefreshToken } from '@/shared/api/client';

interface LogoutModalProps {
  visible: boolean;
  onSuccess: () => void; // 부모에서 후처리
  onCancel: () => void;
}

export default function LogoutModal({ visible, onSuccess, onCancel }: LogoutModalProps) {
  const { user } = useSessionStore();

  const handleLogout = async () => {
    try {
      await client.post('/api/auth/logout');
    } catch (err) {
      console.warn('⚠️ 서버 로그아웃 실패 (무시 가능):', err);
    } finally {
      await setAccessToken(null);
      await setRefreshToken(null);
      onSuccess();
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View className="flex-1 justify-center items-center bg-black/40">
        <View className="bg-white rounded-3xl p-10 w-96 items-center">
          <Text className="text-lg font-bold text-center mb-2">
            {user?.nickname ?? user?.name ?? '게스트'} 님!
          </Text>
          <Text className="text-lg font-bold text-center mb-2">정말 로그아웃 하실 건가요?</Text>
          <Text className="text-base text-gray-600 text-center mb-4">
            우리 조금만 더 함께 해보아요!
          </Text>

          <View className="w-24 h-24 my-6 justify-center items-center">
            <SadIcon width={120} height={120} />
          </View>

          <View className="flex-row w-full">
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-1 py-4 rounded-xl mx-2"
              style={{ backgroundColor: '#CBC9C2' }}
            >
              <Text className="text-center text-gray-800 font-bold text-lg">네</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 py-4 rounded-xl mx-2"
              style={{ backgroundColor: '#5F5548' }}
            >
              <Text className="text-center text-white font-bold text-lg">아니요</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
