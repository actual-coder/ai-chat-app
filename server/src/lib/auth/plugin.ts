import { Elysia } from "elysia";
import type { Auth } from "better-auth";
import { bearer } from "@elysiajs/bearer";
import { verifyToken } from "./utils";

export const authPlugin = (auth: Auth) =>
  new Elysia({ name: "better-auth" })
    .use(bearer())
    .macro({
      auth: {
        async resolve({ bearer, status, request: { headers } }) {
          const session = await auth.api.getSession({
            headers,
          });

          const sessionByToken = await verifyToken(bearer);

          if (sessionByToken)
            return {
              user: sessionByToken.user,
              session: sessionByToken.session,
            };

          if (session)
            return {
              user: session.user,
              session: session.session,
            };

          return status(401);
        },
      },
    })
    .as("scoped");
