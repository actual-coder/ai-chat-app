import { Elysia } from "elysia";
import { auth } from "./lib/auth";
import { cors } from "@elysiajs/cors";
import { httpExceptionPlugin } from "elysia-http-exception";
import { serverTiming } from "@elysiajs/server-timing";
import { ip } from "elysia-ip";
import { openapi } from "@elysiajs/openapi";
import { conversationsModule } from "./modules/conversations";
import { usersModule } from "./modules/users";

export const envMode = Bun.env.NODE_ENV?.trim() || "development";
export const isDevelopment = envMode === "development";

const domains = isDevelopment
  ? ["http://localhost:5173"]
  : [Bun.env.FRONTEND_URL!];

const app = new Elysia({ name: "AI-Chat" })
  .use(serverTiming())
  .use(httpExceptionPlugin())
  .use(
    cors({
      origin: domains,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    }),
  )
  .use(ip())
  .mount(auth.handler)
  .get("/", () => "Hello Elysia")
  .use(conversationsModule)
  .use(usersModule);

if (isDevelopment) {
  app.use(openapi()).listen(3000);
}

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export default app;
