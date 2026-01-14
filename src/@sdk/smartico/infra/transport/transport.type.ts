import type {
  MiniGameTemplate,
  PlayerInfo,
  PlayResult,
  HistoryParams,
  UserLevel,
  PurchaseResult,
} from "../../types";

export interface Transport {
  getMiniGames(opts?: {
    onUpdate?: (items: MiniGameTemplate[]) => void;
  }): Promise<MiniGameTemplate[]>;

  getPublicProps(): Promise<PlayerInfo | null>;

  play(templateId: number): Promise<PlayResult>;

  getHistory(params?: HistoryParams): Promise<any>;

  acknowledge(requestId: string): Promise<any>;

  dp(payload: any): void;

  getStoreItems(opts?: { onUpdate?: (items: any[]) => void }): Promise<any[]>;

  getUserProfile(): Promise<any>;

  getCurrentLevel(): Promise<UserLevel | null>;

  purchaseStoreItem(itemId: number): Promise<PurchaseResult>;
}
