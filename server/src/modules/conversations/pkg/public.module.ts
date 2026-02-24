import { Elysia, t } from "elysia";
import { prisma } from "../../../lib/db";
import { NotFoundException } from "elysia-http-exception";

export const publicModule = new Elysia({
  name: "public",
  prefix: "/public/:publicId",
}).get(
  "/",
  async ({ query, params }) => {
    const cursor = query.cursor;
    const publicId = params.publicId;
    const limit = 10;

    const conversation = await prisma.conversation.findFirst({
      where: {
        publicId,
        isPublic: true,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
      },
    });

    const conversationId = conversation?.id;

    if (!conversationId) throw new NotFoundException();

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      take: limit,
      orderBy: { id: "asc" },
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    const hasMore = messages.length === limit;
    const nextCursor = hasMore ? messages[messages.length - 1].id : null;

    const response = {
      success: true,
      data: messages,
      meta: {
        title: conversation.title,
        nextCursor,
        hasMore,
      },
    };

    return response;
  },
  {
    params: t.Object({
      publicId: t.String(),
    }),
    query: t.Optional(
      t.Object({
        cursor: t.Optional(t.String()),
      }),
    ),
  },
);
