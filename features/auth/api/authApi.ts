import axios from 'axios';

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL, // 예: "https://your-api.com"
  headers: { 'Content-Type': 'application/json' },
});

// 소셜 로그인 (카카오 액세스 토큰 -> 서버 JWT 토큰)
export async function socialLogin(socialAccessToken: string, socialType: 'KAKAO' | 'GOOGLE') {
  const res = await client.post('/api/auth/social/login', {
    socialAccessToken,
    socialType,
  });
  return res.data; // { accessToken, tokenType, expiresIn, refreshTokenIncluded }
}

// 토큰 재발급
export async function refreshToken(refreshToken: string) {
  const res = await client.post(
    '/api/auth/token/refresh',
    {},
    { headers: { Authorization: `Bearer ${refreshToken}` } },
  );
  return res.data;
}

// 로그아웃
export async function logout(accessToken: string) {
  await client.post(
    '/api/auth/logout',
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
}
