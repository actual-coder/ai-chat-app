import { Elysia } from "elysia";
import { myConversation } from "./pkg/my-conversation.module";
import { messagesModule } from "./pkg/message.module";
import { publicModule } from "./pkg/public.module";

export const conversationsModule = new Elysia({
  name: "conversations",
  prefix: "/api/conversations",
})
  .use(myConversation)
  .use(messagesModule)
  .use(publicModule);
