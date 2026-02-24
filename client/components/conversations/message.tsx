import { View, Text, StyleSheet, Dimensions, Linking } from "react-native";
import React, { memo } from "react";
import { Message } from "@/types/conversation";
import { useTheme } from "@/providers/theme-provider";
import { Markdown } from "@codearcade/expo-markdown-native";
import * as Clipboard from "expo-clipboard";

const SCREEN_WIDTH = Dimensions.get("window").width;

export const MessageItem = memo(({ item }: { item: Message }) => {
  const { colors, theme } = useTheme();

  const isUser = item.role === "USER";
  const textStyles = isUser
    ? styles.userMessageText
    : {
        ...styles.messageText,
        color: colors.text,
      };

  return (
    <View>
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
        {isUser ? (
          <View
            style={[
              styles.bubble,
              styles.userBubble,
              {
                backgroundColor: colors.userBubble,
              },
            ]}
          >
            <Text style={textStyles}>{item.content}</Text>
          </View>
        ) : (
          <View style={[styles.bubble, styles.aiBubble]}>
            <Markdown
              theme={theme}
              content={item.content}
              onCopy={async (text) => {
                await Clipboard.setStringAsync(text);
              }}
              onLinkPress={(url) => {
                Linking.openURL(url);
                return true;
              }}
              styles={{
                body: {
                  fontSize: 15,
                  width: SCREEN_WIDTH * 0.88,
                },
                code_inline: {
                  fontSize: 13,
                  borderRadius: 4,
                  padding: 8,
                  backgroundColor: colors.surface,
                  color: colors.primary,
                },
                blockquote: {
                  backgroundColor: colors.surface,
                  borderLeftColor: colors.primary,
                  padding: 12,
                  paddingLeft: 16,
                  borderRadius: 20,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  marginVertical: 8,
                  fontStyle: "italic",
                  fontSize: 14,
                },
              }}
              codeStyle={{
                container: {
                  borderRadius: 12,
                  marginVertical: 16,
                  backgroundColor: colors.surface,
                },
                header: {
                  paddingVertical: 1,
                  backgroundColor: colors.codeBg,
                },
                headerText: {
                  color: colors.textDim,
                  fontSize: 10,
                  letterSpacing: 0.5,
                },
                content: {
                  paddingTop: 20,
                  paddingHorizontal: 16,
                  paddingBottom: 0,
                },
                text: {
                  fontSize: 12,
                },
              }}
            />
          </View>
        )}
      </View>
      <Text
        style={[
          styles.createdAt,
          {
            color: colors.textDim,
            marginLeft: isUser ? "auto" : 52,
          },
        ]}
      >
        {new Date(item.createdAt).toLocaleTimeString()}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  messageRow: {
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  aiRow: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },

  bubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 20,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },

  userMessageText: {
    color: "#000000",
    fontSize: 15,
    lineHeight: 22,
  },

  createdAt: {
    marginTop: 4,
    fontSize: 10,
  },
});
