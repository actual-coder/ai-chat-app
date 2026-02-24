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

export type FetchMessages = {
  success: boolean;
  data: Message[];
  meta: {
    title: string;
    nextCursor: string | null;
    hasMore: boolean;
  };
};
