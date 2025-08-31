// 누락 파일 때문에 추가 했습니다. 필요시 삭제 해도 상관 없습니다.
import { Appearance } from 'react-native';

export type ColorScheme = 'light' | 'dark';

export function useColorScheme(): ColorScheme {
    const scheme = Appearance.getColorScheme();
    return (scheme === 'dark' ? 'dark' : 'light');
}