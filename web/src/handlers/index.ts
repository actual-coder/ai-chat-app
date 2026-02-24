import { server } from "@/constants/server";
import type { FetchMessages } from "./types";

export const fetchMessages = async ({
  publicId,
  cursor,
}: {
  publicId: string;
  cursor?: string;
}) => {
  const url = new URL(`${server}/api/conversations/public/${publicId}`);

  if (cursor) url.searchParams.append("cursor", cursor);

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<FetchMessages>;
};
