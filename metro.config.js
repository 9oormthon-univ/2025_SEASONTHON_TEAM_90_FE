// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// ✅ Expo 패키지 exports 해석만 활성화 (조건 이름은 건드리지 말 것)
config.resolver.unstable_enablePackageExports = true;

// --- SVG Transformer ---
config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg");
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

// --- NativeWind ---
module.exports = withNativeWind(config, { input: "./global.css" });
