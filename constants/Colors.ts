const brandPrimary = "#4B3A2B";
const mute = "#9C8E80";
const white = "#FFFFFF";

export default {
  light: {
    text: "#000",
    background: "#fff",
    tint: brandPrimary,
    tabIconDefault: mute,
    tabIconSelected: brandPrimary,
  },
  dark: {
    text: "#fff",
    background: "#000",
    tint: "#E7D6C1",
    tabIconDefault: mute,
    tabIconSelected: "#E7D6C1",
  },
  // ✅ 여기 추가
  brandPrimary,
  mute,
  white,
};
