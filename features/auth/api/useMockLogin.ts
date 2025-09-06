import client, { setAccessToken, setRefreshToken } from '@/shared/api/client';
import { useSessionStore } from '@/features/auth/store/session.store';

export function useMockLogin() {
  const { setUser, setTokens } = useSessionStore();

  const handleMockLogin = async () => {
    try {
      // 1) mock 로그인 요청
      const res = await client.post('/api/dev/auth/mock-login', {
        email: 'test@example.com',
        name: '테스트유저',
        socialType: 'KAKAO',
        mockSocialId: 'mock_user_001',
      });

      console.log('✅ mock-login response:', res.data);

      const raw = res.data.data ?? res.data;
      const { accessToken, refreshToken } = raw;

      if (!accessToken) throw new Error('accessToken 없음');

      // Bearer 접두어 제거 (client.ts에서 Bearer 붙여줌)
      const pureToken = accessToken.startsWith('Bearer ')
        ? accessToken.replace('Bearer ', '')
        : accessToken;

      // 2) 토큰 저장 (AsyncStorage + store 둘 다)
      await setAccessToken(pureToken);
      await setRefreshToken(refreshToken);

      setTokens({
        accessToken: pureToken,
        refreshToken,
      });

      // 3) 내 정보 조회 (client 사용 → 헤더 자동 주입됨)
      const me = await client.get('/api/members/me');

      setUser({
        id: me.data.id,
        name: me.data.memberName,
        nickname: me.data.memberName,
        profileImageUrl: me.data.profileImageUrl,
        interests: me.data.interests?.map((i: any) => i.code) ?? [],
      });

      return true;
    } catch (err: any) {
      console.error('❌ Mock 로그인 실패:', err.response?.data ?? err);
      return false;
    }
  };

  return { handleMockLogin };
}
