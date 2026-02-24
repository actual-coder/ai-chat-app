import { Platform } from "react-native";

export const COLORS = {
  light: {
    bg: "#FFFFFF",
    surface: "#F5F5F5",
    primary: "#a2ca00",
    primaryLight: "#a2ca0034",
    text: "#121212",
    textDim: "#666666",
    border: "#E5E5E5",
    userBubble: "#a2ca00",
    aiBubble: "#F0F0F0",
    codeBg: "#F6F8FA",
  },
  dark: {
    bg: "#121212",
    surface: "#1E1E1E",
    primary: "#ccff00",
    primaryLight: "#7592023f",
    text: "#FFFFFF",
    textDim: "#AAAAAA",
    border: "#333333",
    userBubble: "#ccff00",
    aiBubble: "#2C2C2C",
    codeBg: "#272822",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
