const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// SVG 트랜스포머 설정
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

// SVG를 sourceExts에 추가하고 assetExts에서 제외
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
};

// 모든 설정이 완료된 config 객체에 NativeWind를 적용하고 내보내기
module.exports = withNativeWind(config, { input: './global.css' });