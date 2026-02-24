import { signIn } from "@/lib/auth";
import { useTheme } from "@/providers/theme-provider";
import { AntDesign } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { BotMessageSquareIcon } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

type Provider = "google" | "github";

export default function Login() {
  const { colors } = useTheme();

  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);

  const handleLogin = async (provider: Provider) => {
    setActiveProvider(provider);

    const callbackURL = Linking.createURL("/conversation/new");

    const { error } = await signIn.social({ provider, callbackURL });

    if (error) {
      toast.error(error.message || "Something went wrong");
      setActiveProvider(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View
            style={[
              styles.logo,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <BotMessageSquareIcon size={48} color={colors.primary} />
          </View>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Welcome Back
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textDim,
              },
            ]}
          >
            Sign in to continue to your AI workspace.
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.authButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => handleLogin("google")}
          >
            <View style={styles.iconContainer}>
              {activeProvider === "google" ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <AntDesign name="google" size={22} color={colors.primary} />
              )}
            </View>

            <Text style={[styles.authButtonText, { color: colors.text }]}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authButton, styles.githubButton]}
            activeOpacity={0.8}
            onPress={() => handleLogin("github")}
          >
            <View style={styles.iconContainer}>
              {activeProvider === "github" ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <AntDesign name="github" size={22} color={"white"} />
              )}
            </View>

            <Text style={[styles.authButtonText, styles.githubButtonText]}>
              Continue with Github
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              {
                color: colors.textDim,
              },
            ]}
          >
            By continuing, you agree to our{" "}
            <Text
              style={[
                styles.linkText,
                {
                  color: colors.primary,
                },
              ]}
            >
              Terms of Service
            </Text>
            <Text> and </Text>
            <Text
              style={[
                styles.linkText,
                {
                  color: colors.primary,
                },
              ]}
            >
              Privacy Policy
            </Text>
            .
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: Platform.OS === "android" ? 24 : 10,
  },

  headerContainer: {
    alignItems: "center",
    marginTop: 60,
  },

  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 24,
  },

  buttonContainer: {
    width: "100%",
    gap: 16,
    marginBottom: 40,
  },

  authButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  authButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
    flex: 1,
  },

  githubButton: {
    backgroundColor: "#24292e",
    borderColor: "#1b1f23",
  },
  githubButtonText: {
    color: "#ffffff",
  },

  footer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  linkText: {
    fontWeight: "500",
  },
});
