export type StoredChatMessage = {
  readonly id: string;
  readonly role: 'assistant' | 'user' | 'system';
  readonly stepId?: string;
  readonly text: string;
};

export type ChatSession = {
  readonly id: string;
  readonly articleId: string;
  readonly topic: string;
  readonly messages: readonly StoredChatMessage[];
  readonly createdAt: number;
};

export type NewChatSession = {
  readonly articleId: string;
  readonly topic: string;
  readonly messages: readonly StoredChatMessage[];
};
