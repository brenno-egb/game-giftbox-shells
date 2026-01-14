import type { Transport } from "./transport.type";
import type {
  MiniGameTemplate,
  PlayerInfo,
  PlayResult,
  HistoryParams,
  UserLevel,
  PurchaseResult,
} from "../../types";
import { createLogger } from "../../logger";

export class SmarticoTransport implements Transport {
  private smartico: any;
  private logger: ReturnType<typeof createLogger>;

  constructor(smartico: any, debug = false) {
    if (!smartico?.api) {
      throw new Error("Smartico API not available");
    }
    this.smartico = smartico;
    this.logger = createLogger("smartico:transport", debug);
  }

  async getMiniGames(opts?: {
    onUpdate?: (items: MiniGameTemplate[]) => void;
  }): Promise<MiniGameTemplate[]> {
    this.logger.debug("getMiniGames");
    return this.smartico.api.getMiniGames(opts ?? undefined);
  }

  async getPublicProps(): Promise<PlayerInfo | null> {
    this.logger.debug("getPublicProps");
    if (typeof this.smartico.getPublicProps !== "function") return null;
    return this.smartico.getPublicProps();
  }

  async play(templateId: number): Promise<PlayResult> {
    this.logger.debug("play", templateId);
    const res = await this.smartico.api.playMiniGame(templateId);

    if (res?.err_code != null && res.err_code !== 0) {
      throw new Error(res?.err_msg || "Play failed");
    }

    return res;
  }

  async getHistory(params?: HistoryParams): Promise<any> {
    this.logger.debug("getHistory");
    return this.smartico.api.getMiniGamesHistory({
      limit: params?.limit,
      offset: params?.offset,
      saw_template_id: params?.templateId,
    });
  }

  async acknowledge(requestId: string): Promise<any> {
    this.logger.debug("acknowledge", requestId);
    return this.smartico.api.miniGameWinAcknowledgeRequest(requestId);
  }

  dp(payload: any): void {
    this.logger.debug("dp");
    try {
      this.smartico?.dp?.(payload);
    } catch (err) {
      this.logger.error("dp failed", err);
    }
  }

  async getStoreItems(opts?: {
    onUpdate?: (items: any[]) => void;
  }): Promise<any[]> {
    this.logger.debug("getStoreItems");
    return this.smartico.api.getStoreItems(opts ?? undefined);
  }

  async getUserProfile(): Promise<any> {
    this.logger.debug("getUserProfile");
    return this.smartico.api.getUserProfile();
  }

  async getCurrentLevel(): Promise<UserLevel | null> {
    this.logger.debug("getCurrentLevel");
    try {
      return this.smartico.api.getCurrentLevel();
    } catch (err) {
      this.logger.error("getCurrentLevel failed", err);
      return null;
    }
  }

  async purchaseStoreItem(itemId: number): Promise<PurchaseResult> {
    this.logger.debug("purchaseStoreItem", itemId);
    try {
      return await this.smartico.api.buyStoreItem(itemId);
    } catch (err: any) {
      this.logger.error("purchaseStoreItem failed", err);
      return {
        err_code: -1,
        err_msg: err?.message || "Network error",
      };
    }
  }
}

export function createSmarticoTransport(smartico: any, debug = false): Transport {
  return new SmarticoTransport(smartico, debug);
}