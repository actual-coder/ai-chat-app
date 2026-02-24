// export const server = "http://192.168.56.1:3000";

export const server = "https://ai-chat-app-delta-ashy.vercel.app";

export const bucketUrl = {
  public: (key?: string | null) => {
    if (!key) return "";

    if (key.startsWith("http")) return key;

    return `https://pub-60d1591057d54a61ae787bf0dd267c71.r2.dev/${key}`;
  },
};
