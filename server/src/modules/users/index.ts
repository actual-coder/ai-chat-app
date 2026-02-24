import { Elysia } from "elysia";
import { profileModule } from "./pkg/profile.module";
import { analyticsModule } from "./pkg/analytics.module";

export const usersModule = new Elysia({
  name: "users",
  prefix: "/api/users",
})
  .use(profileModule)
  .use(analyticsModule);
