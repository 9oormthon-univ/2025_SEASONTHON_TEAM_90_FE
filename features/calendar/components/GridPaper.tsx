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
 */
const GridPaper: React.FC<GridPaperProps> = ({
    cell = 24, // 이미지의 칸 크기에 맞춰 24px 유지
    majorEvery = 5, // 굵은 선은 5칸마다
    // 스포이드 추출 색상
    bg = '#f6f0de',
    major = '#fffdf6', // 선
    topShade = false, 
    opacity = 1,
}) => {
    const group = cell * majorEvery;

    return (
        <Svg pointerEvents="none" style={StyleSheet.absoluteFillObject} opacity={opacity} width="100%" height="100%" preserveAspectRatio="none">
            <Defs>
                <Pattern id="grid-minor" width={cell} height={cell} patternUnits="userSpaceOnUse">
                    <Rect width={cell} height={cell} fill={bg} />
                    <Path d={`M 0 ${cell} H ${cell} M ${cell} 0 V ${cell}`} stroke={major} strokeWidth={1.5} />
                </Pattern>
                <LinearGradient id="topShade" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="black" stopOpacity="0.08" />
                    <Stop offset="1" stopColor="black" stopOpacity="0" />
                </LinearGradient>
            </Defs>

            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grid-minor)" />

            {topShade && <Rect x="0" y="0" width="100%" height="36" fill="url(#topShade)" />}
        </Svg>
    );
};

export default React.memo(GridPaper);