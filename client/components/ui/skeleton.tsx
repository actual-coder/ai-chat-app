import { useTheme } from "@/providers/theme-provider";
import { memo, useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const Skeleton = memo(({ style }: { style?: StyleProp<ViewStyle> }) => {
  const { colors } = useTheme();

  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.8, { duration: 800 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ backgroundColor: colors.border }, animatedStyle, style]}
    />
  );
});
