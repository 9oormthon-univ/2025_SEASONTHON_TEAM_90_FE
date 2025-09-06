# 로그인 인증 문제 분석 및 해결 방안

## 🚨 문제 상황

서버에서 다음과 같은 인증 관련 오류가 발생하고 있습니다:

```
2025-09-06T07:48:01.343Z  WARN [nio-8080-exec-7] JwtAuthenticationEntryPoint: Full authentication is required to access this resource
2025-09-06T07:48:02.172Z  WARN [nio-8080-exec-8] GlobalExceptionHandler: TOKEN004 - 리프레시 토큰을 찾을 수 없습니다
2025-09-06T07:48:02.868Z  WARN [nio-8080-exec-9] JwtAuthenticationEntryPoint: Full authentication is required to access this resource
```

## 🔍 원인 분석

### 1. 핵심 문제: 리프레시 토큰 저장 로직 누락

**파일: `features/login/token.store.ts`**
```typescript
// 🚫 현재 문제가 있는 코드
export async function loadTokens(): Promise<{ access: string | null; refresh: null }> {
  return { access: await _getAccess(), refresh: null }; // ❌ refresh는 항상 null
}
```

**문제점:**
- 클라이언트가 리프레시 토큰을 로컬에 저장하지 않음
- `loadTokens()` 함수에서 refresh 토큰이 항상 `null`로 반환됨
- 401 에러 발생 시 토큰 갱신이 실패하게 됨

### 2. 토큰 갱신 실패 플로우

**파일: `features/login/api/client.ts` (133-158번째 줄)**

```typescript
// 401 에러 발생 시 자동 토큰 갱신 시도
if (error?.response?.status === 401 && !original?._retry) {
  // ... 
  const { refresh: storedRefresh, access } = await loadTokens(); // ❌ refresh는 항상 null
  const refresh = refreshCookie || storedRefresh; // 쿠키에만 의존
  if (!refresh) {
    console.warn("[Auth] no refresh token (cookie+store both empty)");
    await clearTokens();
    throw error; // ❌ TOKEN004 에러 발생
  }
}
```

### 3. 쿠키 의존성 문제

현재 시스템은 리프레시 토큰을 **쿠키에만** 저장하고 있습니다:

**문제점:**
- React Native에서 쿠키 관리가 불안정할 수 있음
- 네트워크 환경에 따라 쿠키가 누락될 수 있음
- 앱 재시작 시 쿠키가 손실될 수 있음

## 🛠️ 해결 방안

### 1. 즉시 수정: 리프레시 토큰 저장 로직 구현

**파일: `features/login/token.store.ts` 수정 필요**

```typescript
// ✅ 수정 후 코드 (예시)
const REFRESH_KEY = "app_refresh_token";
let memRefresh: string | null = null;

async function _setRefresh(v: string | null) {
  memRefresh = v;
  if (isWeb) {
    if (v == null) localStorage.removeItem(REFRESH_KEY);
    else localStorage.setItem(REFRESH_KEY, v);
  } else {
    if (v == null) await SecureStore.deleteItemAsync(REFRESH_KEY);
    else await SecureStore.setItemAsync(REFRESH_KEY, v);
  }
}

async function _getRefresh(): Promise<string | null> {
  if (memRefresh) return memRefresh;
  memRefresh = isWeb
    ? localStorage.getItem(REFRESH_KEY)
    : ((await SecureStore.getItemAsync(REFRESH_KEY)) ?? null);
  return memRefresh;
}

// ✅ loadTokens 함수 수정
export async function loadTokens(): Promise<{ access: string | null; refresh: string | null }> {
  return { 
    access: await _getAccess(), 
    refresh: await _getRefresh() // ✅ 실제 리프레시 토큰 반환
  };
}
```

### 2. 소셜 로그인 후 리프레시 토큰 저장

**파일: `features/login/api/auth.ts` 수정 필요**

소셜 로그인 성공 후 서버 응답에서 리프레시 토큰을 추출하여 저장:

```typescript
export async function socialLogin(params: {
  socialAccessToken: string;
  socialType: "GOOGLE" | "KAKAO" | "NAVER";
}) {
  const res = await api.post<CommonResponse<LoginResponse>>("/api/auth/social/login", params);
  
  // Access Token 저장
  const access = ensureBearer(res.data.data?.accessToken);
  await saveTokens({ access: access ?? null });
  
  // ✅ 추가: 쿠키에서 리프레시 토큰 추출 후 로컬 저장
  await reflectSetCookie(res.headers);
  
  // 쿠키에서 리프레시 토큰 읽어서 로컬에도 저장
  const refreshUrl = `${rawBaseURL}/api/auth/token/refresh`;
  const saved = await CookieManager.get(refreshUrl);
  const refreshToken = saved?.refresh?.value;
  
  if (refreshToken) {
    await saveTokens({ refresh: refreshToken }); // ✅ 리프레시 토큰도 저장
    console.log("[Auth] Refresh token saved locally");
  }
  
  return res.data.data;
}
```

### 3. 토큰 갱신 로직 강화

**파일: `features/login/api/client.ts` 수정**

```typescript
// 401 에러 발생 시
if (error?.response?.status === 401 && !original?._retry) {
  // ...
  
  // ✅ 로컬 저장소와 쿠키 둘 다 확인
  const { refresh: storedRefresh } = await loadTokens();
  const cookieMap = await CookieManager.get(refreshUrl);
  const refreshCookie = cookieMap?.refresh?.value;
  
  // 우선순위: 쿠키 > 로컬 저장소
  const refresh = refreshCookie || storedRefresh;
  
  if (!refresh) {
    console.warn("[Auth] No refresh token available (cookie + local both empty)");
    await clearTokens();
    throw error;
  }
  
  console.log("[Auth] Using refresh token from:", refreshCookie ? "cookie" : "local");
  // ... 토큰 갱신 진행
}
```

### 4. 디버깅 및 모니터링 강화

**추가할 로그:**

```typescript
// 토큰 저장 후 확인 로그
console.log("[Auth] Token storage status:", {
  hasAccessToken: !!(await loadTokens()).access,
  hasRefreshToken: !!(await loadTokens()).refresh,
  hasCookieRefresh: !!(await CookieManager.get(refreshUrl))?.refresh?.value
});
```

## 🧪 테스트 방법

1. **로그인 후 토큰 저장 확인:**
   ```typescript
   // 소셜 로그인 후 콘솔에서 확인
   const tokens = await loadTokens();
   console.log("Stored tokens:", tokens);
   ```

2. **토큰 갱신 테스트:**
   - 앱을 오랫동안 방치 후 API 호출
   - 401 에러 발생 시 자동 토큰 갱신 동작 확인

3. **쿠키 vs 로컬 저장소 동기화 확인:**
   - 앱 재시작 후에도 토큰이 유지되는지 확인

## 📋 체크리스트

- [ ] `token.store.ts`에서 리프레시 토큰 저장/로드 로직 구현
- [ ] `auth.ts`에서 소셜 로그인 후 리프레시 토큰 저장
- [ ] `client.ts`에서 토큰 갱신 로직 개선
- [ ] 디버깅 로그 추가
- [ ] 토큰 저장/갱신 테스트
- [ ] 앱 재시작 후 토큰 유지 테스트

## 🎯 우선순위

1. **HIGH**: 리프레시 토큰 저장 로직 구현 (`token.store.ts`)
2. **HIGH**: 소셜 로그인 후 토큰 저장 로직 수정 (`auth.ts`)
3. **MEDIUM**: 토큰 갱신 로직 개선 (`client.ts`)
4. **LOW**: 추가 디버깅 로그 및 모니터링

이 문제들을 해결하면 서버에서 발생하는 인증 오류들이 해결될 것입니다.