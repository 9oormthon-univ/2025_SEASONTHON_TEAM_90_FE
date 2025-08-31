import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Rect, Path, LinearGradient, Stop } from 'react-native-svg';

export interface GridPaperProps {
    /** 작은 격자 한 칸의 픽셀 크기 */
    cell?: number;
    /** N칸마다 진한 라인 */
    majorEvery?: number;
    /** 배경색 */
    bg?: string;
    /** 굵은 선 색 */
    major?: string;
    /** 상단 은은한 그림자(헤더 밑단) 표시 */
    topShade?: boolean;
    /** 전체 투명도 */
    opacity?: number;
}

/**
 * 모눈종이(Grid paper) 배경.
 * - RN(Web/Native) 공용
 * - react-native-svg-transformer 필요
 */
const GridPaper: React.FC<GridPaperProps> = ({
    cell = 24, // 이미지의 칸 크기에 맞춰 24px 유지 (혹은 20px, 28px 등 실험)
    majorEvery = 5, // 굵은 선은 5칸마다 (이미지처럼 주 단위 구분을 하려면 패턴 변경 필요)
    // --- 이미지에 맞춰 색상 변경 ---
    bg = '#f6f0de', // 더 밝은 배경색 (거의 흰색에 가까움)
    major = '#fffdf6', // 굵은 선 색상
    topShade = false,  // 이미지에 상단 그림자가 없으므로 false로 변경
    opacity = 1,
}) => {
    const group = cell * majorEvery;

    return (
        <Svg pointerEvents="none" style={StyleSheet.absoluteFill as any} opacity={opacity} width="100%" height="100%" preserveAspectRatio="none">
            <Defs>
                <Pattern id="grid-minor" width={cell} height={cell} patternUnits="userSpaceOnUse">
                    <Rect width={cell} height={cell} fill={bg} />
                    <Path
                        d={`M 0 ${cell} H ${cell} M ${cell} 0 V ${cell}`}
                        stroke={major}      // 얇은 선(minor) 색상 대신 굵은 선(major) 색상 사용
                        strokeWidth={1.5}   // 굵은 선의 두께(1.5)로 변경
                    />
                </Pattern>

                {/* 상단 그라데이션 */}
                <LinearGradient id="topShade" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="black" stopOpacity="0.08" />
                    <Stop offset="1" stopColor="black" stopOpacity="0" />
                </LinearGradient>
            </Defs>

            {/* 이제 grid-minor 패턴 하나만 렌더링하면 됩니다. */}
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grid-minor)" />
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grid-dots)" />

            {topShade && <Rect x="0" y="0" width="100%" height="36" fill="url(#topShade)" />}
        </Svg>
    );
};

export default React.memo(GridPaper);