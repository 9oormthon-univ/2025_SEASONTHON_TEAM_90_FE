import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

// 회고 페이지 데모 인데 이미 작성한 내용 있으시면 삭제해도 됩니다.
export default function RetrospectPage() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  return (
    <View className="items-center justify-center flex-1">
      <Text className="text-xl font-choco">회고 페이지</Text>
      <Text className="mt-2">선택한 날짜: {date ?? "-"}</Text>
      <Text className="mt-2 text-xs opacity-60">(페이지 이동만 구현)</Text>
    </View>
  );
}
