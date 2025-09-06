import client from '@/shared/api/client';

// ?뚯뀥 濡쒓렇??(移댁뭅???≪꽭???좏겙 -> ?쒕쾭 JWT ?좏겙)
export async function socialLogin(socialAccessToken: string, socialType: 'KAKAO' | 'GOOGLE') {
  const res = await client.post('/api/auth/social/login', {
    socialAccessToken,
    socialType,
  });
  return res.data?.data;
}

// ?좏겙 ?щ컻湲?
export async function refreshToken(refreshToken: string) {
  const res = await client.post(
    '/api/auth/token/refresh',
    {},
    { headers: { Authorization: `Bearer ${refreshToken}` } },
  );
  return res.data;
}

// 濡쒓렇?꾩썐
export async function logout(accessToken: string) {
  await client.post(
    '/api/auth/logout',
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
}

