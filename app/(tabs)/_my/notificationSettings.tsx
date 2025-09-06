import React, { useState, useEffect } from "react";
import { View, Text, Switch, Platform, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import TopBar from "@/components/Common/TopBar";
import { useRouter } from "expo-router";
import messaging from "@react-native-firebase/messaging";
import DeviceInfo from "react-native-device-info";
import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

export default function NotificationSettings() {
  const router = useRouter();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // ✅ 앱 시작 시 FCM 초기화
  useEffect(() => {
    const initFCM = async () => {
      try {
        // 1) 알림 권한 요청
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          Alert.alert("알림 권한이 거부되었습니다.");
          return;
        }

        // 2) 토큰 발급
        const token = await messaging().getToken();
        const deviceId = DeviceInfo.getUniqueId();
        setFcmToken(token);

        // 3) 서버 등록
        await axios.post(`${API_BASE_URL}/api/notifications/tokens`, {
          token,
          deviceId,
        });
        setPushEnabled(true);
        console.log("✅ 토큰 등록 완료:", token);
      } catch (err) {
        console.error("❌ FCM 초기화 실패:", err);
      }
    };

    initFCM();
  }, []);

  // ✅ 스위치로 푸시 알림 on/off
  const togglePush = async (value: boolean) => {
    setPushEnabled(value);
    if (value) {
      // 알림 켜기 → 토큰 다시 등록
      if (fcmToken) {
        const deviceId = DeviceInfo.getUniqueId();
        await axios.post(`${API_BASE_URL}/api/notifications/tokens`, {
          token: fcmToken,
          deviceId,
        });
        console.log("✅ 푸시 알림 활성화:", fcmToken);
      }
    } else {
      // 알림 끄기 → 토큰 비활성화
      if (fcmToken) {
        await axios.delete(`${API_BASE_URL}/api/notifications/tokens/${fcmToken}`);
        console.log("❌ 푸시 알림 비활성화:", fcmToken);
      }
    }
  };

  // --- 이하 UI 부분 ---
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
