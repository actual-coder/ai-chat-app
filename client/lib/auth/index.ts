import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { server } from "@/constants/server";
import type { Session, User } from "better-auth";

export const authClient = createAuthClient({
  baseURL: server,
  plugins: [
    expoClient({
      scheme: "ai-chat",
      storagePrefix: "ai-chat",
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signOut, useSession, getSession } = authClient;
export type { Session, User };
