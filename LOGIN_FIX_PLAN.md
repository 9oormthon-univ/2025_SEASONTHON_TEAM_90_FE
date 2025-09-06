# 로그인 인증 시스템 수정 계획서

## 🎯 목표
리프레시 토큰 저장/관리 로직을 구현하여 서버 인증 오류(TOKEN004)를 해결하고 안정적인 토큰 갱신 시스템을 구축합니다.

## 🚨 현재 문제점 요약

### 1. 핵심 문제
- **리프레시 토큰 미저장**: `token.store.ts:54`에서 `refresh: null` 하드코딩
- **토큰 갱신 실패**: 401 에러 시 리프레시 토큰을 찾지 못해 갱신 실패
- **불안정한 쿠키 의존**: 쿠키에만 의존하는 리프레시 토큰 관리

### 2. 서버 에러 로그
```
TOKEN004 - 리프레시 토큰을 찾을 수 없습니다
JwtAuthenticationEntryPoint: Full authentication is required to access this resource
```

## 📋 수정 계획

### Phase 1: 리프레시 토큰 저장소 구현 [HIGH PRIORITY]

#### 파일: `features/login/token.store.ts`

**현재 문제:**
```typescript
// ❌ 현재: 리프레시 토큰이 항상 null
export async function loadTokens(): Promise<{ access: string | null; refresh: null }> {
  return { access: await _getAccess(), refresh: null };
}
```

**수정 계획:**
1. 리프레시 토큰 저장/로드 함수 구현
2. 웹/모바일 환경 대응 (localStorage/SecureStore)
3. 메모리 캐싱 구현
4. saveTokens 함수에서 리프레시 토큰 저장 로직 추가

**구현 세부사항:**
```typescript
const REFRESH_KEY = "app_refresh_token";
let memRefresh: string | null = null;

// 새로 추가할 함수들
async function _setRefresh(v: string | null)
async function _getRefresh(): Promise<string | null>
export async function saveRefreshTokenOnly(refresh: string)
export async function loadRefreshTokenOnly(): Promise<string | null>
export async function clearRefreshTokenOnly()
```

### Phase 2: 소셜 로그인 토큰 저장 로직 개선 [HIGH PRIORITY]

#### 파일: `features/login/api/auth.ts`

**현재 상태:**
- 소셜 로그인 후 Access Token만 저장 (Line 60)
- 쿠키에서 리프레시 토큰 확인만 하고 로컬 저장 안함 (Line 68-69)

**수정 계획:**
1. 소셜 로그인 성공 후 쿠키에서 리프레시 토큰 추출
2. 추출한 리프레시 토큰을 로컬 저장소에도 저장
3. 저장 성공 여부 로깅 강화

**구현 포인트:**
```typescript
// socialLogin 함수 내 추가
const refreshUrl = `${rawBaseURL}/api/auth/token/refresh`;
const saved = await CookieManager.get(refreshUrl);
const refreshToken = saved?.refresh?.value;

if (refreshToken) {
  await saveTokens({ refresh: refreshToken });
  console.log("[Auth] Refresh token saved to local storage");
}
```

### Phase 3: 토큰 갱신 로직 강화 [MEDIUM PRIORITY]

#### 파일: `features/login/api/client.ts`

**현재 문제:**
- 쿠키에서만 리프레시 토큰 조회 (Line 150)
- 로컬 저장소의 리프레시 토큰 무시 (Line 152에서 `storedRefresh` 사용 안함)

**수정 계획:**
1. 로컬 저장소와 쿠키 모두 확인하는 로직
2. 우선순위: 쿠키 > 로컬 저장소
3. 토큰 갱신 성공 시 새 리프레시 토큰도 로컬에 저장
4. 디버깅 로그 개선

### Phase 4: 에러 핸들링 및 사용자 경험 개선 [MEDIUM PRIORITY]

**에러 플로우 명시화:**
1. 리프레시 토큰마저 만료된 경우 처리
2. 자동 로그아웃 및 로그인 페이지 리디렉션
3. 사용자 친화적 에러 메시지
4. 네트워크 오류 시 재시도 로직

**추가할 모니터링:**
5. 토큰 저장/로드 상태 로깅
6. 쿠키 vs 로컬 저장소 동기화 상태 확인
7. 토큰 갱신 플로우 상세 로깅
8. 에러 발생 시 컨텍스트 정보 수집

### Phase 5: 성능 최적화 및 안정성 강화 [LOW PRIORITY]

**성능 고려사항:**
1. 토큰 저장소 이중 백업으로 인한 오버헤드 최소화
2. 메모리 캐시 효율성 개선
3. 불필요한 토큰 조회 횟수 줄이기

**안정성 강화:**
4. 롤백 계획 수립 (수정 실패 시 원래 상태 복구)
5. 기존 동작 보장을 위한 호환성 유지
6. 예외 상황 대응 로직 강화

## 📝 상세 구현 계획

### 1. token.store.ts 수정사항

```typescript
// 추가할 상수 및 변수
const REFRESH_KEY = "app_refresh_token";
let memRefresh: string | null = null;

// 추가할 함수들
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

// 수정할 함수들
export async function saveTokens(params: { access?: string | null; refresh?: string | null }) {
  if (typeof params.access !== "undefined") await _setAccess(ensureBearer(params.access ?? null));
  if (typeof params.refresh !== "undefined") await _setRefresh(params.refresh);
}

export async function loadTokens(): Promise<{ access: string | null; refresh: string | null }> {
  return { access: await _getAccess(), refresh: await _getRefresh() };
}

export async function clearTokens() {
  await _setAccess(null);
  await _setRefresh(null);
}
```

### 2. auth.ts 수정사항

```typescript
// socialLogin 함수 내 추가 (Line 64 이후)
await reflectSetCookie(res.headers);

// 🔹 추가: 리프레시 토큰 로컬 저장
const refreshUrl = `${rawBaseURL}/api/auth/token/refresh`;
const saved = await CookieManager.get(refreshUrl).catch(async () => CookieManager.get(ORIGIN));
const refreshToken = saved?.refresh?.value;

if (refreshToken) {
  await saveTokens({ refresh: refreshToken });
  console.log("[Auth] Refresh token saved to local storage");
} else {
  console.warn("[Auth] No refresh token found in cookies after login");
}

// 토큰 저장 상태 확인 로그
const tokens = await loadTokens();
console.log("[Auth] Token storage status after login:", {
  hasAccessToken: !!tokens.access,
  hasRefreshToken: !!tokens.refresh,
  hasCookieRefresh: !!refreshToken
});
```

### 3. client.ts 수정사항

```typescript
// 401 에러 처리 로직 수정 (Line 152 주변)
const { refresh: storedRefresh, access } = await loadTokens();
const cookieMap = await CookieManager.get(refreshUrl).catch(async () => {
  return CookieManager.get(ORIGIN);
});
const refreshCookie = cookieMap?.refresh?.value ?? null;

// 🔹 우선순위 로직: 쿠키 > 로컬 저장소
const refresh = refreshCookie || storedRefresh;
if (!refresh) {
  console.warn("[Auth] No refresh token available:", {
    cookieRefresh: !!refreshCookie,
    storedRefresh: !!storedRefresh
  });
  await clearTokens();
  // 🔹 추가: 사용자 세션 만료 처리
  await handleSessionExpired();
  throw error;
}

console.log("[Auth] Using refresh token from:", refreshCookie ? "cookie" : "local storage");

// 토큰 갱신 시도
try {
  // ... 토큰 갱신 로직 ...
  
  // 토큰 갱신 성공 후 새 리프레시 토큰도 저장
  const newAccess = ensureBearer(res?.data?.data?.accessToken ?? null);
  await saveTokens({ access: newAccess ?? access ?? null });
  setAccessTokenCached(newAccess ?? null);

  // 🔹 추가: 새 리프레시 토큰 로컬 저장
  const newRefreshMap = await CookieManager.get(refreshUrl).catch(async () => CookieManager.get(ORIGIN));
  const newRefreshToken = newRefreshMap?.refresh?.value;
  if (newRefreshToken) {
    await saveTokens({ refresh: newRefreshToken });
    console.log("[Auth] New refresh token saved after renewal");
  }
} catch (refreshError) {
  // 🔹 추가: 리프레시 토큰마저 만료된 경우 처리
  console.error("[Auth] Token refresh failed:", refreshError);
  await clearTokens();
  await handleSessionExpired();
  throw refreshError;
}

// 🔹 추가: 세션 만료 처리 함수
async function handleSessionExpired() {
  try {
    // 로그인 페이지로 리디렉션 또는 모달 표시
    // 구체적 구현은 앱의 네비게이션 구조에 따라 결정
    console.log("[Auth] Session expired, redirecting to login");
  } catch (e) {
    console.warn("[Auth] Failed to handle session expiration:", e);
  }
}
```

## ✅ 작업 체크리스트

### Phase 1: 리프레시 토큰 저장소 구현
- [ ] `REFRESH_KEY` 상수 추가
- [ ] `memRefresh` 메모리 캐시 변수 추가  
- [ ] `_setRefresh()` 함수 구현
- [ ] `_getRefresh()` 함수 구현
- [ ] `saveTokens()` 함수에 리프레시 토큰 저장 로직 추가
- [ ] `loadTokens()` 함수에서 실제 리프레시 토큰 반환하도록 수정
- [ ] `clearTokens()` 함수에 리프레시 토큰 삭제 로직 추가

### Phase 2: 소셜 로그인 개선
- [ ] `socialLogin()` 함수에서 쿠키 리프레시 토큰 추출
- [ ] 추출한 리프레시 토큰을 로컬 저장소에 저장
- [ ] 토큰 저장 성공/실패 로그 추가
- [ ] `refreshTokens()` 함수에도 동일한 로직 적용

### Phase 3: 토큰 갱신 로직 개선
- [ ] 401 에러 시 로컬 저장소와 쿠키 모두 확인
- [ ] 리프레시 토큰 우선순위 로직 구현 (쿠키 > 로컬)
- [ ] 토큰 갱신 성공 시 새 리프레시 토큰 저장
- [ ] 토큰 소스 로깅 (쿠키 vs 로컬)

### Phase 4: 에러 핸들링 및 사용자 경험
- [ ] 세션 만료 시 사용자 알림 및 리디렉션 로직 구현
- [ ] 네트워크 오류 시 재시도 로직 추가
- [ ] 사용자 친화적 에러 메시지 정의
- [ ] 토큰 갱신 실패 시 graceful degradation 처리

### Phase 5: 성능 최적화 및 안정성
- [ ] 토큰 조회 성능 최적화 (불필요한 호출 제거)
- [ ] 메모리 캐시 효율성 개선
- [ ] 롤백 계획 수립 및 테스트
- [ ] 기존 기능 호환성 확인

### Phase 6: 디버깅 및 종합 테스트
- [ ] 토큰 저장 상태 확인 로그 추가
- [ ] 에러 시 컨텍스트 정보 로깅
- [ ] 소셜 로그인 -> 토큰 저장 -> API 호출 플로우 테스트
- [ ] 앱 재시작 후 토큰 유지 테스트
- [ ] 토큰 만료 -> 자동 갱신 테스트
- [ ] 다양한 네트워크 환경에서의 동작 테스트

## 🧪 테스트 계획

### 단계별 테스트
1. **Phase 1 완료 후**: `loadTokens()` 함수가 올바른 리프레시 토큰 반환 확인
2. **Phase 2 완료 후**: 소셜 로그인 후 리프레시 토큰이 로컬에 저장되는지 확인  
3. **Phase 3 완료 후**: 401 에러 발생 시 자동 토큰 갱신 동작 확인
4. **전체 완료 후**: 앱 재시작 → 토큰 유지 → API 호출 성공 확인

### 검증 방법
```typescript
// 콘솔에서 실행할 디버깅 코드
const tokens = await loadTokens();
console.log("저장된 토큰:", {
  hasAccess: !!tokens.access,
  hasRefresh: !!tokens.refresh,
  accessLength: tokens.access?.length,
  refreshLength: tokens.refresh?.length
});

// 쿠키 확인
const cookieMap = await CookieManager.get("https://habiglow.duckdns.org/api/auth/token/refresh");
console.log("쿠키 상태:", {
  hasCookieRefresh: !!cookieMap?.refresh?.value,
  cookieKeys: Object.keys(cookieMap || {})
});
```

## ⚠️ 주의사항 및 위험 관리

### 보안 고려사항
1. **보안**: 리프레시 토큰을 SecureStore(모바일)/localStorage(웹)에 안전하게 저장
2. **로깅**: 민감한 토큰 값은 길이만 로깅, 전체 값 노출 금지
3. **토큰 암호화**: 필요시 로컬 저장 전 토큰 암호화 고려

### 안정성 보장
4. **동기화**: 쿠키와 로컬 저장소 간 토큰 동기화 유지
5. **에러 처리**: 토큰 저장/로드 실패 시 적절한 fallback 처리
6. **롤백 준비**: 수정 실패 시 이전 버전으로 즉시 복구 가능하도록 준비

### 성능 영향 최소화
7. **메모리 사용**: 토큰 이중 저장으로 인한 메모리 사용량 증가 모니터링
8. **I/O 최적화**: SecureStore/localStorage 접근 빈도 최소화
9. **배치 처리**: 토큰 저장/로드 작업을 가능한 배치로 처리

### 호환성 유지
10. **기존 코드**: 기존 토큰 관련 코드와의 호환성 보장
11. **점진적 배포**: 단계별 배포를 통한 안정성 확보

## 🎯 예상 결과

이 수정을 통해 다음 문제들이 해결될 예정입니다:

1. ✅ **TOKEN004 에러 해결**: 리프레시 토큰을 찾을 수 없다는 서버 에러 해결
2. ✅ **자동 토큰 갱신 복구**: 401 에러 시 자동으로 토큰 갱신되어 API 호출 성공  
3. ✅ **앱 재시작 후 로그인 유지**: 앱을 재시작해도 로그인 상태 유지
4. ✅ **안정적인 인증 플로우**: 쿠키와 로컬 저장소 이중 백업으로 안정성 향상

## 🔄 롤백 계획

### 즉시 롤백이 필요한 상황
1. 기존 로그인 기능이 완전히 작동하지 않는 경우
2. 심각한 보안 취약점이 발견된 경우
3. 앱 크래시가 빈번하게 발생하는 경우

### 롤백 절차
1. **코드 롤백**: Git을 통한 이전 커밋으로 되돌리기
2. **저장소 초기화**: 기존 사용자의 로컬 토큰 저장소 클리어
3. **쿠키 기반 복구**: 기존 쿠키 기반 인증 시스템으로 복구
4. **사용자 알림**: 임시 로그아웃 및 재로그인 안내

### 점진적 배포 전략
1. **개발 환경 테스트** → **스테이징 환경 검증** → **프로덕션 배포**
2. **소수 사용자 대상 A/B 테스트** 고려
3. **모니터링 강화**: 배포 후 24시간 집중 모니터링