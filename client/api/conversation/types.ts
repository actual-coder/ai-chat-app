import { Conversation, Message } from "@/types/conversation";

export type FetchMyConversations = {
  success: boolean;
  data: Conversation[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
  };
};

export type FetchMessages = {
  success: boolean;
  data: Message[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
  };
};

export type GetPublicUrl = {
  success: boolean;
  url: string;
};
