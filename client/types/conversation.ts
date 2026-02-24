export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM";

export type Message = {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  metaData?: Record<string, any>;
  createdAt: string;
  tokenCount?: number;
};

export type Conversation = {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  title: string | null;
  isActive: boolean;
  isPublic: boolean;
  publicId: string | null;
};
