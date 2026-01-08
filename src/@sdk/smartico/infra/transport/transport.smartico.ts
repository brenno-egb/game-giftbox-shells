import type { Transport } from "./transport.type";
import type {
  MiniGameTemplate,
  PlayerInfo,
  PlayResult,
  HistoryParams,
  UserLevel,
} from "../../domain/domain.type";
import { createLogger } from "../../logger";

/**
 * Implementação de Transport que usa smartico.api e smartico.dp
 */
export class SmarticoTransport implements Transport {
  private smartico: any;
  private logger: ReturnType<typeof createLogger>;

  constructor(smartico: any, debug = false) {
    if (!smartico?.api) {
      throw new Error("Smartico não inicializado (smartico.api ausente).");
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

  async getStoreItems(): Promise<any[]> {
    this.logger.debug("getStoreItems");
    return await this.smartico.api.getStoreItems();
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
}

/**
 * Factory para criar transport do Smartico
 */
export function createSmarticoTransport(
  smartico: any,
  debug = false
): Transport {
  return new SmarticoTransport(smartico, debug);
}