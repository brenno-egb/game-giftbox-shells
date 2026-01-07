import type { Transport } from "../infra/transport/transport.type";
import type { PlayerInfo } from "../domain/domain.type";
import { createLogger } from "../logger";

type Listener = (info: PlayerInfo | null) => void;

/**
 * Store para informações do player
 * Sempre chama API (sem cache ruim)
 * Mantém lastResult apenas para getSnapshot (acesso síncrono)
 */
export class PlayerStore {
  private transport: Transport;
  private logger: ReturnType<typeof createLogger>;
  private listeners = new Set<Listener>();
  private lastResult: PlayerInfo | null = null;

  constructor(transport: Transport, debug = false) {
    this.transport = transport;
    this.logger = createLogger("smartico:playerStore", debug);
  }

  private notifyListeners(info: PlayerInfo | null) {
    this.listeners.forEach((fn) => {
      try {
        fn(info);
      } catch (err) {
        this.logger.error("listener error", err);
      }
    });
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    
    if (this.lastResult !== null) {
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

  getSnapshot(): PlayerInfo | null {
    return this.lastResult;
  }

  async fetch(): Promise<PlayerInfo | null> {
    this.logger.debug("fetching player info");
    
    try {
      const info = await this.transport.getPublicProps();
      this.lastResult = info;
      this.notifyListeners(info);
      return info;
    } catch (err) {
      this.logger.error("fetch failed", err);
      throw err;
    }
  }
}

export function createPlayerStore(
  transport: Transport,
  debug = false
): PlayerStore {
  return new PlayerStore(transport, debug);
}