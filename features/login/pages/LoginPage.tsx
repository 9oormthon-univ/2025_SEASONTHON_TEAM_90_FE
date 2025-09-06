import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { loginWithEmail } from '@/features/login/api/login';
import { useAuthStore } from '@/features/login/store/auth.store';
import { validateEmail } from '@/features/login/utils/validateEmail';
import HabiGlow from '../assets/HabiGlow.svg'
import Logo from '../assets/logo.svg'

/** 로그인 화면
 * - UI: 이메일/비밀번호 입력, 로그인 버튼
 * - 실제 요청: 이메일만 전송
 */
type Nav = ReturnType<typeof useNavigation>;

export default function LoginPage() {
    const navigation = useNavigation<Nav>();
    const setTokens = useAuthStore((s) => s.setTokens);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // UI용
    const [loading, setLoading] = useState(false);

    const emailValid = useMemo(() => validateEmail(email), [email]);
    const disabled = loading || !emailValid;

    const onSubmit = async () => {
        if (!emailValid) {
            Alert.alert('이메일 형식이 올바르지 않습니다.');
            return;
        }
        try {
            setLoading(true);
            const res = await loginWithEmail(email);
            const token = res.accessToken;
            setTokens({ accessToken: token });
            // 로그인 성공 시 홈으로 교체
            // 네비게이션 구조에 맞게 'Home' 라우트명만 맞춰주면 됨
            // @ts-ignore
            router.replace("/(tabs)/home");
        } catch (e: any) {
            Alert.alert('로그인 실패', e?.response?.data?.message ?? '다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="justify-center flex-1 p-6 bg-[#F2EFE6]">
            <View className='flex-col items-center gap-[10px] mb-8'>
                <Logo />
                <HabiGlow />
            </View>
            <View className="gap-8">
                <TextInput
                    className="p-5 border rounded-xl"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="이메일을 입력해 주세요"
                    textContentType="emailAddress"
                />

                <TextInput
                    className="p-5 border rounded-xl"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="비밀번호를 입력해 주세요"
                    secureTextEntry
                    textContentType="password"
                />

                <Pressable
                    disabled={disabled}
                    onPress={onSubmit}
                    className={` rounded-xl items-center justify-center p-5 ${disabled ? 'opacity-50' : ''} bg-[#5F5548]`}
                    accessibilityRole="button"
                    accessibilityLabel="로그인 하기"
                >
                    {loading ? <ActivityIndicator /> : <Text className="text-[20px] font-semibold text-white">로그인 하기</Text>}
                </Pressable>
            </View>
        </View>
    );
}
