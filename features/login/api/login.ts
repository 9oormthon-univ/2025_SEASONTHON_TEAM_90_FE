import client from '@/shared/api/client';

/**
 * 이메일만 보내서 로그인 (백엔드가 이 형태에 맞추어 줄 예정)
 * 요청 바디: { email: string }
 * 응답 예시:
 * {
 *   "accessToken":"Bearer eyJ...","tokenType":"Bearer","expiresIn":3600
 * }
 */
export type LoginResponse = {
    accessToken: string;
    tokenType?: string;
    expiresIn?: number;
};

export type SocialType = 'KAKAO' | 'GOOGLE' | 'APPLE' | 'NAVER';

type DevMockLoginParams = {
    email: string;
    name?: string;
    socialType?: SocialType;
    mockSocialId?: string;
};


export async function devMockLogin(params: DevMockLoginParams): Promise<LoginResponse> {
    const { email, name, socialType, mockSocialId } = params;

    const payload = {
        email,
        name: name ?? '테스트유저',
        socialType: socialType ?? 'KAKAO',
        mockSocialId: mockSocialId ?? `mock_${email.split('@')[0]}`,
    };

    const res = await client.post('/api/dev/auth/mock-login', payload);
    return res.data as LoginResponse;
}

