import { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";

export default function RedirectCatcher() {
  const router = useRouter();
  useEffect(() => {
    // 브라우저 세션 닫기 (남아있다면)
    WebBrowser.maybeCompleteAuthSession();
    // 홈 등 원하는 곳으로 바로 돌려보내기
    router.replace("/home"); // 필요에 따라 변경
  }, [router]);
  return <View />;
}
