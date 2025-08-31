import { View, Text } from "react-native";
import Colors from "@/constants/Colors";

export default function Ranking() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.white }}>
      <Text style={{ color: Colors.brandPrimary, fontSize: 18, fontWeight: "700" }}>
        랭킹 화면
      </Text>
    </View>
  );
}
