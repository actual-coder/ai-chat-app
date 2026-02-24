import { MessageRole } from "../lib/db/prisma/enums";

export const buildMarkdown = (conversation: {
  messages: {
    createdAt: Date;
    role: MessageRole;
    content: string;
  }[];
  title: string;
}) => {
  const lines: string[] = [];

  lines.push(`# ${conversation.title ?? "Untitled Conversation"}`);
  lines.push("");
  lines.push(`Exported on: ${new Date().toLocaleString()}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  for (const message of conversation.messages) {
    const role = message.role === "USER" ? "User" : "Assistant";
    lines.push(`## ${role}`);
    lines.push("");
    lines.push(message.content);
    lines.push("");
    lines.push(`_${message.createdAt.toISOString()}_`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
};
