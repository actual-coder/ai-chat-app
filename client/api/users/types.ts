export type UpdateProfile = {
  success: boolean;
  user: {
    name: string;
    email: string;
    id: string;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
    emailVerified: boolean;
    role: "ADMIN" | "USER";
    bio: string | null;
  };
};

export type ChangePhoto = {
  success: boolean;
  url: string;
  key: string;
};

export type FetchAnalytis = {
  success: boolean;
  data: {
    period: string;
    summary: {
      totalTokens: number;
      totalCost: number;
      avgLatencyMs: number;
      totalConversations: number;
    };
    chartData: {
      date: string;
      dayName: string;
      tokens: number;
      cost: number;
    }[];
    usageByModels: {
      model: string;
      provider: string;
      totalTokens: number;
      totalCost: number;
      usageCount: number;
    }[];
  };
};
