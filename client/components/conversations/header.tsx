import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { ShareIcon, TextAlignStart } from "lucide-react-native";
import { useTheme } from "@/providers/theme-provider";
import { useConversationStore } from "@/store";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner-native";
import { useSession } from "@/lib/auth";
import * as Clipboard from "expo-clipboard";
import { getPubicUrl } from "@/api/conversation";

type Props = {
  openDrawer: () => void;
  conversationId: string;
};
export const Header = ({ openDrawer, conversationId }: Props) => {
  const title = useConversationStore((s) => s.conversationTitle);
  const model = useConversationStore((s) => s.model);

  const { data: sessionData } = useSession();

  const { colors } = useTheme();

  const { mutate, isPending } = useMutation({
    mutationKey: ["share", conversationId],
    mutationFn: getPubicUrl,
    onSuccess: async (data) => {
      await Clipboard.setStringAsync(data.url);
      toast.success("Link Copied");
    },
    onError: (err) => toast.error(err.message || "Something went wrong"),
  });

  const shareHandler = () => {
    if (conversationId === "new") return toast.error("Select a conversation");
    mutate({ conversationId, token: sessionData?.session.token });
  };
  return (
    <View style={styles.header}>
      <TouchableOpacity onPressOut={openDrawer}>
        <TextAlignStart size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.headerTitleContainer}>
        <Text
          numberOfLines={1}
          style={[styles.headerTitle, { color: colors.text }]}
        >
          {title}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textDim }]}>
          {model}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.shareButton,
          {
            backgroundColor: colors.surface,
          },
        ]}
        onPress={shareHandler}
        disabled={isPending}
      >
        {isPending ? (
          <ActivityIndicator size={18} color={colors.text} />
        ) : (
          <ShareIcon size={18} color={colors.text} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitleContainer: {
    alignItems: "center",
    width: "60%",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 12,
  },

  shareButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
});
