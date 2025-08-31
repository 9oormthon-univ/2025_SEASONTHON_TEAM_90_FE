import { View, Text } from "react-native";
import Colors from "@/constants/Colors";

export default function Dashboard() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.white }}>
      <Text style={{ color: Colors.brandPrimary, fontSize: 18, fontWeight: "700" }}>
        대시보드 화면
      </Text>
    </View>
  );
}
