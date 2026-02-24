import type { LanguageModel, ModelMessage } from "ai";
import { models } from "./models";

type ModelType = keyof typeof models;
type ModelCompanyType = (typeof models)[ModelType]["provider"];

type ModelRegistry = Record<ModelType, LanguageModel>;

type AIOptions = {
  isSearch?: boolean;
  isThink?: boolean;
  maxOutputTokens?: number;
};

type BaseArgs = {
  request?: Request;
  model: ModelType;
  options?: AIOptions;
  system?: string;
};

type ChatArgs = BaseArgs & {
  messages: ModelMessage[];
  userId: string;
};

export type { ModelType, ModelCompanyType, ModelRegistry, ChatArgs };
