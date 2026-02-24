import { Elysia } from "elysia";
import { authPlugin } from "../../../lib/auth/plugin";
import { auth } from "../../../lib/auth";
import { prisma } from "../../../lib/db";
import { cacheKeys } from "../../../constants/cache-keys";
import { redis } from "../../../lib/redis";

export const analyticsModule = new Elysia({
  name: "analytics",
  prefix: "/analytics",
})
  .use(authPlugin(auth))
  .get(
    "/",
    async ({ user }) => {
      const userId = user.id;

      const cacheKey = cacheKeys.analytics(userId);

      const cacheData = await redis.get(cacheKey);

      if (cacheData) return JSON.parse(cacheData);

      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const where = {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      };

      const [
        usageAnalytis,
        conversationsCount,
        modelsGroupStats,
        rawDailyUsage,
      ] = await Promise.all([
        prisma.usage.aggregate({
          _sum: {
            totalTokens: true,
            cost: true,
          },
          _avg: {
            latencyMs: true,
          },
          where,
        }),

        prisma.conversation.count({
          where,
        }),

        prisma.usage.groupBy({
          where,
          by: ["model", "provider"],
          _sum: {
            totalTokens: true,
            cost: true,
          },
          _count: {
            id: true,
          },
        }),

        prisma.usage.findMany({
          where,
          select: {
            createdAt: true,
            totalTokens: true,
            cost: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        }),
      ]);

      const chartData = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateString = d.toISOString().split("T")[0];
        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

        const dailyRecords = rawDailyUsage.filter(
          (record) =>
            record.createdAt.toISOString().split("T")[0] === dateString,
        );

        const dailyTokens = dailyRecords.reduce(
          (acc, curr) => acc + curr.totalTokens,
          0,
        );

        const dailyCost = dailyRecords.reduce(
          (acc, curr) => acc + Number(curr.cost || 0),
          0,
        );

        chartData.push({
          date: dateString,
          dayName,
          tokens: dailyTokens,
          cost: dailyCost,
        });
      }

      const usageByModels = modelsGroupStats.map((stats) => ({
        model: stats.model,
        provider: stats.provider,
        totalTokens: stats._sum.totalTokens || 0,
        totalCost: stats._sum.cost || 0,
        usageCount: stats._count.id || 0,
      }));

      const response = {
        success: true,
        data: {
          period: "7d",
          summary: {
            totalTokens: usageAnalytis._sum.totalTokens || 0,
            totalCost: usageAnalytis._sum.cost || 0,
            avgLatencyMs: Math.round(usageAnalytis._avg.latencyMs || 0),
            totalConversations: conversationsCount,
          },
          chartData,
          usageByModels,
        },
      };

      await redis.setex(cacheKey, 300, JSON.stringify(response));

      return response;
    },
    { auth: true },
  );
