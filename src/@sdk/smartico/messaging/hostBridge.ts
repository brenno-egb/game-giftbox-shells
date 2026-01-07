import { MESSAGE_TYPES, type RedirectMode } from "./message.type";
import { createLogger } from "../logger";

const logger = createLogger("smartico:hostBridge");

function postToHost(t: string, p?: unknown) {
  try {
    window.parent?.postMessage({ t, p }, "*");
    logger.debug("posted to host", t, p);
  } catch (err) {
    logger.error("failed to post to host", t, err);
  }
}

/**
 * Bridge para comunicação com o host (top window) via postMessage
 */
export const HostBridge = {
  /**
   * Solicita redirecionamento no host
   */
  redirect(url: string, mode: RedirectMode = "assign") {
    postToHost(MESSAGE_TYPES.REDIRECT, { url, mode });
  },

  /**
   * Solicita que o host esconda o overlay
   */
  hideOverlay() {
    postToHost(MESSAGE_TYPES.HIDE_OVERLAY);
  },
};