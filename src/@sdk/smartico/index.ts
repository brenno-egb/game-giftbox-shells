// Types
export * from "./types";

// Logger
export { createLogger } from "./logger";

// Context
export { SmarticoProvider, useSmartico } from "./context/SmarticoProvider";

// Hooks
export { useSmarticoEvent, usePropsChange } from "./hooks/useSmarticoEvent";
export type { SmarticoEventType } from "./hooks/useSmarticoEvent";
export { useStorePurchase } from "./hooks/useStorePurchase";

// Infra
export { bootSmartico } from "./infra/boot";
export type { BootOptions } from "./infra/boot";
export type { Transport } from "./infra/transport/transport.type";
export {
  SmarticoTransport,
  createSmarticoTransport,
} from "./infra/transport/transport.smartico";

// Services
export {
  MiniGamesStore,
  createMiniGamesStore,
} from "./services/miniGamesStore";
export {
  StoreItemsStore,
  createStoreItemsStore,
} from "./services/storeItemsStore";
export { PlayerStore, createPlayerStore } from "./services/playerStore";
export {
  UserProfileStore,
  createUserProfileStore,
} from "./services/userProfileStore";
export {
  UserLevelStore,
  createUserLevelStore,
} from "./services/userLevelStore";

// Domain
export {
  safeNumber,
  computeNextAvailableTs,
  computeCanPlay,
  computeStatus,
} from "./domain/gameRules";

export { formatCountdown, getAttemptsDisplay } from "./domain/formatting";
export type { AttemptsDisplay } from "./domain/formatting";

export {
  resolvePrizeAcknowledge,
  runPrizeAcknowledge,
} from "./domain/acknowledge";
export type { AckIntent, AckDeps } from "./domain/acknowledge";

export {
  handlePurchaseError,
  logPurchaseError,
} from "./domain/errors/errorHandler";
export type { PurchaseError } from "./domain/errors/errorHandler";

// Messaging
export { HostBridge, MESSAGE_TYPES } from "./messaging/hostBridge";
export type {
  RedirectMode,
  MessageType,
  RedirectPayload,
  MessagePayload,
} from "./messaging/hostBridge";
