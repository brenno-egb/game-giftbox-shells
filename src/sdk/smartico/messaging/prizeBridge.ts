/**
 * PRIZE BRIDGE - Comunicação de Prizes para Parent
 *
 * Facilita o envio de mensagens relacionadas a prizes do iframe (jogo)
 * para o parent (window.top / smartico-games-v2.js).
 *
 * Similar ao HostBridge, mas focado em prize management.
 *
 * @module PrizeBridge
 */

import {
  MESSAGE_TYPES,
  createMessage,
  type PrizeConsumedPayload,
} from "./message.type";

// ============================================
// HELPERS
// ============================================

/**
 * Envia mensagem para o parent (window.top)
 */
function postToParent(message: any): void {
  try {
    const target =
      window.top && window.top !== window
        ? window.top
        : window.parent && window.parent !== window
        ? window.parent
        : null;

    if (!target) {
      console.warn("[PrizeBridge] No parent/top window found");
      return;
    }

    target.postMessage(message, "*");
  } catch (error) {
    console.error("[PrizeBridge] Failed to post message:", error);
  }
}

// ============================================
// PRIZE BRIDGE API
// ============================================

export const PrizeBridge = {
  /**
   * Notifica que um prize foi consumido
   *
   * Deve ser chamado quando o usuário:
   * - Joga o jogo
   * - Ganha/perde o prize
   * - Confirma o resultado (ex: clica "Continuar")
   *
   * @param itemId - ID do item da loja Smartico
   * @param purchaseTs - Timestamp da compra
   *
   * @example
   * PrizeBridge.notifyPrizeConsumed(6136, 1735567890123);
   */
  notifyPrizeConsumed(
    itemId: number | string,
    purchaseTs: number | string
  ): void {
    const payload: PrizeConsumedPayload = {
      itemId: Number(itemId),
      purchaseTs: Number(purchaseTs),
    };

    const message = createMessage(MESSAGE_TYPES.PRIZE_CONSUMED, payload);

    postToParent(message);

    console.log("[PrizeBridge] Prize consumed notification sent:", payload);
  },

  /**
   * Versão alternativa que aceita objeto
   *
   * @example
   * PrizeBridge.consumed({ itemId: 6136, purchaseTs: 1735567890123 });
   */
  consumed(payload: PrizeConsumedPayload): void {
    this.notifyPrizeConsumed(payload.itemId, payload.purchaseTs);
  },

  /*
  notifyPrizeClaimed(payload: PrizeClaimedPayload): void {
    const message = createMessage(MESSAGE_TYPES.PRIZE_CLAIMED, payload);
    postToParent(message);
  },

  notifyGameStarted(payload: GameStartedPayload): void {
    const message = createMessage(MESSAGE_TYPES.GAME_STARTED, payload);
    postToParent(message);
  },

  notifyGameCompleted(payload: GameCompletedPayload): void {
    const message = createMessage(MESSAGE_TYPES.GAME_COMPLETED, payload);
    postToParent(message);
  },

  reportError(payload: ErrorReportPayload): void {
    const message = createMessage(MESSAGE_TYPES.ERROR_REPORT, payload);
    postToParent(message);
  },
  */
} as const;

export type PrizeBridgeType = typeof PrizeBridge;

export default PrizeBridge;
