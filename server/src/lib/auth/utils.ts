import type { SessionData } from "../../types/auth";
import { redis } from "../redis";

const verifyToken = async (token?: string): Promise<SessionData | null> => {
  if (!token) return null;

  const sessionId = token.split(".")[0];

  try {
    const sessionRaw = await redis.get(sessionId);
    if (!sessionRaw) return null;
    const sessionData = JSON.parse(sessionRaw) as SessionData;

    if (new Date(sessionData.session.expiresAt) <= new Date()) {
      return null;
    }

    return sessionData;
  } catch (error) {
    return null;
  }
};

export { verifyToken };
