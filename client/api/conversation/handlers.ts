import { api } from "..";
import { getAxiosErrorMessage } from "../utils";
import { FetchMessages, FetchMyConversations, GetPublicUrl } from "./types";

const fetchMyConversations = async ({
  keyword,
  cursor,
  token,
}: {
  keyword?: string;
  cursor?: string;
  token?: string;
}) => {
  try {
    const { data } = await api.get<FetchMyConversations>("/conversations", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        cursor,
        keyword,
      },
    });

    return data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
};

const fetchMessages = async ({
  conversationId,
  cursor,
  token,
}: {
  conversationId?: string;
  cursor?: string;
  token?: string;
}) => {
  try {
    const { data } = await api.get<FetchMessages>(
      `/conversations/${conversationId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          cursor,
        },
      },
    );

    return data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
};

const getPubicUrl = async ({
  conversationId,
  token,
}: {
  conversationId: string;
  token?: string;
}) => {
  try {
    const { data } = await api.post<GetPublicUrl>(
      `/conversations/${conversationId}/public`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
};

export { fetchMyConversations, fetchMessages, getPubicUrl };
