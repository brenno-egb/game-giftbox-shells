import type { Transport } from "./transport.type";
import type {
  MiniGameTemplate,
  PlayerInfo,
  PlayResult,
  HistoryParams,
  UserLevel,
} from "../../domain/domain.type";
import type { PurchaseResult } from "../../domain/purchase.types";
import { createLogger } from "../../logger";

export class SmarticoTransport implements Transport {
  private smartico: any;
  private logger: ReturnType<typeof createLogger>;

  constructor(smartico: any, debug = false) {
    if (!smartico?.api) {
      throw new Error("sapi null");
    }
    this.smartico = smartico;
    this.logger = createLogger("smartico:transport", debug);
  }

  async getMiniGames(opts?: {
    onUpdate?: (items: MiniGameTemplate[]) => void;
  }): Promise<MiniGameTemplate[]> {
    this.logger.debug("getMiniGames", opts ? "with onUpdate" : "");
    return await this.smartico.api.getMiniGames(opts ?? undefined);
  }

  async getPublicProps(): Promise<PlayerInfo | null> {
    this.logger.debug("getPublicProps");
    if (typeof this.smartico.getPublicProps !== "function") return null;
    return await this.smartico.getPublicProps();
  }

  async play(templateId: number): Promise<PlayResult> {
    this.logger.debug("play", templateId);
    const res = await this.smartico.api.playMiniGame(templateId);

    if (res?.err_code != null && res.err_code !== 0) {
      throw new Error(res?.err_msg || "Falha ao jogar (err_code != 0).");
    }

    return res;
  }

  async getHistory(params?: HistoryParams): Promise<any> {
    this.logger.debug("getHistory", params);
    return await this.smartico.api.getMiniGamesHistory({
      limit: params?.limit,
      offset: params?.offset,
      saw_template_id: params?.templateId,
    });
  }

  async acknowledge(requestId: string): Promise<any> {
    this.logger.debug("acknowledge", requestId);
    return await this.smartico.api.miniGameWinAcknowledgeRequest(requestId);
  }

  dp(payload: any): void {
    this.logger.debug("dp", payload);
    try {
      this.smartico?.dp?.(payload);
    } catch (err) {
      this.logger.error("dp failed", err);
    }
  }

  async getStoreItems(opts?: {
    onUpdate?: (items: any[]) => void;
  }): Promise<any[]> {
    this.logger.debug("getStoreItems", opts ? "with onUpdate" : "");
    return await this.smartico.api.getStoreItems(opts ?? undefined);
  }

  async getUserProfile(): Promise<any> {
    this.logger.debug("getUserProfile");
    return await this.smartico.api.getUserProfile();
  }

  async getCurrentLevel(): Promise<UserLevel | null> {
    this.logger.debug("getCurrentLevel");
    try {
      return await this.smartico.api.getCurrentLevel();
    } catch (err) {
      this.logger.error("getCurrentLevel failed", err);
      return null;
    }
  }

  /**
   * ⭐ CRÍTICO: NÃO LANÇA EXCEÇÃO - Retorna resultado da API
   * O hook vai usar handlePurchaseError(result) para processar err_code
   */
  async purchaseStoreItem(itemId: number): Promise<PurchaseResult> {
    this.logger.debug("purchaseStoreItem", itemId);

    try {
      const res = await this.smartico.api.buyStoreItem(itemId);
      
      // ⭐⭐⭐ RETORNA DIRETO - SEM THROW ⭐⭐⭐
      this.logger.debug("purchaseStoreItem result", res);
      return res;
      
    } catch (err: any) {
      // ⭐ Só cai aqui em erro de REDE (não erro da API)
      this.logger.error("purchaseStoreItem network error", err);
      
      return {
        err_code: -1,
        err_msg: err?.message || "Erro de rede ao processar compra",
      };
    }
  }
}

export function createSmarticoTransport(
  smartico: any,
  debug = false
): Transport {
  return new SmarticoTransport(smartico, debug);
}