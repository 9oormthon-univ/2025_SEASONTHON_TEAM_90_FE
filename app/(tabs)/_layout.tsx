//bottombar 코드입니다.

import { Tabs } from "expo-router";
import Colors from "@/constants/Colors";
import Home from "@/assets/icons/home.svg";
import HomeActive from "@/assets/icons/homeclick.svg";
import Dashboard from "@/assets/icons/dashboard.svg";
import DashboardActive from "@/assets/icons/dashboardclick.svg";
import My from "@/assets/icons/my.svg";
import MyActive from "@/assets/icons/myclick.svg";
import Ranking from "@/assets/icons/ranking.svg";

function TabSvg({
  Active,
  Inactive,
  focused,
  size = 37, //
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
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabSvg Active={HomeActive} Inactive={Home} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabSvg Active={DashboardActive} Inactive={Dashboard} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabSvg Active={MyActive} Inactive={My} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          // MVP 1단계에 랭킹 없음으로 active 사용하지 않았음.
          tabBarIcon: () => <Ranking width={32} height={32} />,
        }}
      />
    </Tabs>
  );
}
