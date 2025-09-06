export type CommonResponse<T> = {
  code: string; // "S200" 등
  message: string;
  data: T;
};

export type LoginResponse = {
  accessToken: string; // "Bearer eyJ..."
  tokenType: "Bearer";
  expiresIn: number;
  refreshTokenIncluded: boolean;
};

export type MemberMe = {
  id: number;
  memberName: string;
  memberEmail: string;
  socialType: "GOOGLE" | "KAKAO" | "NAVER";
  profileImageUrl?: string | null;
  interests: { code: string; description: string }[];
};

export type InterestsDTO = {
  memberId: number;
  interests: { code: string; description: string }[];
};
