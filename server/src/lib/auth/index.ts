import { betterAuth, SecondaryStorage } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../db";
import { authConfig } from "./config";
import { redis } from "../redis";

const secondaryStorage: SecondaryStorage = {
  get: (key) => redis.get(key),
  set: (key, val, ttl) =>
    ttl ? redis.setex(key, ttl, val) : redis.set(key, val),
  delete: (key) => {
    redis.del(key);
  },
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secondaryStorage,
  ...authConfig,
});
