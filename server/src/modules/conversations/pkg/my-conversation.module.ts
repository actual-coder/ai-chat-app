import { Elysia, t } from "elysia";
import { prisma } from "../../../lib/db";
import { authPlugin } from "../../../lib/auth/plugin";
import { auth } from "../../../lib/auth";

export const myConversation = new Elysia({
  name: "myConversation",
})
  .use(authPlugin(auth))
  .get(
    "/",
    async ({ query, user }) => {
      const keyword = query.keyword;
      const cursor = query.cursor;

      const limit = 10;

      const conversations = await prisma.conversation.findMany({
        where: {
          userId: user.id,
          isActive: true,
          ...(keyword && {
            title: {
              contains: keyword,
              mode: "insensitive",
            },
          }),
        },
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
        take: limit,
        orderBy: {
          id: "desc",
        },
      });

      const hasMore = conversations.length === limit;
      const nextCursor = hasMore
        ? conversations[conversations.length - 1].id
        : null;

      const response = {
        success: true,
        data: conversations,
        meta: {
          nextCursor,
          hasMore,
        },
      };

      return response;
    },
    {
      query: t.Object({
        keyword: t.Optional(t.String()),
        cursor: t.Optional(t.String()),
      }),
      auth: true,
    },
  );
