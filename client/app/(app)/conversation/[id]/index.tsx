import { fetchMessages } from "@/api/conversation";
import { ConversationInput } from "@/components/conversations/conversation-input";
import { ConversationList } from "@/components/conversations/conversation-list";
import { Header } from "@/components/conversations/header";
import { MessageItem } from "@/components/conversations/message";
import { Skeleton } from "@/components/ui/skeleton";
import { server } from "@/constants/server";
import { useConversationStream } from "@/hooks/useConversationStream";
import type { Session, User } from "@/lib/auth";
import { useSession } from "@/lib/auth";
import { useTheme } from "@/providers/theme-provider";
import { useConversationStore } from "@/store";
import { Message } from "@/types/conversation";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FlatList, Keyboard, StyleSheet, Text, View } from "react-native";
import ReanimatedDrawerLayout, {
  DrawerLayoutMethods,
  DrawerPosition,
  DrawerType,
} from "react-native-gesture-handler/ReanimatedDrawerLayout";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Conversaton() {
  const { data: sessionData } = useSession();

  const user = sessionData?.user;
  const session = sessionData?.session;

  const drawerRef = useRef<DrawerLayoutMethods>(null);

  const openDrawer = useCallback(() => {
    Keyboard.dismiss();
    drawerRef.current?.openDrawer();
  }, []);

  const closeDrawer = useCallback(() => {
    Keyboard.dismiss();
    drawerRef.current?.closeDrawer();
  }, []);

  if (!user || !session) return null;

  return (
    <ReanimatedDrawerLayout
      ref={drawerRef}
      renderNavigationView={() => (
        <ConversationList
          closeDrawer={closeDrawer}
          session={session}
          user={user}
        />
      )}
      drawerPosition={DrawerPosition.LEFT}
      drawerType={DrawerType.SLIDE}
      edgeWidth={100}
      drawerWidth={320}
    >
      <ChatScreen openDrawer={openDrawer} user={user} session={session} />
    </ReanimatedDrawerLayout>
  );
}

const ChatScreen = ({
  openDrawer,
  user,
  session,
}: {
  openDrawer: () => void;
  user: User;
  session: Session;
}) => {
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const model = useConversationStore((s) => s.model);
  const setConversation = useConversationStore((s) => s.setConversation);
  const isSearch = useConversationStore((s) => s.isSearch);
  const isThink = useConversationStore((s) => s.isThink);

  const router = useRouter();
  const queryClient = useQueryClient();

  const conversationId = params.id as string;

  const currentStreamIdRef = useRef<string | null>(null);
  const prevIdRef = useRef<string>(conversationId);

  const newChatActive = conversationId === "new";

  const [messages, setMessages] = useState<Message[]>([]);

  const {
    isPending: messagesLoading,
    data,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam }) =>
      fetchMessages({
        token: session?.token,
        conversationId,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastRes) => {
      if (lastRes.meta.hasMore && lastRes.meta.nextCursor)
        return lastRes.meta.nextCursor;
      return undefined;
    },
    enabled: Boolean(session?.token) && conversationId !== "new",
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const fetchedMessages = useMemo(
    () => data?.pages.flatMap((page) => page.data) || [],
    [data],
  );

  useEffect(() => {
    const prevId = prevIdRef.current;
    if (prevId === conversationId) return;

    prevIdRef.current = conversationId;

    const isSilentSwap = prevId === "new" && conversationId !== "new";
    if (isSilentSwap) return;

    setMessages([]);
    currentStreamIdRef.current = null;
  }, [conversationId]);

  useEffect(() => {
    if (fetchedMessages.length > 0 || (conversationId !== "new" && data)) {
      setMessages((currMessages) => {
        const localPending = currMessages.filter((m) => {
          return (
            m.id.toString().startsWith("ai_") ||
            m.id.toString().startsWith("user_")
          );
        });

        localPending.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        return [...localPending, ...fetchedMessages];
      });
    }
  }, [fetchedMessages]);

  const { isStreaming, stopStream, sendMessage } = useConversationStream({
    onChunk: (chunk) => {
      setMessages((prevMessages) => {
        // Strategy A: Explicit ID
        const streamId = currentStreamIdRef.current;

        const targetIndex = streamId
          ? prevMessages.findIndex((m) => m.id === streamId)
          : -1;

        if (targetIndex !== -1) {
          const targetMsg = prevMessages[targetIndex];
          const updatedMsg = {
            ...targetMsg,
            content: targetMsg.content + chunk,
          };
          const newArr = [...prevMessages];
          newArr[targetIndex] = updatedMsg;
          return newArr;
        }

        // Strategy B: The Safety Net
        const latestMsg = prevMessages[0];
        const isRecentAi =
          latestMsg &&
          latestMsg.role === "ASSISTANT" &&
          Date.now() - new Date(latestMsg.createdAt).getTime() < 5000;

        if (isRecentAi) {
          currentStreamIdRef.current = latestMsg.id;
          const updatedMsg = {
            ...latestMsg,
            content: latestMsg.content + chunk,
          };
          const newArr = [...prevMessages];
          newArr[0] = updatedMsg;
          return newArr;
        }

        // Strategy C: Create New Bubble
        const newId = "ai_" + Date.now() + Math.random().toString(36).slice(2);
        currentStreamIdRef.current = newId;

        const newMsg: Message = {
          id: newId,
          content: chunk,
          role: "ASSISTANT",
          createdAt: new Date().toISOString(),
          tokenCount: Math.ceil(chunk.length / 4),
          conversationId,
        };

        return [newMsg, ...prevMessages];
      });
    },
    onError: () => {},
    onStreamEnd: () => {},
    onStreamStart: () => {},
    onConversationIdReceived: ({ id, title }) => {
      router.setParams({ id });
      setConversation(id, title);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleSend = async (text: string) => {
    const token = session.token;
    if (!token) throw new Error("Not Logged in");

    currentStreamIdRef.current = null;

    const newMsg: Message = {
      id: "user_" + Date.now() + Math.random().toString(36).slice(2),
      content: text,
      role: "USER",
      createdAt: new Date().toISOString(),
      tokenCount: Math.ceil(text.length / 4),
      conversationId,
    };

    setMessages((prevMessages) => [newMsg, ...prevMessages]);

    sendMessage({
      payload: {
        input: newMsg.content,
        model,
        options: { isThink, isSearch },
      },
      options: {
        url: `${server}/api/conversations/${conversationId}/messages`,
        method: "POST",
      },
      token,
    });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.bg,
      }}
    >
      <Header openDrawer={openDrawer} conversationId={conversationId} />

      {newChatActive ? (
        <View style={styles.newChatContainer}>
          <Text style={[styles.newChatTitle, { color: colors.text }]}>
            Hello! {user.name || "User"}
          </Text>
          <Text style={{ color: colors.text }}>Start a new conversation</Text>
        </View>
      ) : messagesLoading ? (
        <View style={{ padding: 24, flex: 1, gap: 20 }}>
          <Skeleton
            style={{
              borderRadius: 20,
              width: "100%",
              height: 300,
            }}
          />
          <Skeleton
            style={{
              borderRadius: 20,
              width: "100%",
              height: 200,
            }}
          />
          <Skeleton
            style={{
              borderRadius: 20,
              width: "100%",
              height: 100,
            }}
          />
        </View>
      ) : isError ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: colors.text }}>
            {error.message || "Something went wrong"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          inverted
          renderItem={({ item }) => <MessageItem item={item} />}
        />
      )}

      <ConversationInput
        onSend={handleSend}
        isStreaming={isStreaming}
        onStopStream={stopStream}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  newChatContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  newChatTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  list: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 20,
  },
});
