/**
 * MESSAGE TYPES - Fonte Única da Verdade
 * 
 * Centraliza TODOS os tipos de mensagens postMessage entre:
 * - Parent (window.top / smartico-games-v2.js)
 * - Iframe (Next.js games)
 * 
 * IMPORTANTE: Sempre importar daqui para evitar typos e manter consistência!
 * 
 * @module messageTypes
 */

// ============================================
// MESSAGE TYPE CONSTANTS
// ============================================

export const MESSAGE_TYPES = {
  // Host navigation
  REDIRECT: "SG:REDIRECT",
  HIDE_OVERLAY: "SG:HIDE_OVERLAY",
  
  // Prize management
  PRIZE_CONSUMED: "SG:PRIZE_CONSUMED",
  
  // Future messages (uncomment when needed):
  // PRIZE_CLAIMED: "SG:PRIZE_CLAIMED",
  // GAME_STARTED: "SG:GAME_STARTED",
  // GAME_COMPLETED: "SG:GAME_COMPLETED",
  // ERROR_REPORT: "SG:ERROR_REPORT",
} as const;

// ============================================
// TYPESCRIPT TYPES
// ============================================

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

export type RedirectMode = "assign" | "replace";

// Individual payload types
export type RedirectPayload = {
  url: string;
  mode: RedirectMode;
};

export type PrizeConsumedPayload = {
  itemId: number;
  purchaseTs: number;
};

// Payload map (type-safe)
export type MessagePayload = {
  [MESSAGE_TYPES.REDIRECT]: RedirectPayload;
  [MESSAGE_TYPES.HIDE_OVERLAY]: undefined;
  [MESSAGE_TYPES.PRIZE_CONSUMED]: PrizeConsumedPayload;
};

// Generic message structure
export type Message<T extends MessageType = MessageType> = {
  t: T;
  p?: MessagePayload[T];
};

// ============================================
// TYPE GUARDS
// ============================================

export function isValidMessageType(type: string): type is MessageType {
  return Object.values(MESSAGE_TYPES).includes(type as MessageType);
}

export function isMessage(data: any): data is Message {
  return (
    data &&
    typeof data === "object" &&
    typeof data.t === "string" &&
    data.t.startsWith("SG:")
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Cria mensagem type-safe
 * 
 * @example
 * const msg = createMessage(MESSAGE_TYPES.PRIZE_CONSUMED, {
 *   itemId: 6136,
 *   purchaseTs: 1735567890123
 * });
 */
export function createMessage<T extends MessageType>(
  type: T,
  payload: MessagePayload[T]
): Message<T> {
  return payload !== undefined 
    ? { t: type, p: payload } 
    : { t: type } as Message<T>;
}