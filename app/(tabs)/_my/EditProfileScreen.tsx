import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSessionStore } from '@/features/auth/store/session.store';
import axios from 'axios';

const INTEREST_OPTIONS = ['HEALTH', 'LEARNING', 'SPORTS', 'MUSIC', 'TRAVEL'];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser, tokens } = useSessionStore();
  const [name, setName] = useState(user?.nickname ?? '');
  const [profileUrl, setProfileUrl] = useState(user?.profileImageUrl ?? '');
  const [interests, setInterests] = useState<string[]>(user?.interests ?? []);

  const toggleInterest = (item: string) => {
    if (interests.includes(item)) {
      setInterests(interests.filter((i) => i !== item));
    } else {
      setInterests([...interests, item]);
    }
  };

  const handleSave = async () => {
    try {
      const res = await axios.patch(
        'http://10.0.2.2:8080/api/members/me',
        {
          memberName: name,
          profileImageUrl: profileUrl,
          interests: interests,
        },
        {
          headers: { Authorization: tokens?.accessToken },
        }
      );

      // 응답값으로 store 갱신
      setUser({
        ...user,
        nickname: res.data.memberName,
        profileImageUrl: res.data.profileImageUrl,
        interests: res.data.interests,
      });

      router.back(); // 프로필 카드 화면으로 돌아가기
    } catch (err) {
      console.error(err);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#F2EFE6] p-6">
      {/* 이름 */}
      <Text className="text-base font-semibold mb-2 text-[#3A332A]">이름</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="이름을 입력하세요"
        className="bg-white p-3 rounded-xl border border-gray-200 mb-4"
      />

      {/* 프로필 이미지 URL */}
      <Text className="text-base font-semibold mb-2 text-[#3A332A]">
        프로필 이미지 URL
      </Text>
      <TextInput
        value={profileUrl}
        onChangeText={setProfileUrl}
        placeholder="https://example.com/profile.jpg"
        className="bg-white p-3 rounded-xl border border-gray-200 mb-4"
      />

      {/* 관심사 */}
      <Text className="text-base font-semibold mb-2 text-[#3A332A]">관심사</Text>
      <View className="flex-row flex-wrap mb-6">
        {INTEREST_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            className={`px-4 py-2 m-1 rounded-full border ${
              interests.includes(opt)
                ? 'bg-[#F8761F] border-[#F8761F]'
                : 'bg-white border-gray-300'
            }`}
            onPress={() => toggleInterest(opt)}
          >
            <Text
              className={`text-sm ${
                interests.includes(opt) ? 'text-white' : 'text-gray-600'
              }`}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 저장 버튼 */}
      <TouchableOpacity className="bg-[#3A332A] py-4 rounded-2xl" onPress={handleSave}>
        <Text className="text-center text-white font-semibold text-base">
          저장하기
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}