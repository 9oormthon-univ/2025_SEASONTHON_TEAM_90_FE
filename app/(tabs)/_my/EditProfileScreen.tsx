import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSessionStore } from "@/features/auth/store/session.store";
import client from "@/shared/api/client";
import SelectIcon from "@/assets/images/selecticon.svg";
import TopBar from "@/components/Common/TopBar";

const INTEREST_OPTIONS = [
  { code: "HABIT_IMPROVEMENT", description: "습관 개선" },
  { code: "HEALTH", description: "건강" },
  { code: "LEARNING", description: "학습" },
  { code: "MINDFULNESS", description: "마음 챙김" },
  { code: "EXPENSE_MANAGEMENT", description: "소비 관리" },
  { code: "HOBBY", description: "취미" },
  { code: "DIET", description: "식습관" },
  { code: "SLEEP", description: "수면" },
  { code: "SELF_CARE", description: "자기 관리" },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useSessionStore();

  const [name, setName] = useState(user?.nickname ?? user?.name ?? "");
  const [profileUrl, setProfileUrl] = useState(user?.profileImageUrl ?? "");
  const [interests, setInterests] = useState<string[]>(user?.interests ?? []);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const res = await client.get("/api/members/me/interests");
        const serverInterests = res.data.data?.interests ?? [];
        setInterests(serverInterests.map((i: any) => i.code));
      } catch (err: any) {
        console.error("❌ 관심사 조회 실패:", err.response?.data ?? err);
      }
    };
    fetchInterests();
  }, []);

  const toggleInterest = (code: string) => {
    setInterests((prev) =>
      prev.includes(code) ? prev.filter((i) => i !== code) : [...prev, code],
    );
  };

  const handleSave = async () => {
    try {
      if (!name.trim()) {
        Alert.alert("오류", "이름은 최소 1자 이상 입력해야 합니다.");
        return;
      }

      const payload: Record<string, any> = {};
      if (name !== (user?.nickname ?? user?.name)) payload.memberName = name;
      if (profileUrl !== user?.profileImageUrl) payload.profileImageUrl = profileUrl;
      if (JSON.stringify(interests) !== JSON.stringify(user?.interests)) {
        payload.interests = interests;
      }

      await client.patch("/api/members/me", payload);
      Alert.alert("완료", "프로필이 수정되었습니다.");
      router.back();
    } catch (err: any) {
      console.error("❌ 프로필 수정 실패:", err.response?.data ?? err);
      Alert.alert("오류", err.response?.data?.message ?? "수정 중 오류가 발생했습니다.");
    }
  };

  const handleSaveInterests = async () => {
    try {
      await client.put("/api/members/me/interests", { interests });
      Alert.alert("완료", "관심사가 수정되었습니다.");
      router.back();
    } catch (err: any) {
      console.error("❌ 관심사 수정 실패:", err.response?.data ?? err);
      Alert.alert("오류", err.response?.data?.message ?? "관심사 수정 중 오류 발생");
    }
  };

  return (
    <View className="flex-1 bg-[#F2EFE6]">
      <TopBar
        title="내 정보 수정"
        onBackPress={() => router.replace("/(tabs)/_my")}
        bgColor="#F2EFE6"
      />

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 80 }}>
        {/* 이름 */}
        <Text className="text-base font-bold mb-2 text-[#3A332A]">이름</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="이름을 입력하세요"
          className="bg-white p-3 rounded-xl border border-gray-200 mb-5"
        />

        {/* 프로필 이미지 URL */}
        <Text className="text-base font-semibold mb-2 text-[#3A332A]">프로필 이미지 URL</Text>
        <TextInput
          value={profileUrl}
          onChangeText={setProfileUrl}
          placeholder="https://example.com/profile.jpg"
          className="bg-white p-3 rounded-xl border border-gray-200 mb-5"
        />

        {/* 관심사 */}
        <Text className="text-base font-bold mb-6 text-[#3A332A]">관심사</Text>
        <View className="flex-row flex-wrap justify-center gap-4">
          {INTEREST_OPTIONS.map((opt) => {
            const isSelected = interests.includes(opt.code);
            return (
              <TouchableOpacity
                key={opt.code}
                onPress={() => toggleInterest(opt.code)}
                className={`relative w-[100px] h-[90px] rounded-xl border shadow flex justify-center items-center
                  ${isSelected ? "bg-[#F8761F] border-[#F8761F]" : "bg-white border-gray-200"}
                `}
              >
                <Text
                  className={`text-center text-base font-medium ${isSelected ? "text-white" : "text-black"}`}
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
          <TouchableOpacity className="bg-[#3A332A] py-5 rounded-2xl mb-4" onPress={handleSave}>
            <Text className="text-center text-white font-bold text-base">전체 저장하기</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#F8761F] py-5 rounded-2xl" onPress={handleSaveInterests}>
            <Text className="text-center text-white font-bold text-base">관심사만 저장하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
