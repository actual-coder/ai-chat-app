export enum AIModel {
  "gpt-5-nano" = "gpt-5-nano",
  "gpt-5-mini" = "gpt-5-mini",
  "gpt-5.1" = "gpt-5.1",
  "gemini-3-flash" = "gemini-3-flash",
  "gemini-3-pro" = "gemini-3-pro",
}

export type Model = keyof typeof AIModel;
