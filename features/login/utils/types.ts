export type CommonApiResponse<T> = {
  code: string; // e.g. "S200"
  message: string; // e.g. "성공"
  data: T | null;
};

export type SocialLoginResponse = {
  accessToken: string; // "Bearer eyJ..."
  tokenType: "Bearer";
  expiresIn: number; // 3600
  refreshTokenIncluded: boolean;
};
