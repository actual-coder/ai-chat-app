import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers/theme-provider";
import { Skeleton } from "../ui/skeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchMyConversations } from "@/api/conversation";
import type { Session, User } from "better-auth";
import { useConversationStore } from "@/store";
import { useRouter } from "expo-router";
import { bucketUrl } from "@/constants/server";

type Props = { session?: Session; user?: User; closeDrawer: () => void };

export const ConversationList = ({ session, user, closeDrawer }: Props) => {
  const conversationId = useConversationStore((s) => s.conversationId);
  const setConversation = useConversationStore((s) => s.setConversation);

  const { colors } = useTheme();
  const router = useRouter();

  const [keyword, setKeyword] = useState("");

  const {
    isPending,
    data,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["conversations", keyword],
    queryFn: ({ pageParam }) =>
      fetchMyConversations({
        token: session?.token,
        keyword,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastRes) => {
      if (lastRes.meta.hasMore && lastRes.meta.nextCursor)
        return lastRes.meta.nextCursor;
      return undefined;
    },
    enabled: Boolean(session?.token),
  });

  const conversations = data?.pages.flatMap((page) => page.data) || [];

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleNewChat = () => {
    closeDrawer();
    setConversation("new", "New Chat");
    router.setParams({ id: "new" });
  };

  const handleSelectChat = (id: string) => {
    closeDrawer();

    const title = conversations.find((i) => i.id === id)?.title || "New Chat";
    setConversation(id, title);
    router.setParams({ id });
  };
  const handleLongPress = (item: unknown) => {};

  const Header = (
    <View style={styles.header}>
      <TextInput
        value={keyword}
        onChangeText={setKeyword}
        placeholder="Search Conversations..."
        placeholderTextColor={colors.text}
        style={[
          styles.searchInput,
          {
            color: colors.text,
            backgroundColor: colors.aiBubble,
          },
        ]}
      />

      <TouchableOpacity
        style={[
          styles.newChatButton,
          {
            backgroundColor: colors.bg,
          },
        ]}
        activeOpacity={0.8}
        onPress={handleNewChat}
      >
        <Text
          style={[
            styles.newChatIcon,
            {
              color: colors.text,
            },
          ]}
        >
          +
        </Text>
        <Text
          style={[
            styles.newChatText,
            {
              color: colors.text,
            },
          ]}
        >
          New Chat
        </Text>
      </TouchableOpacity>
    </View>
  );

  const Body = (
    <>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.textDim,
          },
        ]}
      >
        Recent
      </Text>

      {isPending ? (
        <View style={{ gap: 7, padding: 16, flex: 1 }}>
          {Array.from({ length: 10 }, (_, idx) => (
            <Skeleton key={idx} style={{ height: 40, borderRadius: 12 }} />
          ))}
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
          style={{ flex: 1 }}
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          renderItem={({ item }) => {
            const isSelected = item.id === conversationId;

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.chatItem,
                  isSelected && { backgroundColor: colors.primary },
                ]}
                onPress={() => handleSelectChat(item.id)}
                onLongPress={() => handleLongPress(item)}
              >
                <Text
                  style={[
                    styles.chatTitle,
                    {
                      color: colors.text,
                    },
                    isSelected && styles.chatTitleSelected,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </>
  );

  const Footer = (
    <TouchableOpacity
      style={[
        styles.footer,
        {
          borderTopColor: colors.border,
        },
      ]}
      activeOpacity={0.7}
      onPress={() => router.push("/profile")}
    >
      <Image
        style={styles.avatar}
        source={{
          uri: bucketUrl.public(user?.image),
        }}
      />

      <Text
        style={[
          styles.footerText,
          {
            color: colors.text,
          },
        ]}
      >
        {user?.name || "Your Profile"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      {Header}

      {Body}

      {Footer}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    paddingTop: Platform.OS === "android" ? 24 : 16,
    gap: 10,
  },
  searchInput: {
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
  },

  newChatIcon: {
    fontSize: 20,
    marginRight: 10,
    fontWeight: "300",
  },
  newChatText: {
    fontSize: 16,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    position: "relative",
    overflow: "hidden",
  },

  chatTitle: {
    fontSize: 15,
    paddingLeft: 4,
  },
  chatTitleSelected: {
    color: "black",
    fontWeight: "500",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 40,
  },
  footerText: {
    fontSize: 14,
    marginLeft: 12,
    marginTop: 4,
  },
});
