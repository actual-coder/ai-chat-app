import { Session, User } from "better-auth/types";

export type SessionData = {
  user: User;
  session: Session;
};
