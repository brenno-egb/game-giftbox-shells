import type { Transport } from "../infra/transport/transport.type";
import type { MiniGameTemplate } from "../domain/domain.type";
import { createLogger } from "../logger";

type Listener = (games: MiniGameTemplate[]) => void;

/**
 * Store central para mini-games
 * Registra onUpdate UMA ÚNICA VEZ e expõe subscribe/getSnapshot/refresh
 */
export class MiniGamesStore {
  private transport: Transport;
  private logger: ReturnType<typeof createLogger>;
  
  private cache: MiniGameTemplate[] | null = null;
  private listeners = new Set<Listener>();
  private isSubscribed = false;

  constructor(transport: Transport, debug = false) {
    this.transport = transport;
    this.logger = createLogger("smartico:miniGamesStore", debug);
  }

  /**
   * Garante que o onUpdate está registrado
   */
  private ensureSubscribed() {
    if (this.isSubscribed) return;

    this.logger.debug("registering onUpdate (once)");
    this.isSubscribed = true;

    // Registra onUpdate UMA VEZ
    this.transport
      .getMiniGames({
        onUpdate: (items) => {
          this.logger.debug("onUpdate received", items.length, "games");
          this.cache = items;
          this.notifyListeners();
        },
      })
      .then((items) => {
        this.cache = items;
        this.notifyListeners();
      })
      .catch((err) => {
        this.logger.error("initial getMiniGames failed", err);
      });
  }

  /**
   * Notifica todos os listeners
   */
  private notifyListeners() {
    const snapshot = this.cache ?? [];
    this.listeners.forEach((fn) => {
      try {
        fn(snapshot);
      } catch (err) {
        this.logger.error("listener error", err);
      }
    });
  }

  /**
   * Subscribe para mudanças na lista de games
   */
  subscribe(listener: Listener): () => void {
    this.ensureSubscribed();
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
  getSnapshot(): MiniGameTemplate[] {
    return this.cache ?? [];
  }

  /**
   * Força refresh da lista (opcional, mas útil)
   */
  async refresh(): Promise<MiniGameTemplate[]> {
    this.logger.debug("manual refresh");
    try {
      const items = await this.transport.getMiniGames();
      this.cache = items;
      this.notifyListeners();
      return items;
    } catch (err) {
      this.logger.error("refresh failed", err);
      throw err;
    }
  }

  /**
   * Busca um game específico por ID
   */
  findById(templateId: number | string): MiniGameTemplate | null {
    const games = this.getSnapshot();
    return games.find((g) => String(g.id) === String(templateId)) ?? null;
  }
}

/**
 * Factory para criar a store
 */
export function createMiniGamesStore(
  transport: Transport,
  debug = false
): MiniGamesStore {
  return new MiniGamesStore(transport, debug);
}