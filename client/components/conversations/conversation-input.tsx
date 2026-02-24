import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useTheme } from "@/providers/theme-provider";
import { Feather, Ionicons } from "@expo/vector-icons";
import { PauseIcon } from "lucide-react-native";
import { toast } from "sonner-native";
import { useSession } from "@/lib/auth";
import { useConversationStore } from "@/store";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AIModel } from "@/constants/models";
import { server } from "@/constants/server";
import { fetch } from "expo/fetch";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

type Props = {
  onSend: (text: string) => Promise<void>;
  isStreaming: boolean;
  onStopStream: () => void;
};

const BASE_SHEET_HEIGHT = 400;

export const ConversationInput = ({
  onSend,
  isStreaming,
  onStopStream,
}: Props) => {
  const { colors } = useTheme();

  const { data: sessionData } = useSession();
  const insets = useSafeAreaInsets();

  const conversationId = useConversationStore((s) => s.conversationId);
  const model = useConversationStore((s) => s.model);
  const isThink = useConversationStore((s) => s.isThink);
  const isSearch = useConversationStore((s) => s.isSearch);
  const toggleSearch = useConversationStore((s) => s.toggleSearch);
  const toggleThink = useConversationStore((s) => s.toggleThink);
  const setModel = useConversationStore((s) => s.setModel);

  const token = sessionData?.session?.token;

  const [text, setText] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const SHEET_HEIGHT = BASE_SHEET_HEIGHT + insets.bottom;

  const settingsTranslateY = useSharedValue(SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: settingsTranslateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    pointerEvents: backdropOpacity.value > 0.1 ? "auto" : "none",
  }));

  const toggleSettings = () => {
    const opening = !isSettingsOpen;

    setIsSettingsOpen((prev) => !prev);

    settingsTranslateY.value = withSpring(opening ? 0 : SHEET_HEIGHT, {
      damping: 30,
      stiffness: 350,
      mass: 1,
    });

    backdropOpacity.value = withTiming(opening ? 1 : 0, {
      duration: 30,
      easing: Easing.out(Easing.quad),
    });

    if (opening) Keyboard.dismiss();
  };

  const handleSendMessage = async () => {
    if (!token) return toast.error("Login first");
    if (!text.trim() || isStreaming) return;

    const textBackup = text;
    setText("");

    try {
      await onSend(textBackup);
    } catch (error) {
      setText(textBackup);
      toast.error("Failed to send message");
    }
  };

  const handleDownload = async () => {
    if (conversationId === "new") {
      toast.error("Not Chat History");
      return;
    }
    try {
      setIsDownloading(true);

      const url = `${server}/api/conversations/${conversationId}/export`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Export failed (${response.status}): ${errorText}`);
      }

      let filename = `chat-${conversationId}.md`;
      const disposition = response.headers.get("content-disposition");
      if (disposition && disposition.includes('filename="')) {
        filename = disposition.split('filename="')[1].split('"')[0];
      }

      const markdown = await response.text();

      const destination = new File(Paths.document, filename);
      destination.write(markdown);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(destination.uri);
      } else {
        toast.success("Saved");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download chat history.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View
          style={[
            styles.inputContainer,
            { borderTopColor: colors.border, backgroundColor: colors.bg },
          ]}
        >
          <TouchableOpacity
            onPress={toggleSettings}
            style={[
              styles.settingsButton,
              {
                backgroundColor: colors.surface,
              },
            ]}
          >
            <Ionicons name="settings-sharp" size={22} color={colors.textDim} />
          </TouchableOpacity>

          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surface, color: colors.text },
            ]}
            placeholder="Message..."
            placeholderTextColor={colors.text}
            multiline
            value={text}
            onChangeText={setText}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={isStreaming ? onStopStream : handleSendMessage}
          >
            {isStreaming ? (
              <PauseIcon size={20} color={"black"} />
            ) : (
              <Ionicons name="arrow-up" size={20} color={"black"} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Backdrop */}
      {isSettingsOpen && (
        <TouchableWithoutFeedback onPress={toggleSettings}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </TouchableWithoutFeedback>
      )}

      {/* Reanimated Settings modal */}
      <Animated.View
        style={[
          styles.bottomSheet,
          sheetStyle,
          {
            height: SHEET_HEIGHT,
            paddingBottom: 24 + insets.bottom,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <View
          style={[
            styles.sheetHandle,
            {
              backgroundColor: colors.border,
            },
          ]}
        />

        <Text
          style={[
            styles.sheetTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Chat Configuration
        </Text>

        <View style={styles.settingSection}>
          <Text
            style={[
              styles.sectionLabel,
              {
                color: colors.textDim,
              },
            ]}
          >
            Model
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.modelRow}>
              {Object.values(AIModel).map((m) => {
                const isActive = model === m;

                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setModel(m)}
                    style={[
                      styles.modelChip,
                      isActive
                        ? {
                            backgroundColor: colors.primaryLight,
                            borderColor: colors.primary,
                          }
                        : {
                            backgroundColor: colors.border,
                            borderColor: colors.border,
                          },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modelText,
                        {
                          color: isActive ? colors.primary : colors.text,
                        },
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <SettingsRow
          title="Thinking Mode"
          desc="Enable Deep Reasoning"
          val={isThink}
          toggle={toggleThink}
        />

        <SettingsRow
          title="Web Search"
          desc="Access real-time data"
          val={isSearch}
          toggle={toggleSearch}
        />

        <TouchableOpacity
          style={[
            styles.downloadButton,
            {
              backgroundColor: colors.border,
            },
          ]}
          disabled={isDownloading}
          onPress={handleDownload}
        >
          {isDownloading ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
          ) : (
            <Feather
              name="download-cloud"
              size={20}
              color={colors.text}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={[
              styles.downloadText,
              {
                color: colors.text,
              },
            ]}
          >
            Export Chat
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const SettingsRow = ({
  title,
  desc,
  val,
  toggle,
}: {
  title: string;
  desc: string;
  val: boolean;
  toggle: () => void;
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.settingRow}>
      <View style={styles.settingTextContainer}>
        <Text
          style={[
            styles.settingLabel,
            {
              color: colors.text,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.settingDesc,
            {
              color: colors.textDim,
            },
          ]}
        >
          {desc}
        </Text>
      </View>
      <Switch
        value={val}
        onValueChange={toggle}
        trackColor={{
          false: colors.primaryLight,
          true: colors.primary,
        }}
        thumbColor={colors.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
  },
  settingsButton: {
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 1,
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  settingSection: {
    marginBottom: 24,
  },
  modelRow: {
    flexDirection: "row",
    gap: 10,
  },
  modelChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },

  modelText: {
    fontWeight: "500",
  },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  downloadButton: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
  },
  downloadText: {
    fontWeight: "600",
    fontSize: 15,
  },
});
