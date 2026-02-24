import { openai, OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { models } from "./models";
import { ChatArgs, ModelRegistry, ModelType } from "./types";
import { google, GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { stepCountIs, streamText, tool } from "ai";
import { getModel } from "./utils";
import z from "zod";
import { vector } from "../vector";

export class AIService {
  private modelRegistry: Partial<ModelRegistry> = {};

  constructor() {
    (Object.keys(models) as ModelType[]).forEach((modelKey) => {
      const config = models[modelKey];

      if (
        config.provider === "Google" &&
        process.env.GOOGLE_GENERATIVE_AI_API_KEY
      ) {
        this.modelRegistry[modelKey] = google(config.id);
      }

      if (config.provider === "OpenAI" && process.env.OPENAI_API_KEY) {
        this.modelRegistry[modelKey] = openai(config.id);
      }
    });
  }

  private buildProviderOptions = (isThink?: boolean) => {
    const providerOptions = {
      openai: isThink
        ? ({
            reasoningEffort: "high",
            reasoningSummary: "detailed",
            textVerbosity: "high",
          } satisfies OpenAIResponsesProviderOptions)
        : ({
            reasoningEffort: "low",
            textVerbosity: "low",
          } satisfies OpenAIResponsesProviderOptions),
      google: {
        thinkingConfig: isThink
          ? { thinkingLevel: "high", includeThoughts: true }
          : {
              thinkingLevel: "low",
              includeThoughts: false,
            },
      } satisfies GoogleGenerativeAIProviderOptions,
    };

    return providerOptions;
  };

  streamChat = ({
    request,
    model,
    messages,
    system,
    options,
    userId,
  }: ChatArgs) => {
    const modelInstance = this.modelRegistry[model];
    if (!modelInstance) throw new Error("Model not found");

    const result = streamText({
      model: modelInstance,
      messages,
      system,
      abortSignal: request?.signal,
      maxOutputTokens: options?.maxOutputTokens,
      tools: {
        web_search: openai.tools.webSearch(),
        google_search: google.tools.googleSearch({}),
        saveInformation: tool({
          description: "Save information to vector DB",
          inputSchema: z.object({
            content: z.string(),
            category: z.enum(["fact", "preference"]),
          }),
          execute: async ({ category, content }) =>
            await vector.saveToUpstash({ category, content, userId }),
        }),
      },
      providerOptions: this.buildProviderOptions(options?.isThink),
      toolChoice: options?.isSearch
        ? {
            type: "tool",
            toolName: getModel(model).webSearchTool,
          }
        : "auto",
      stopWhen: stepCountIs(3),
    });

    return result;
  };
}
