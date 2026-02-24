import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers/theme-provider";
import { Feather } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { signOut, useSession } from "@/lib/auth";
import Constants from "expo-constants";
import { toast } from "sonner-native";
import { bucketUrl } from "@/constants/server";

const version = Constants.expoConfig?.version;

export default function Profile() {
  const { colors, theme, toggleTheme } = useTheme();
  const router = useRouter();

  const { data: sessionData } = useSession();

  const user = sessionData?.user;

  if (!user) return <Redirect href={"/login"} />;

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) return toast.error(error.message || "Something went wrong");
  };

  const Header = (
    <View
      style={[
        styles.header,
        {
          borderBottomColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.7}
        onPress={() => router.back()}
      >
        <Feather name="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text
        style={[
          styles.headerTitle,
          {
            color: colors.text,
          },
        ]}
      >
        Profile
      </Text>

      <View style={{ width: 24 }} />
    </View>
  );

  const Body = (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.userInfoSection}>
        <Image
          source={{ uri: bucketUrl.public(user.image) }}
          style={[
            styles.avatar,
            {
              borderColor: colors.surface,
            },
          ]}
        />

        <Text
          style={[
            styles.userName,
            {
              color: colors.text,
            },
          ]}
        >
          {user.name}
        </Text>

        <Text
          style={[
            styles.userEmail,
            {
              color: colors.textDim,
            },
          ]}
        >
          {user.email}
        </Text>

        <TouchableOpacity
          style={[
            styles.editButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          activeOpacity={0.7}
          onPress={() => router.push("/profile/edit")}
        >
          <Text
            style={[
              styles.editButtonText,
              {
                color: colors.text,
              },
            ]}
          >
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.settingsSection,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.settingRow}
          activeOpacity={0.7}
          onPress={() => router.push("/analytics")}
        >
          <View style={styles.settingRowLeft}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: colors.primaryLight,
                },
              ]}
            >
              <Feather name="bar-chart-2" size={20} color={colors.primary} />
            </View>
            <Text
              style={[
                styles.settingText,
                {
                  color: colors.text,
                },
              ]}
            >
              Usage & Analytics
            </Text>
          </View>

          <Feather name="chevron-right" size={20} color={colors.textDim} />
        </TouchableOpacity>

        <View
          style={[
            styles.divider,
            {
              backgroundColor: colors.border,
            },
          ]}
        />

        <View style={styles.settingRow}>
          <View style={styles.settingRowLeft}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: "rgba(139, 148, 158, 0.15)",
                },
              ]}
            >
              <Feather
                name={theme === "dark" ? "moon" : "sun"}
                size={20}
                color={colors.textDim}
              />
            </View>
            <Text
              style={[
                styles.settingText,
                {
                  color: colors.text,
                },
              ]}
            >
              Dark Mode
            </Text>
          </View>
          <Switch
            value={theme === "dark"}
            onValueChange={toggleTheme}
            trackColor={{ false: "#333", true: colors.primary }}
            thumbColor={theme === "dark" ? "#fff" : colors.primary}
          />
        </View>
      </View>
    </ScrollView>
  );

  const Footer = (
    <View style={styles.bottomSection}>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Feather name="log-out" size={20} color="#f85149" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text
        style={[
          styles.versionText,
          {
            color: colors.textDim,
          },
        ]}
      >
        App Version {version}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {Header}

      {Body}

      {Footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // User Info
  userInfoSection: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    marginBottom: 20,
  },
  editButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Settings Section
  settingsSection: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginLeft: 72, // Aligns divider with text, skipping the icon
  },

  // Bottom Section
  bottomSection: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 10 : 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(248, 81, 73, 0.1)", // Light red background
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(248, 81, 73, 0.3)",
    marginBottom: 16,
  },
  logoutText: {
    color: "#f85149", // GitHub Red
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  versionText: {
    fontSize: 12,
    textAlign: "center",
  },
});
