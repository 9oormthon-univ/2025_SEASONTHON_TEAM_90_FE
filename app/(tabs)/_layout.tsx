// app/(tabs)/_layout.tsx  (또는 Tabs가 있는 레이아웃 파일)
import { Tabs } from "expo-router";
import Colors from "@/constants/Colors";

// SVG (react-native-svg-transformer 설정 필요)
import Home from "@/assets/icons/home.svg";
import HomeActive from "@/assets/icons/homeclick.svg";
import Dashboard from "@/assets/icons/dashboard.svg";
import DashboardActive from "@/assets/icons/dashboardclick.svg";
import My from "@/assets/icons/my.svg";
import MyActive from "@/assets/icons/myclick.svg";
import Ranking from "@/assets/icons/ranking.svg";

// ❌ 미사용 에러 방지: useFonts 제거
// import { useFonts } from "expo-font";

type SvgComp = React.ComponentType<any>;

function TabSvg({
  Active,
  Inactive,
  focused,
  size = 37,
}: {
  Active?: SvgComp;
  Inactive: SvgComp;
  focused: boolean;
  size?: number;
}) {
  const Comp = focused && Active ? Active : Inactive;
  // 일부 SVG는 width/height props 미지원일 수 있어 props 넘기기만
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
        tabBarItemStyle: { paddingTop: 6 },
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
      {/* ⚠️ 라우트 파일명이 '_my' 인지 꼭 확인!
          - 파일이 app/(tabs)/_my.tsx 또는 _my/index.tsx면 name="_my"
          - 파일이 app/(tabs)/my.tsx 또는 my/index.tsx면 name="my" 로 바꾸세요 */}
      <Tabs.Screen
        name="_my"
        options={{
          tabBarIcon: ({ focused }) => <TabSvg Active={MyActive} Inactive={My} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          tabBarIcon: () => <Ranking width={32} height={32} />,
        }}
      />
    </Tabs>
  );
}
