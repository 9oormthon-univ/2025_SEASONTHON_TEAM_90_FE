import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/home" />; // 임시로 로그인 건너뛰기
}
