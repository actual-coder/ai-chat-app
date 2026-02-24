import { BetterAuthOptions } from "better-auth/types";
import { expo } from "@better-auth/expo";

export const authConfig: BetterAuthOptions = {
  socialProviders: {
    github: {
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    },
    google: {
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    },
  },
  account: {
    modelName: "Account",
  },
  user: {
    modelName: "User",
  },
  verification: {
    modelName: "Verification",
  },
  session: {
    modelName: "Session",
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "jwt",
      version: "1",
    },
  },
  plugins: [expo()],
  trustedOrigins: ["exp://"],
};
