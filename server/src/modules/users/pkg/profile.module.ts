import { Elysia, t } from "elysia";
import { authPlugin } from "../../../lib/auth/plugin";
import { auth } from "../../../lib/auth";
import { prisma } from "../../../lib/db";
import { storage } from "../../../lib/storage";

export const profileModule = new Elysia({
  name: "profile",
  prefix: "/profile",
})
  .use(authPlugin(auth))
  .get(
    "/",
    async ({ user }) =>
      await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      }),
    { auth: true },
  )
  .put(
    "/edit",
    async ({ body, user }) => {
      const { name, bio } = body;

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          bio,
        },
      });

      return {
        success: true,
        user: updatedUser,
      };
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        bio: t.Optional(t.String()),
      }),
      auth: true,
    },
  )
  .put(
    "/photo",
    async ({ body }) => {
      const { ext, type } = body;

      const randomId = Bun.randomUUIDv7();
      const fileName = `/avatars/${randomId}/image${ext}`;

      const url = await storage.presignedPut({
        fileName,
        contentType: type,
      });

      return {
        success: true,
        url,
        key: fileName,
      };
    },

    {
      body: t.Object({
        ext: t.String(),
        type: t.String(),
      }),
      auth: true,
    },
  );
