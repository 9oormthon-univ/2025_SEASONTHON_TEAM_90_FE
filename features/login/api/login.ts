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

export async function loginWithEmail(email: string): Promise<LoginResponse> {
    const res = await client.post('/api/auth/login', { email }); // ← 백엔드가 엔드포인트 매핑
    return res.data as LoginResponse;
}
