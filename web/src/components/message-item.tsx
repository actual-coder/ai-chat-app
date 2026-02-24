import type { Message } from "@/handlers/types";
import { useTheme } from "@/providers/theme-provider";
import { MarkdownComponent } from "@codearcade/markdown";

export const MessageItem = ({ item }: { item: Message }) => {
  const { colors, theme } = useTheme();

  const isUser = item.role === "USER";

  return (
    <div
      style={{ marginBottom: "16px", display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: isUser ? "flex-end" : "flex-start",
          alignItems: "flex-end",
          marginBottom: "4px",
        }}
      >
        {isUser ? (
          <div
            style={{
              maxWidth: "80%",
              padding: "12px 16px",
              borderRadius: "20px",
              borderBottomRightRadius: "4px",
              backgroundColor: colors.userBubble,
              color: "#000000",
              fontSize: "15px",
              lineHeight: "22px",
              whiteSpace: "pre-wrap",
            }}
          >
            {item.content}
          </div>
        ) : (
          <div
            style={{
              maxWidth: "85%",
              padding: "12px 16px",
              borderRadius: "20px",
              borderBottomLeftRadius: "4px",
              color: colors.text,
              fontSize: "15px",
              lineHeight: "22px",
            }}
          >
            <MarkdownComponent
              engine="hljs"
              theme={theme}
              markdownText={item.content}
              defaultMarkdownThemeDark="monokai"
              defaultMarkdownThemeLight="github"
            />
          </div>
        )}
      </div>

      <span
        style={{
          color: colors.textDim,
          fontSize: "10px",
          marginTop: "4px",
          textAlign: isUser ? "right" : "left",
          marginLeft: isUser ? "0" : "52px",
        }}
      >
        {new Date(item.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
};
