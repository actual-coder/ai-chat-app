import { create } from "zustand";
import type { ConversationState } from "./types";

export const useConversationStore = create<ConversationState>((set) => ({
  conversationId: "new",
  conversationTitle: "New Chat",
  setConversation: (id, title) =>
    set({ conversationId: id, conversationTitle: title }),

  isDrawerOpen: false,
  setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  model: "gpt-5-nano",
  isSearch: false,
  isThink: false,

  setModel: (model) => set({ model }),
  toggleThink: () => set((state) => ({ isThink: !state.isThink })),
  toggleSearch: () => set((state) => ({ isSearch: !state.isSearch })),
}));
