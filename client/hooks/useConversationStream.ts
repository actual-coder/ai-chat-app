import { useCallback, useRef, useState } from "react";
import { fetch } from "expo/fetch";

type StreamOptions = {
  url: string;
  method?: "GET" | "POST";
};

type SendMessagePayload = {
  input: string;
  model: string;
  options?: {
    isThink?: boolean;
    isSearch?: boolean;
  };
};

type Props = {
  onChunk: (chunk: string) => void;
  onStreamStart?: () => void;
  onStreamEnd?: () => void;
  onConversationIdReceived?: (options: { id: string; title: string }) => void;
  onError?: (error: Error) => void;
};

export const useConversationStream = ({
  onChunk,
  onStreamEnd,
  onStreamStart,
  onConversationIdReceived,
  onError,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isManaullyAbortedRef = useRef(false);

  const stopStream = useCallback(() => {
    if (!abortControllerRef.current) return;

    isManaullyAbortedRef.current = true;
    abortControllerRef.current.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async ({
      payload,
      options,
      token,
    }: {
      payload: SendMessagePayload;
      options: StreamOptions;
      token: string;
    }) => {
      isManaullyAbortedRef.current = false;

      try {
        setIsLoading(true);
        onStreamStart?.();

        abortControllerRef.current = new AbortController();

        const response = await fetch(options.url, {
          method: options.method || "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "Stream failed with status: ",
            response.status,
            " and message: ",
            errorText,
          );
          throw new Error(`Stream failed: ${response.statusText}`);
        }

        const newConversationId = response.headers.get("x-conversation-id");
        const newConversationTitle = response.headers.get(
          "x-conversation-title",
        );
        console.log(
          "Received new conversation ID from header:",
          newConversationId,
        );

        if (
          newConversationId &&
          newConversationTitle &&
          onConversationIdReceived
        ) {
          onConversationIdReceived({
            id: newConversationId,
            title: newConversationTitle,
          });
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");

        if (!reader) throw new Error("No reader available");

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          onChunk(chunk);
        }
      } catch (error) {
        if (isManaullyAbortedRef.current) {
          console.log(
            "Stream was intentionally stopped by the user. Suppressing error.",
          );
          return;
        }

        if (!(error instanceof Error)) {
          console.error("Stream error:", error);
          onError?.(new Error("Something went wrong"));
          return;
        }

        onError?.(error);
      } finally {
        setIsLoading(false);
        onStreamEnd?.();
        abortControllerRef.current = null;
      }
    },
    [onChunk, onStreamEnd, onStreamStart, onConversationIdReceived, onError],
  );

  return {
    sendMessage,
    stopStream,
    isStreaming: isLoading,
  };
};
