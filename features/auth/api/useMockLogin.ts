import { useSessionStore } from '@/features/auth/store/session.store';

export function useMockLogin() {
  const { setUser, setTokens } = useSessionStore();

  const handleMockLogin = async () => {
    try {
      // ✅ 실제 API 호출 부분은 주석 처리 (백엔드 붙으면 다시 사용)
      // const res = await axios.post(`${API_BASE}/api/dev/auth/mock-login`, {
      //   email: 'test@example.com',
      //   name: '테스트유저',
      //   socialType: 'KAKAO',
      //   mockSocialId: 'mock_user_001',
      // });
      // const { accessToken, refreshToken } = res.data.data;
      // setTokens({ accessToken, refreshToken });

      // const me = await axios.get(`${API_BASE}/api/members/me`, {
      //   headers: { Authorization: accessToken },
      // });
      // setUser(me.data);

      // ✅ 더미 데이터로 로그인 처리
      setTokens({
        accessToken: 'dummy-access-token',
        refreshToken: 'dummy-refresh-token',
      });

      setUser({
        id: '1',
        nickname: '테스트유저',
        profileImageUrl: 'https://placekitten.com/200/200',
        interests: ['HEALTH', 'LEARNING'],
      });

      return true; // 로그인 성공
    } catch (err) {
      console.error('Mock 로그인 실패:', err);
      return false;
    }
  };

  return { handleMockLogin };
}
