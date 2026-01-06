/**
 * SDK Smartico - Entry point
 * Exporta todos os módulos públicos
 */

// Logger
export { createLogger } from "./logger";

// Domain
export * from "./domain/domain.type";
export * from "./domain/gameRules";
export * from "./domain/acknowledge";
export * from "./domain/formatting";

// Infra
export { bootSmartico, type BootOptions } from "./infra/boot";
export type { Transport } from "./infra/transport/transport.type";
export {
  createSmarticoTransport,
  SmarticoTransport,
} from "./infra/transport/transport.smartico";

// Services
export {
  createMiniGamesStore,
  MiniGamesStore,
} from "./services/miniGamesStore";
export { createPlayerStore, PlayerStore } from "./services/playerStore";

// Messaging
export {
  MESSAGE_TYPES,
  type MessageType,
  type RedirectMode,
  type RedirectPayload,
} from "./messaging/message.type";
export { HostBridge } from "./messaging/hostBridge";
export { PrizeBridge } from "./messaging/prizeBridge";

// UI Hooks
export { useMiniGame } from "./ui/hooks/useMiniGame";
export { useWheelGame } from "./ui/hooks/useWheel";
