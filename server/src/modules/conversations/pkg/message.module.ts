import { Elysia, t } from "elysia";
import { authPlugin } from "../../../lib/auth/plugin";
import { auth } from "../../../lib/auth";
import { prisma } from "../../../lib/db";
import { AIModel } from "../../../lib/ai/models";
import { Conversation } from "../../../lib/db/prisma/client";
import {
  NotFoundException,
  NotImplementedException,
} from "elysia-http-exception";
import { vector } from "../../../lib/vector";
import { getSystemPrompt } from "../../../constants/prompts";
import { ModelMessage } from "ai";
import { ai } from "../../../lib/ai";
import { getModelProvider } from "../../../lib/ai/utils";
import { buildMarkdown } from "../../../utils/build-markdown";

enum exportFormat {
  pdf = "pdf",
  markdown = "markdown",
}

export const messagesModule = new Elysia({
  name: "messages",
  prefix: "/:conversationId",
})
  .use(authPlugin(auth))
  .get(
    "/messages",
    async ({ query, params, user }) => {
      const cursor = query.cursor;
      const conversationId = params.conversationId;
      const limit = 10;

      const messages = await prisma.message.findMany({
        where: {
          conversationId,
          conversation: {
            isActive: true,
            userId: user.id,
          },
        },
        take: limit,
        orderBy: { id: "desc" },
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
          nextCursor,
          hasMore,
        },
      };

      return response;
    },
    {
      query: t.Optional(
        t.Object({
          cursor: t.Optional(t.String()),
        }),
      ),
      params: t.Object({
        conversationId: t.String(),
      }),
      auth: true,
    },
  )
  /**
   *
   *  Prereq - ai streamText, which takes messages, has saveToUpstash Tool,
   * 2- read last 3 messages from db to pass for context
   * 3- read from vectorDB memory
   * 4- pass 3 message context, memory contxt, and user input,
   * 5- stream user response
   * 6- after complete stream now create db record -save user message, new message, usuage in parallel,
   * 7- End Stream
   */
  .post(
    "/messages",
    async function* ({ body, params, user, request, set }) {
      let conversationId = params.conversationId;
      const isNew = conversationId === "new";
      const { input, model, options } = body;

      let conversation: Conversation | null = null;

      if (isNew) {
        conversation = await prisma.conversation.create({
          data: {
            title: input.slice(0, 60),
            userId: user.id,
          },
        });

        conversationId = conversation.id;
      } else {
        conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            userId: user.id,
            isActive: true,
          },
        });
      }

      if (!conversation) throw new NotFoundException("Conversation not found");

      if (isNew) {
        set.headers["x-conversation-id"] = conversation.id;
        set.headers["x-conversation-title"] = conversation.title;
      }

      const [recentMessages, memoryContext] = await Promise.all([
        prisma.message.findMany({
          where: { conversationId },
          take: 3,
          orderBy: { id: "desc" },
        }),
        vector.getContextForChat(input, user.id),
      ]);

      const systemPrompt = getSystemPrompt(memoryContext);

      const formattedHistory: ModelMessage[] = recentMessages
        .reverse()
        .map((m) => ({
          role: m.role.toLowerCase() as "user" | "assistant",
          content: m.content,
        }));

      const messages: ModelMessage[] = [
        ...formattedHistory,
        { role: "user", content: input },
      ];

      const inputToken = Math.ceil(input.length / 4);

      try {
        const startPerf = performance.now();

        const aiResponse = ai.streamChat({
          request,
          model,
          messages,
          options,
          system: systemPrompt,
          userId: user.id,
        });

        for await (const data of aiResponse.textStream) {
          yield data;
        }

        const endPerf = performance.now();

        const [text, toolCalls, totalUsage, sources, toolResults] =
          await Promise.all([
            aiResponse.text,
            aiResponse.toolCalls,
            aiResponse.totalUsage,
            aiResponse.sources,
            aiResponse.toolResults,
          ]);

        await prisma.message.create({
          data: {
            conversationId,
            role: "USER",
            content: input,
            tokenCount: inputToken,
          },
        });

        await Promise.all([
          prisma.message.create({
            data: {
              content: text,
              role: "ASSISTANT",
              conversationId,
              tokenCount: totalUsage.outputTokens || 0,
              createdAt: new Date(),
              metadata: {
                toolCalls: toolCalls.map((t) => t.toolName),
                toolResults: toolResults.map((t) => ({
                  output: String(t.output).slice(0, 5000),
                  input: String(t.input),
                })),
                sources: sources.map((s) => ({
                  title: s.title,
                  id: s.id,
                  sourceType: s.sourceType,
                  type: s.type,
                })),
              },
            },
          }),
          prisma.usage.create({
            data: {
              conversationId,
              userId: user.id,
              model,
              provider: getModelProvider(model),
              promptTokens: totalUsage.inputTokens || inputToken,
              completionTokens: totalUsage.outputTokens || 0,
              totalTokens: totalUsage.totalTokens || 0,
              latencyMs: endPerf - startPerf,
            },
          }),
        ]);
      } catch (error) {
        await prisma.message.create({
          data: {
            conversationId,
            role: "USER",
            content: input,
            tokenCount: inputToken,
          },
        });

        if (!(error instanceof Error)) {
          throw error;
        }

        const isAbortError =
          error?.name === "AbortError" ||
          (error?.message &&
            error.message.toLowerCase().includes("connection was closed"));

        if (isAbortError) {
          console.log(
            "Client intentionally aborted the stream. Exiting cleanly.",
          );
          return;
        }
        console.error("Real backend error during stream:", error);
        throw error;
      }
    },
    {
      body: t.Object({
        input: t.String(),
        model: t.Enum(AIModel),
        options: t.Optional(
          t.Object({
            isThink: t.Optional(t.Boolean()),
            isSearch: t.Optional(t.Boolean()),
          }),
        ),
      }),
      params: t.Object({
        conversationId: t.String(),
      }),
      auth: true,
    },
  )
  .post(
    "/public",
    async ({ params, user, request }) => {
      const conversationId = params.conversationId;

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          isActive: true,
          userId: user.id,
        },
        select: {
          isPublic: true,
          publicId: true,
        },
      });

      if (!conversation) throw new NotFoundException("Conversation not found");

      const baseUrl = Bun.env.FRONTEND_URL;

      if (conversation.isPublic && conversation.publicId)
        return {
          success: true,
          url: `${baseUrl}/share/${conversation.publicId}`,
        };

      const newPublicId = Bun.randomUUIDv7().replace(/-/g, "").slice(0, 12);

      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          isPublic: true,
          publicId: newPublicId,
        },
      });

      return {
        success: true,
        url: `${baseUrl}/share/${newPublicId}`,
      };
    },
    {
      auth: true,
      params: t.Object({
        conversationId: t.String(),
      }),
    },
  )
  .get(
    "/export",
    async ({ params, query, user }) => {
      const conversationId = params.conversationId;

      const format = query.format ?? "markdown";

      if (format !== "markdown") throw new NotImplementedException();

      const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId: user.id, isActive: true },
        select: {
          title: true,
          messages: {
            select: {
              role: true,
              content: true,
              createdAt: true,
            },
            orderBy: { id: "asc" },
          },
        },
      });

      if (!conversation) throw new NotFoundException("Conversation not found");

      const markdown = buildMarkdown(conversation);

      const fileName =
        conversation.title
          .replace(/[^a-z0-9]/gi, "-")
          .replace(/-+/g, "-")
          .toLowerCase()
          .slice(0, 60) + ".md";

      return new Response(markdown, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    },
    {
      params: t.Object({
        conversationId: t.String(),
      }),
      query: t.Optional(
        t.Object({
          format: t.Optional(t.Enum(exportFormat)),
        }),
      ),
      auth: true,
    },
  );
