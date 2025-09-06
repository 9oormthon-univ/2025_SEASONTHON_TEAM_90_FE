# 카카오 로그인 가이드 (Expo AuthSession + Proxy)

## 1) 개요
- 목표: Expo Go를 사용하면서 카카오 로그인을 구현합니다.
- 방식: `expo-auth-session` + Expo AuthSession Proxy(redirect URI를 Expo 도메인으로).
- 결과: Kakao access_token 수신 → 서버 `socialLogin('KAKAO')` → 토큰 저장(Zustand + AsyncStorage).

## 2) 사전 준비
- Expo 계정: `moamoa11` (확정). 슬러그: `seasonthon-team90` (`app.config.ts`).
- Redirect URI(확정): `https://auth.expo.dev/@moamoa11/seasonthon-team90` (구버전: `https://auth.expo.io/@moamoa11/seasonthon-team90`).
- Kakao Developers 가입 후 앱 생성: https://developers.kakao.com/

## 3) Kakao 콘솔 설정
- 내 애플리케이션 → 앱 생성 → 카카오 로그인 활성화.
- Redirect URI 등록(중요):
  - `https://auth.expo.dev/@moamoa11/seasonthon-team90`
  - (호환용) `https://auth.expo.io/@moamoa11/seasonthon-team90`
- 앱 키 확인: REST API 키 사용(네이티브 키 아님).

## 4) 환경 변수/설정
- `.env` 예시(실제 값으로 교체):
  - `EXPO_PUBLIC_KAKAO_REST_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
  - `EXPO_PUBLIC_API_BASE_URL=https://habiglow.duckdns.org`
- 코드에서 `EXPO_PUBLIC_API_BASE_URL`을 표준으로 사용(기존 `EXPO_PUBLIC_API_URL`은 통일 예정).

## 5) 코드 변경 계획 (단계별)
1. `kakaoAuth.ts` (AuthSession + Proxy):
   - `const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });`
   - 인가 URL: `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token`
   - `startAsync`로 `access_token` 수신, `dismiss` 처리 분기.
2. 서버 교환: `POST /api/auth/social/login`에 `{ socialAccessToken, socialType:'KAKAO' }` 전송.
3. 토큰 저장: `useSessionStore.setTokens(...)` + `shared/api/client.setAccessToken(appAccessToken)` 호출.
4. 토큰 접두사 정책: 서버 응답 `data.accessToken`은 “Bearer …” 접두사가 포함됨(유지). 전역 클라이언트는 중복 접두사 방지 로직 필요(추후 반영).
5. API 클라이언트 정합: `shared/api/client`만 사용하도록 통일(중복 axios 제거), Base URL는 `EXPO_PUBLIC_API_BASE_URL`.

```ts
// features/auth/api/kakaoAuth.ts (예시)
import * as AuthSession from 'expo-auth-session';
import { socialLogin } from './authApi';
import { useSessionStore } from '../store/session.store';
import { setAccessToken } from '@/shared/api/client';

const REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY!;

export async function loginWithKakao() {
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
  const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token`;

  const result = await AuthSession.startAsync({ authUrl });
  if (result.type !== 'success' || !('access_token' in result.params)) {
    throw new Error('카카오 로그인 취소 또는 실패');
  }

  const kakaoAccessToken = (result.params as any).access_token as string;
  const data = await socialLogin(kakaoAccessToken, 'KAKAO');

  // 서버 토큰 저장 (Bearer 접두사 포함된 accessToken 유지)
  useSessionStore.getState().setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken ?? '' });
  await setAccessToken(data.accessToken); // 전역 클라이언트는 접두사 중복되지 않도록 처리 예정

  // 필요 시 프로필 조회(선택)
  // const me = await fetch('https://kapi.kakao.com/v2/user/me', { headers: { Authorization: `Bearer ${kakaoAccessToken}` } }).then(r => r.json());
  // useSessionStore.getState().setUser({ id: String(me.id), nickname: me.kakao_account?.profile?.nickname, profileImageUrl: me.kakao_account?.profile?.profile_image_url });
}
```

## 6) 실행/테스트 절차
- 개발 서버 시작: `npm start`
- 기기에서 Expo Go 실행 → QR 스캔 → 앱 열기.
- 로그인 버튼에서 카카오 로그인 → 동의 → 앱 복귀 확인.
- 보호 API(`GET /api/members/me`) 호출 시 200 확인(401/403 없음).

## 7) 체크리스트 & 트러블슈팅
- Redirect URI: `https://auth.expo.dev/@moamoa11/seasonthon-team90`(및 구버전) 등록 여부.
- 키 종류: “REST API 키” 사용(네이티브 키 사용 금지).
- 결과 타입: `result.type==='success'` 여부 확인, `dismiss`는 사용자 취소 처리.
- 토큰 접두사: 서버 `data.accessToken`은 “Bearer …” 포함. 전역 헤더에 중복 붙지 않도록 후속 반영.
- 보안: `.env` 미커밋. `EXPO_PUBLIC_` 값은 번들 포함됨 → 검증/민감 로직은 서버에서 처리.

## 8) 이후 단계(권장)
- `authApi.ts`를 `shared/api/client` 기반으로 리팩터링(중복 axios 제거).
- 전역 클라이언트의 Authorization 설정을 "이미 Bearer 포함 시 그대로 사용" 로직으로 보강.
- 401 처리: `onUnauthorized` 콜백 통해 세션 초기화/리다이렉트.
- 필요 시 Dev Client/EAS 전환 후 네이티브 SDK 방식 검토.
