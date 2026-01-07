import type { Transport } from "../infra/transport/transport.type";
import type { MiniGameTemplate } from "../domain/domain.type";
import { createLogger } from "../logger";

type Listener = (games: MiniGameTemplate[]) => void;

/**
 * Store para mini-games
 * Smartico faz cache de 30s - usa onUpdate callback
 * Mantém lastResult apenas para getSnapshot (acesso síncrono)
 */
export class MiniGamesStore {
  private transport: Transport;
  private logger: ReturnType<typeof createLogger>;
  private listeners = new Set<Listener>();
  private lastResult: MiniGameTemplate[] = [];
  private isSubscribed = false;

  constructor(transport: Transport, debug = false) {
    this.transport = transport;
    this.logger = createLogger("smartico:miniGamesStore", debug);
  }

  private ensureSubscribed() {
    if (this.isSubscribed) return;

    this.logger.debug("registering onUpdate");
    this.isSubscribed = true;

    // Registra onUpdate da Smartico UMA VEZ
    this.transport
      .getMiniGames({
        onUpdate: (items) => {
          this.logger.debug("onUpdate received", items.length, "games");
          this.lastResult = items;
          this.notifyListeners(items);
        },
      })
      .then((items) => {
        this.lastResult = items;
        this.notifyListeners(items);
      })
      .catch((err) => {
        this.logger.error("initial getMiniGames failed", err);
      });
  }

  private notifyListeners(games: MiniGameTemplate[]) {
    this.listeners.forEach((fn) => {
      try {
        fn(games);
      } catch (err) {
        this.logger.error("listener error", err);
      }
    });
  }

  subscribe(listener: Listener): () => void {
    this.ensureSubscribed();
    this.listeners.add(listener);
    
    if (this.lastResult.length > 0) {
      try {
        listener(this.lastResult);
      } catch (err) {
        this.logger.error("listener error on subscribe", err);
      }
    }
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): MiniGameTemplate[] {
    return this.lastResult;
  }

  async refresh(): Promise<MiniGameTemplate[]> {
    this.logger.debug("manual refresh");
    
    try {
      const items = await this.transport.getMiniGames();
      this.lastResult = items;
      this.notifyListeners(items);
      return items;
    } catch (err) {
      this.logger.error("refresh failed", err);
      throw err;
    }
  }
}

export function createMiniGamesStore(
  transport: Transport,
  debug = false
): MiniGamesStore {
  return new MiniGamesStore(transport, debug);
}