import { Index } from "@upstash/vector";

export class VectorDB {
  private index: Index;
  constructor() {
    this.index = Index.fromEnv();
  }

  getContextForChat = async (userMessage: string, userId: string) => {
    const results = await this.index.query({
      data: userMessage,
      topK: 3,
      filter: `userId = '${userId}'`,
      includeMetadata: true,
    });

    const contextString = results
      .map((match) => match.metadata?.content)
      .filter(Boolean)
      .join("\n");

    return contextString;
  };

  saveToUpstash = async ({
    category,
    content,
    userId,
  }: {
    content: string;
    category: string;
    userId: string;
  }) => {
    await this.index.upsert({
      id: Bun.randomUUIDv7(),
      data: content,
      metadata: {
        category,
        userId,
        content,
      },
    });

    return "Memory saved";
  };
}
