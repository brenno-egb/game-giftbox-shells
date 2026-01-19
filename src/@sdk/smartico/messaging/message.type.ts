export const MESSAGE_TYPES = {
  REDIRECT: "SG:REDIRECT",
  HIDE_OVERLAY: "SG:HIDE_OVERLAY",
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

export type RedirectMode = "assign" | "replace";

export type RedirectPayload = {
  url: string;
  mode: RedirectMode;
};

export type MessagePayload = {
  [MESSAGE_TYPES.REDIRECT]: RedirectPayload;
  [MESSAGE_TYPES.HIDE_OVERLAY]: undefined;
};