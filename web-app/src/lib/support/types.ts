export const MAX_CHAT_MESSAGES = 12;
export const MAX_CHAT_MESSAGE_LENGTH = 2000;

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatLink {
  label: string;
  href: string;
}

export interface SupportReply {
  reply: string;
  quickReplies: string[];
  links: ChatLink[];
  brief?: string;
  mode: "llm" | "guided";
}
