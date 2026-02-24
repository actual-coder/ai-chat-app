import { useSession } from "@/lib/auth";
import { ThemeProvider, useTheme } from "@/providers/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Toaster } from "sonner-native";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

const Main = () => {
  const { isPending, data: sessionData } = useSession();

  const { colors, theme } = useTheme();

  const isDark = theme === "dark";

  const isAuthenticated = Boolean(sessionData?.session);

  useEffect(() => {
    if (!isPending) SplashScreen.hideAsync();
  }, [isPending]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_left",
        }}
      >
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>

        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="login/index" />
        </Stack.Protected>
      </Stack>

      <StatusBar style={isDark ? "light" : "dark"} />
      <Toaster />
    </View>
  );
};

export const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Main />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
