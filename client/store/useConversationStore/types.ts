export interface ConversationState {
  conversationId: string;
  conversationTitle: string;
  setConversation: (id: string, title: string) => void;

  isDrawerOpen: boolean;
  setDrawerOpen: (isOpen: boolean) => void;
  toggleDrawer: () => void;

  model: string;
  isThink: boolean;
  isSearch: boolean;

  setModel: (model: string) => void;
  toggleThink: () => void;
  toggleSearch: () => void;
}
