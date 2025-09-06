// src/features/mypage/mock/mypage.mock.ts
export const mockMyInfo = {
  code: 'S208',
  message: '회원 정보 조회 성공',
  data: {
    id: 1,
    memberName: '박수빈',
    memberEmail: 'subin@naver.com',
    socialType: 'KAKAO',
    profileImageUrl: 'https://placehold.co/200x200.png', // ✅ URL로 교체
    interests: [
      { code: 'HEALTH', description: '건강' },
      { code: 'LEARNING', description: '학습' },
    ],
  },
};

// ✅ 오늘 기록 mock
export const mockTodayRecord = {
  code: 'S200',
  message: 'success',
  data: {
    routineRecords: [
      { routineId: 1, consecutiveDays: 20 },
      { routineId: 2, consecutiveDays: 30 },
    ],
  },
};

// ✅ 주간 대시보드 통계 mock
export const mockWeeklyStats = {
  code: 'S200',
  message: '성공',
  data: {
    metrics: {
      overall: { rate: 72.5 },
    },
  },
};
