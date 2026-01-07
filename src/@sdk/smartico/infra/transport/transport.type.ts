import type {
  MiniGameTemplate,
  PlayerInfo,
  PlayResult,
  HistoryParams,
} from "../../domain/domain.type";

/**
 * Interface abstrata para comunicação com Smartico
 * Permite mockar ou trocar implementação no futuro
 */
export interface Transport {
  /**
   * Busca lista de mini-games disponíveis
   */
  getMiniGames(opts?: {
    onUpdate?: (items: MiniGameTemplate[]) => void;
  }): Promise<MiniGameTemplate[]>;

  /**
   * Busca informações públicas do jogador
   */
  getPublicProps(): Promise<PlayerInfo | null>;

  /**
   * Executa uma jogada em um mini-game
   */
  play(templateId: number): Promise<PlayResult>;

  /**
   * Busca histórico de jogadas
   */
  getHistory(params?: HistoryParams): Promise<any>;

  /**
   * Envia acknowledge de vitória
   */
  acknowledge(requestId: string): Promise<any>;

  /**
   * Envia data point personalizado
   */
  dp(payload: any): void;

  /**
   * Busca itens da loja (baús, etc)
   */
  getStoreItems(): Promise<any[]>;

  /**
   * Busca perfil completo do usuário
   */
  getUserProfile(): Promise<any>;
}