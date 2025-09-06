import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSessionStore } from '@/features/auth/store/session.store';
import axios from 'axios';
import SelectIcon from '@/assets/images/selecticon.svg';
import TopBar from '@/components/Common/TopBar';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL!;

// ✅ 백엔드 enum과 동일하게 정의 (항상 버튼 9개 고정)
const INTEREST_OPTIONS = [
  { code: 'HABIT_IMPROVEMENT', description: '습관 개선' },
  { code: 'HEALTH', description: '건강' },
  { code: 'LEARNING', description: '학습' },
  { code: 'MINDFULNESS', description: '마음 챙김' },
  { code: 'EXPENSE_MANAGEMENT', description: '소비 관리' },
  { code: 'HOBBY', description: '취미' },
  { code: 'DIET', description: '식습관' },
  { code: 'SLEEP', description: '수면' },
  { code: 'SELF_CARE', description: '자기 관리' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, tokens } = useSessionStore();

  const [name, setName] = useState(user?.nickname ?? user?.name ?? '');
  const [profileUrl, setProfileUrl] = useState(user?.profileImageUrl ?? '');
  const [interests, setInterests] = useState<string[]>(user?.interests ?? []);

  // ✅ Authorization 헤더
  const getAuthHeader = () =>
    tokens?.accessToken?.startsWith('Bearer ')
      ? tokens.accessToken
      : `Bearer ${tokens?.accessToken}`;

  // ✅ 페이지 진입 시 관심사 조회
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/members/me/interests`, {
          headers: { Authorization: getAuthHeader() },
        });
        console.log('✅ 관심사 응답:', res.data);

        const serverInterests = res.data.data?.interests ?? [];
        setInterests(serverInterests.map((i: any) => i.code));
      } catch (err: any) {
        console.error('❌ 관심사 조회 실패:', err.response?.data ?? err);
      }
    };
    fetchInterests();
  }, []);

  const toggleInterest = (code: string) => {
    setInterests((prev) =>
      prev.includes(code) ? prev.filter((i) => i !== code) : [...prev, code]
    );
  };

  /** PATCH 방식 (이름, 프로필, 관심사 전체/부분 수정) */
  const handleSave = async () => {
    try {
      if (!name.trim()) {
        Alert.alert('오류', '이름은 최소 1자 이상 입력해야 합니다.');
        return;
      }

      const payload: Record<string, any> = {};
      if (name !== (user?.nickname ?? user?.name)) payload.memberName = name;
      if (profileUrl !== user?.profileImageUrl)
        payload.profileImageUrl = profileUrl;
      if (JSON.stringify(interests) !== JSON.stringify(user?.interests)) {
        payload.interests = interests;
      }

      await axios.patch(`${API_BASE}/api/members/me`, payload, {
        headers: { Authorization: getAuthHeader() },
      });

      Alert.alert('완료', '프로필이 수정되었습니다.');
      router.back();
    } catch (err: any) {
      console.error('❌ 프로필 수정 실패:', err.response?.data ?? err);
      Alert.alert(
        '오류',
        err.response?.data?.message ?? '수정 중 오류가 발생했습니다.'
      );
    }
  };

  /** PUT 방식 (관심사만 수정) */
  const handleSaveInterests = async () => {
    try {
      await axios.put(
        `${API_BASE}/api/members/me/interests`,
        { interests },
        { headers: { Authorization: getAuthHeader() } }
      );

      Alert.alert('완료', '관심사가 수정되었습니다.');
      router.back();
    } catch (err: any) {
      console.error('❌ 관심사 수정 실패:', err.response?.data ?? err);
      Alert.alert(
        '오류',
        err.response?.data?.message ?? '관심사 수정 중 오류 발생'
      );
    }
  };

  return (
    <View className="flex-1 bg-[#F2EFE6]">
      {/* ✅ TopBar는 안전영역 padding을 스스로 처리 */}
      <TopBar
        title="내 정보 수정"
        onBackPress={() => router.replace('/(tabs)/_my')}
        bgColor="#F2EFE6"
      />

      {/* ✅ ScrollView는 TopBar 밑에 붙고, 위쪽 padding 제거 */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* 이름 */}
        <Text className="text-base font-bold mb-2 text-[#3A332A] mt-0 ml-1">
          이름
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="이름을 입력하세요"
          className="bg-white p-3 rounded-xl border border-gray-200 mb-5"
        />

        {/* 프로필 이미지 URL */}
        <Text className="text-base font-semibold mb-2 text-[#3A332A] ml-1">
          프로필 이미지 URL
        </Text>
        <TextInput
          value={profileUrl}
          onChangeText={setProfileUrl}
          placeholder="https://example.com/profile.jpg"
          className="bg-white p-3 rounded-xl border border-gray-200 mb-5"
        />

        {/* 관심사 */}
        <Text className="text-base font-bold mb-6 text-[#3A332A] ml-3">
          관심사
        </Text>
        <View className="flex-row flex-wrap justify-center gap-4 mb-0">
          {INTEREST_OPTIONS.map((opt) => {
            const isSelected = interests.includes(opt.code);
            return (
              <TouchableOpacity
                key={opt.code}
                onPress={() => toggleInterest(opt.code)}
                className={`relative w-[100px] h-[90px] rounded-xl border shadow flex justify-center items-center
                  ${
                    isSelected
                      ? 'bg-[#F8761F] border-[#F8761F]'
                      : 'bg-white border-gray-200'
                  }
                `}
              >
                <Text
                  className={`text-center text-base font-medium ${
                    isSelected ? 'text-white' : 'text-black'
                  }`}
                >
                  {opt.description}
                </Text>

                {isSelected && (
                  <View className="absolute top-2 right-2">
                    <SelectIcon width={22} height={22} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 저장 버튼 */}
        <View className="mt-20">
          <TouchableOpacity
            className="bg-[#3A332A] py-5 rounded-2xl mb-4"
            onPress={handleSave}
          >
            <Text className="text-center text-white font-bold text-base">
              전체 저장하기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#F8761F] py-5 rounded-2xl"
            onPress={handleSaveInterests}
          >
            <Text className="text-center text-white font-bold text-base">
              관심사만 저장하기
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
