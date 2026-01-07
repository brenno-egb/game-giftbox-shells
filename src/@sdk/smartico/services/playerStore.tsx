import type { Transport } from "../infra/transport/transport.type";
import type { PlayerInfo } from "../domain/domain.type";
import { createLogger } from "../logger";

type Listener = (info: PlayerInfo | null) => void;

/**
 * Store para informações do player
 * Cache opcional com refresh manual
 */
export class PlayerStore {
  private transport: Transport;
  private logger: ReturnType<typeof createLogger>;
  
  private cache: PlayerInfo | null = null;
  private listeners = new Set<Listener>();
  private isFetching = false;

  constructor(transport: Transport, debug = false) {
    this.transport = transport;
    this.logger = createLogger("smartico:playerStore", debug);
  }

  /**
   * Notifica todos os listeners
   */
  private notifyListeners() {
    const snapshot = this.cache;
    this.listeners.forEach((fn) => {
      try {
        fn(snapshot);
      } catch (err) {
        this.logger.error("listener error", err);
      }
    });
  }

  /**
   * Subscribe para mudanças nas informações do player
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);

    // Notifica imediatamente se já tem cache
    if (this.cache !== null) {
      try {
        listener(this.cache);
      } catch (err) {
        this.logger.error("listener error on subscribe", err);
      }
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Retorna snapshot atual (síncrono)
   */
  getSnapshot(): PlayerInfo | null {
    return this.cache;
  }

  /**
   * Busca informações do player (usa cache se disponível)
   */
  async fetch(forceRefresh = false): Promise<PlayerInfo | null> {
    if (!forceRefresh && this.cache !== null) {
      this.logger.debug("using cached player info");
      return this.cache;
    }

    if (this.isFetching) {
      this.logger.debug("fetch already in progress, waiting...");
      // Poderia implementar uma fila aqui, mas por simplicidade retorna cache
      return this.cache;
    }

    this.logger.debug("fetching player info");
    this.isFetching = true;

    try {
      const info = await this.transport.getPublicProps();
      this.cache = info;
      this.notifyListeners();
      return info;
    } catch (err) {
      this.logger.error("fetch failed", err);
      throw err;
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * Força refresh das informações
   */
  async refresh(): Promise<PlayerInfo | null> {
    return this.fetch(true);
  }

  /**
   * Limpa o cache
   */
  clear() {
    this.logger.debug("clearing cache");
    this.cache = null;
    this.notifyListeners();
  }
}

/**
 * Factory para criar a store
 */
export function createPlayerStore(
  transport: Transport,
  debug = false
): PlayerStore {
  return new PlayerStore(transport, debug);
}