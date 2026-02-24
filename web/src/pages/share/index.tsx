import { MessageItem } from "@/components/message-item";
import { Skeleton } from "@/components/skeleton";
import { fetchMessages } from "@/handlers";
import { useTheme } from "@/providers/theme-provider";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Moon, Sun } from "lucide-react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";

export default function Share() {
  const { publicId } = useParams();

  const { colors, toggleTheme, theme } = useTheme();

  const {
    isPending,
    data,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["public-messages", publicId],
    queryFn: ({ pageParam }) =>
      fetchMessages({
        publicId: publicId!,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastRes) => {
      if (lastRes.meta.hasMore && lastRes.meta.nextCursor)
        return lastRes.meta.nextCursor;
      return undefined;
    },
    enabled: Boolean(publicId),
  });

  const messages = useMemo(
    () => data?.pages.flatMap((page) => page.data) || [],
    [data],
  );

  const conversationTitle = data?.pages[0]?.meta.title || "Shared Conversation";

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        backgroundColor: colors.bg,
      }}
    >
      <div>
        <header
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: colors.text,
              margin: 0,
            }}
          >
            {conversationTitle}
          </h1>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span
              style={{
                fontSize: "12px",
                color: colors.text,
                backgroundColor: colors.surface,
                padding: "0.5rem 1rem",
                borderRadius: "0.75rem",
                cursor: "not-allowed",
              }}
            >
              Read-only
            </span>
            <button
              style={{
                color: colors.text,
                backgroundColor: colors.surface,
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "0.75rem",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </header>
      </div>

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {isPending ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "800px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <Skeleton
                style={{ borderRadius: 20, width: "100%", height: 300 }}
              />
              <Skeleton
                style={{ borderRadius: 20, width: "100%", height: 200 }}
              />
              <Skeleton
                style={{ borderRadius: 20, width: "100%", height: 200 }}
              />
            </div>
          </div>
        ) : isError ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <h2 style={{ color: colors.text }}>
              {error.message || "Something went wrong"}
            </h2>
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: colors.textDim,
            }}
          >
            No messages in this conversation.
          </div>
        ) : (
          <Virtuoso
            data={messages}
            style={{ height: "100%", width: "100%" }}
            endReached={loadMore}
            itemContent={(_, item) => (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: "800px",
                    padding: "8px 16px",
                  }}
                >
                  <MessageItem item={item} />
                </div>
              </div>
            )}
          />
        )}
      </main>
    </div>
  );
}
