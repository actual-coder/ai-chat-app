import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 character"),
  email: z.email("Invalid Email"),
  bio: z.string().min(4).max(200).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
