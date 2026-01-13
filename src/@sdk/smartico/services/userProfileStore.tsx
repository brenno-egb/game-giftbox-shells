import type { Transport } from "../infra/transport/transport.type";
import type { UserProfile } from "../domain/domain.type";
import { createLogger } from "../logger";

type Listener = (profile: UserProfile | null) => void;

/**
 * Store para perfil do usuário
 * Sempre chama API (sem cache ruim)
 * Mantém lastResult apenas para getSnapshot (acesso síncrono)
 */
export class UserProfileStore {
  private transport: Transport;
  private logger: ReturnType<typeof createLogger>;
  private listeners = new Set<Listener>();
  private lastResult: UserProfile | null = null;

  constructor(transport: Transport, debug = false) {
    this.transport = transport;
    this.logger = createLogger("smartico:userProfileStore", debug);
  }

  private notifyListeners(profile: UserProfile | null) {
    this.listeners.forEach((fn) => {
      try {
        fn(profile);
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

  getSnapshot(): UserProfile | null {
    return this.lastResult;
  }

  async fetch(): Promise<UserProfile | null> {
    this.logger.debug("fetching user profile");

    try {
      const profile = await this.transport.getUserProfile();
      this.lastResult = profile;
      this.notifyListeners(profile);
      return profile;
    } catch (err) {
      this.logger.error("fetch failed", err);
      throw err;
    }
  }
}

export function createUserProfileStore(
  transport: Transport,
  debug = false
): UserProfileStore {
  return new UserProfileStore(transport, debug);
}