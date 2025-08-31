module.exports = function (api) {
  api.cache(true);
  return {
    // presets: ["babel-preset-expo"],
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel"],
    plugins: [
      ["module-resolver", {
        root: ["."],
        alias: {
          "@": "./",
          "@features": "./features",
          "@shared": "./shared",
        },
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
      }],
      "react-native-reanimated/plugin",
    ],
  };
};