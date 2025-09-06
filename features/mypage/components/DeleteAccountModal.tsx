import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import WarningIcon from '../assets/sad.svg';
import { useSessionStore } from '@/features/auth/store/session.store';
import client from '@/shared/api/client';

interface DeleteAccountModalProps {
  visible: boolean;
  onSuccess: () => void; // 부모에서 후처리 (로그아웃 등)
  onCancel: () => void;
}

export default function DeleteAccountModal({
  visible,
  onSuccess,
  onCancel,
}: DeleteAccountModalProps) {
  const { user } = useSessionStore();

  const handleDelete = async () => {
    try {
      await client.delete('/api/members'); // ✅ 서버 API 호출
      onSuccess();
    } catch (err) {
      console.error('❌ 계정 삭제 실패:', err);
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View className="flex-1 justify-center items-center bg-black/40">
        <View className="bg-white rounded-3xl p-10 w-96 items-center">
          <Text className="text-lg font-bold text-center mb-2">
            {user?.nickname ?? user?.name ?? '회원'} 님
          </Text>
          <Text className="text-lg font-bold text-center mb-2 text-red-600">
            정말로 계정을 삭제하시겠어요?
          </Text>
          <Text className="text-base text-gray-600 text-center mb-4">
            계정은 복구할 수 없으며, 모든 기록이 사라집니다.
          </Text>

          <View className="w-24 h-24 my-6 justify-center items-center">
            <WarningIcon width={120} height={120} />
          </View>

          <View className="flex-row w-full">
            <TouchableOpacity
              onPress={handleDelete}
              className="flex-1 py-4 rounded-xl mx-2"
              style={{ backgroundColor: '#E74C3C' }}
            >
              <Text className="text-center text-white font-bold text-lg">네, 삭제합니다</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 py-4 rounded-xl mx-2"
              style={{ backgroundColor: '#5F5548' }}
            >
              <Text className="text-center text-white font-bold text-lg">취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
