// app/(tabs)/_my/NotificationSettings.tsx
import React, { JSX, useEffect, useState } from "react";
import { View, Text, Switch, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import TopBar from "@/components/Common/TopBar";

import * as Notifications from "expo-notifications";
import * as Application from "expo-application";
import Constants from "expo-constants";
import axios from "axios";

// notifee는 Expo Go에서 NativeModule이 없어 바로 import 하면 터질 수 있음
// → Dev Build에서만 동적 import로 사용
import type {
  TimestampTrigger,
  TriggerType,
  RepeatFrequency,
} from "@notifee/react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

// Expo Go 여부 (Go: "expo", Dev Build: "standalone" | "guest")
const isExpoGo = Constants.appOwnership === "expo";

/** 기기 고유 ID (앱 재설치 후에도 유지; iOS=IDFV, Android=ANDROID_ID) */
async function getPermanentDeviceId(): Promise<string> {
  if (Platform.OS === "android") {
    try {
      const id = await Application.getAndroidId();
      return id ?? "unknown-android";
    } catch {
      return "unknown-android";
    }
  }
  try {
    const idfv = await Application.getIosIdForVendorAsync();
    return idfv ?? "unknown-ios";
  } catch {
    return "unknown-ios";
  }
}

/** 알림 권한 확보 (iOS/Android 13+) */
async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  let granted =
    current.granted ||
    current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

  if (!granted) {
    const req = await Notifications.requestPermissionsAsync();
    granted =
      req.granted ||
      req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  }
  // Dev Build라면 notifee 권한도 요청
  if (!isExpoGo) {
    try {
      const notifee = (await import("@notifee/react-native")).default;
      await notifee.requestPermission();
    } catch {
      // ignore
    }
  }
  return granted;
}

/** Dev Build에서만 Expo Push Token 발급 (Expo Go에서는 null 반환) */
async function maybeGetExpoPushToken(): Promise<string | null> {
  if (isExpoGo) {
    console.warn("Expo Go 환경: 원격 푸시 토큰을 발급하지 않습니다.");
    return null;
  }
  const token = await Notifications.getExpoPushTokenAsync();
  return token.data ?? null;
}

export default function NotificationSettings(): JSX.Element {
  const router = useRouter();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const ok = await ensureNotificationPermission();
        if (!ok) {
          Alert.alert("알림 권한이 거부되었습니다.");
          return;
        }

        // Dev Build에서만 원격 푸시 토큰 발급 & 서버 등록
        const token = await maybeGetExpoPushToken();
        setPushToken(token);

        if (token) {
          const deviceId = await getPermanentDeviceId();
          await axios.post(`${API_BASE_URL}/api/notifications/tokens`, {
            token,
            deviceId,
          });
          setPushEnabled(true);
          console.log("✅ 서버 토큰 등록 완료:", { token, deviceId });
        }
      } catch (e) {
        console.error("❌ 알림 초기화 실패:", e);
      }
    };

    init();
  }, []);

  /** 매일 8시/22시 알림 예약 */
  const scheduleDailyNotifications = async () => {
    const now = new Date();

    const morning = new Date(now);
    morning.setHours(8, 0, 0, 0);
    if (morning <= now) morning.setDate(morning.getDate() + 1);

    const evening = new Date(now);
    evening.setHours(22, 0, 0, 0);
    if (evening <= now) evening.setDate(evening.getDate() + 1);

    if (isExpoGo) {
      // Expo Go: expo-notifications로 반복 알림
      await Notifications.scheduleNotificationAsync({
        content: { title: "굿모닝 ☀️", body: "아침 8시 알림입니다!" },
        trigger: {
          date: morning,
          repeats: true,
        } as any, // RN TS 충돌 회피(Expo가 date+repeats 지원)
      });

      await Notifications.scheduleNotificationAsync({
        content: { title: "굿나잇 🌙", body: "저녁 10시 알림입니다!" },
        trigger: {
          date: evening,
          repeats: true,
        } as any,
      });
    } else {
      // Dev Build: notifee 트리거 사용
      const notifee = (await import("@notifee/react-native")).default;

      const morningTrigger: TimestampTrigger = {
        type: (await import("@notifee/react-native")).TriggerType.TIMESTAMP,
        timestamp: morning.getTime(),
        repeatFrequency: (await import("@notifee/react-native"))
          .RepeatFrequency.DAILY,
      };

      const eveningTrigger: TimestampTrigger = {
        type: (await import("@notifee/react-native")).TriggerType.TIMESTAMP,
        timestamp: evening.getTime(),
        repeatFrequency: (await import("@notifee/react-native"))
          .RepeatFrequency.DAILY,
      };

      await notifee.createTriggerNotification(
        { title: "굿모닝 ☀️", body: "아침 8시 알림입니다!" },
        morningTrigger
      );

      await notifee.createTriggerNotification(
        { title: "굿나잇 🌙", body: "저녁 10시 알림입니다!" },
        eveningTrigger
      );
    }
  };

  /** 예약 취소 */
  const cancelAllSchedules = async () => {
    if (isExpoGo) {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } else {
      const notifee = (await import("@notifee/react-native")).default;
      await notifee.cancelAllNotifications();
    }
  };

  /** 스위치 on/off */
  const togglePush = async (value: boolean) => {
    setPushEnabled(value);

    if (value) {
      if (pushToken) {
        const deviceId = await getPermanentDeviceId();
        await axios.post(`${API_BASE_URL}/api/notifications/tokens`, {
          token: pushToken,
          deviceId,
        });
        console.log("✅ 푸시 알림 활성화:", pushToken);
      }
      await scheduleDailyNotifications();
    } else {
      if (pushToken) {
        await axios.delete(`${API_BASE_URL}/api/notifications/tokens/${pushToken}`);
        console.log("❌ 푸시 알림 비활성화:", pushToken);
      }
      await cancelAllSchedules();
    }
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
        <View className="bg-[#F7F7F7] rounded-2xl p-5 mb-4 flex-row justify-between items-center">
          <Text style={{ fontFamily: "Inter", fontWeight: "500", fontSize: 17 }}>
            푸시 알림
          </Text>
          <Switch
            value={pushEnabled}
            onValueChange={togglePush}
            thumbColor={pushEnabled ? "#5F5548" : "#f4f3f4"}
            trackColor={{ false: "#d1d5db", true: "#CBC9C2" }}
          />
        </View>

        {isExpoGo && (
          <Text className="text-xs text-gray-500">
            * 현재 Expo Go에서 실행 중입니다. 원격 푸시(FCM/APNs)는 Dev Build에서만 동작합니다.
          </Text>
        )}
      </View>
    </View>
  );
}
