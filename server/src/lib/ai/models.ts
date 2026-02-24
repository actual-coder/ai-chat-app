const models = {
  "gemini-3-flash": {
    provider: "Google",
    id: "gemini-3-flash-preview",
    webSearchTool: "google_search",
  },
  "gemini-3-pro": {
    provider: "Google",
    id: "gemini-3-pro-preview",
    webSearchTool: "google_search",
  },
  "gpt-5.1": {
    provider: "OpenAI",
    id: "gpt-5.1",
    webSearchTool: "web_search",
  },
  "gpt-5-mini": {
    provider: "OpenAI",
    id: "gpt-5-mini",
    webSearchTool: "web_search",
  },
  "gpt-5-nano": {
    provider: "OpenAI",
    id: "gpt-5-nano",
    webSearchTool: "web_search",
  },
} as const;

enum AIModel {
  "gemini-3-pro" = "gemini-3-pro",
  "gemini-3-flash" = "gemini-3-flash",
  "gpt-5.1" = "gpt-5.1",
  "gpt-5-mini" = "gpt-5-mini",
  "gpt-5-nano" = "gpt-5-nano",
}

export { models, AIModel };
