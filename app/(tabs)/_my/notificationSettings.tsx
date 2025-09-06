import React, { useState } from "react";
import { View, Text, Switch, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import TopBar from "@/components/Common/TopBar";
import { useRouter } from "expo-router";
// import messaging from "@react-native-firebase/messaging";  // 🚫 Expo Go에서는 동작 안 함
// import DeviceInfo from "react-native-device-info";
// import axios from "axios";

// const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

export default function NotificationSettings() {
  const router = useRouter();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  // 🚫 FCM 관련 로직 주석 처리
  // const [fcmToken, setFcmToken] = useState<string | null>(null);

  // useEffect(() => {
  //   const initFCM = async () => {
  //     const authStatus = await messaging().requestPermission();
  //     const enabled =
  //       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //       authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //     if (!enabled) {
  //       Alert.alert("알림 권한이 거부되었습니다.");
  //       return;
  //     }

  //     const token = await messaging().getToken();
  //     const deviceId = DeviceInfo.getUniqueId();
  //     setFcmToken(token);

  //     try {
  //       await axios.post(`${API_BASE_URL}/api/notifications/tokens`, {
  //         token,
  //         deviceId,
  //       });
  //       setPushEnabled(true);
  //       console.log("✅ 토큰 등록 완료:", token);
  //     } catch (err) {
  //       console.error("❌ 토큰 등록 실패:", err);
  //     }
  //   };

  //   initFCM();
  // }, []);

  // 스위치 제어 (🚫 지금은 단순 상태 토글만)
  const togglePush = (value: boolean) => {
    setPushEnabled(value);
    console.log("푸시 알림 (mock):", value);
  };

  // --- 이하 UI 부분 (리마인드 시간은 로컬 상태만) ---
  const [morningStart, setMorningStart] = useState(new Date(2025, 0, 1, 8, 0));
  const [morningEnd, setMorningEnd] = useState(new Date(2025, 0, 1, 10, 0));
  const [afternoonStart, setAfternoonStart] = useState(new Date(2025, 0, 1, 14, 0));
  const [afternoonEnd, setAfternoonEnd] = useState(new Date(2025, 0, 1, 20, 0));

  const [showPicker, setShowPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<
    "morningStart" | "morningEnd" | "afternoonStart" | "afternoonEnd" | null
  >(null);

  const formatTime = (date: Date) =>
    `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

  const handleTimeChange = (_: any, selectedDate?: Date) => {
    if (selectedDate && pickerTarget) {
      if (pickerTarget === "morningStart") setMorningStart(selectedDate);
      if (pickerTarget === "morningEnd") setMorningEnd(selectedDate);
      if (pickerTarget === "afternoonStart") setAfternoonStart(selectedDate);
      if (pickerTarget === "afternoonEnd") setAfternoonEnd(selectedDate);
    }
    setShowPicker(false);
  };

  return (
    <View className="flex-1 bg-[#F7F3EB]">
      <TopBar
        title="알림 설정"
        bgColor="#F7F3EB"
        style={{ marginTop: 37 }}
        onBackPress={() => router.back()}
      />

      <View className="p-4">
        {/* 푸시 알림 */}
        <View className="bg-[#F7F7F7] rounded-2xl p-5 mb-4 flex-row justify-between items-center">
          <Text style={{ fontFamily: "Inter", fontWeight: "500", fontSize: 17, lineHeight: 20 }}>
            푸시 알림
          </Text>
          <Switch
            value={pushEnabled}
            onValueChange={togglePush}
            thumbColor={pushEnabled ? "#5F5548" : "#f4f3f4"}
            trackColor={{ false: "#d1d5db", true: "#CBC9C2" }}
          />
        </View>
      </View>

      {showPicker && (
        <DateTimePicker
          value={
            pickerTarget === "morningStart"
              ? morningStart
              : pickerTarget === "morningEnd"
              ? morningEnd
              : pickerTarget === "afternoonStart"
              ? afternoonStart
              : afternoonEnd
          }
          mode="time"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}
