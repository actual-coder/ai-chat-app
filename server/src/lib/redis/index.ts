import { Redis } from "ioredis";

const redisUrl = Bun.env.REDIS_URL;

if (!redisUrl) throw new Error("REDIS_URL not found");
export const redis = new Redis(redisUrl);
