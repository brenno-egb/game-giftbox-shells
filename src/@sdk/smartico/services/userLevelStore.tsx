import type { Transport } from "../infra/transport/transport.type";
import type { UserLevel } from "../domain/domain.type";
import { createLogger } from "../logger";

type Listener = (level: UserLevel | null) => void;

/**
 * Store para nível do usuário
 * Sempre chama API (sem cache ruim)
 * Mantém lastResult apenas para getSnapshot (acesso síncrono)
 */
export class UserLevelStore {
  private transport: Transport;
  private logger: ReturnType<typeof createLogger>;
  private listeners = new Set<Listener>();
  private lastResult: UserLevel | null = null;

  constructor(transport: Transport, debug = false) {
    this.transport = transport;
    this.logger = createLogger("smartico:userLevelStore", debug);
  }

  private notifyListeners(level: UserLevel | null) {
    this.listeners.forEach((fn) => {
      try {
        fn(level);
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

  getSnapshot(): UserLevel | null {
    return this.lastResult;
  }

  async fetch(): Promise<UserLevel | null> {
    this.logger.debug("fetching user level");

    try {
      const level = await this.transport.getCurrentLevel();
      this.lastResult = level;
      this.notifyListeners(level);
      return level;
    } catch (err) {
      this.logger.error("fetch failed", err);
      throw err;
    }
  }
}

export function createUserLevelStore(
  transport: Transport,
  debug = false
): UserLevelStore {
  return new UserLevelStore(transport, debug);
}