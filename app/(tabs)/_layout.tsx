import { Tabs } from "expo-router";
import Colors from "@/constants/Colors";
import Home from "@/assets/icons/home.svg";
import HomeActive from "@/assets/icons/homeclick.svg";
import My from "@/assets/icons/my.svg";
import MyActive from "@/assets/icons/myclick.svg";
import Ranking from "@/assets/icons/ranking.svg";

function TabSvg({
  Active,
  Inactive,
  focused,
  size = 37,
}: {
  Active?: React.FC<any>;
  Inactive: React.FC<any>;
  focused: boolean;
  size?: number;
}) {
  const Comp = focused && Active ? Active : Inactive;
  return <Comp width={size} height={size} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 0.5,
          borderTopColor: Colors.mute,
          height: 80,
        },
        tabBarItemStyle: {
          paddingTop: 6,
        },
      }}
    >
      {/* 홈 */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabSvg Active={HomeActive} Inactive={Home} focused={focused} />
          ),
        }}
      />

      {/* MY */}
      <Tabs.Screen
        name="_my"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabSvg Active={MyActive} Inactive={My} focused={focused} />
          ),
        }}
      />

      {/* 랭킹 */}
      <Tabs.Screen
        name="ranking"
        options={{
          tabBarIcon: () => <Ranking width={32} height={32} />,
        }}
      />
    </Tabs>
  );
}
