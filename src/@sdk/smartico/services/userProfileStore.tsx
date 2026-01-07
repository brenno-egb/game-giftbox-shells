import type { Transport } from "../infra/transport/transport.type";
import type { UserProfile } from "../domain/domain.type";
import { createLogger } from "../logger";

type Listener = (profile: UserProfile | null) => void;

/**
 * Store para perfil completo do usuário
 */
export class UserProfileStore {
  private transport: Transport;
  private logger: ReturnType<typeof createLogger>;

  private cache: UserProfile | null = null;
  private listeners = new Set<Listener>();
  private isFetching = false;

  constructor(transport: Transport, debug = false) {
    this.transport = transport;
    this.logger = createLogger("smartico:userProfileStore", debug);
  }

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

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);

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

  getSnapshot(): UserProfile | null {
    return this.cache;
  }

  async fetch(forceRefresh = false): Promise<UserProfile | null> {
    if (!forceRefresh && this.cache !== null) {
      this.logger.debug("using cached profile");
      return this.cache;
    }

    if (this.isFetching) {
      this.logger.debug("fetch already in progress");
      return this.cache;
    }

    this.logger.debug("fetching user profile");
    this.isFetching = true;

    try {
      const profile = await this.transport.getUserProfile();
      this.cache = profile;
      this.notifyListeners();
      return profile;
    } catch (err) {
      this.logger.error("fetch failed", err);
      throw err;
    } finally {
      this.isFetching = false;
    }
  }

  async refresh(): Promise<UserProfile | null> {
    return this.fetch(true);
  }

  clear() {
    this.logger.debug("clearing cache");
    this.cache = null;
    this.notifyListeners();
  }
}

export function createUserProfileStore(
  transport: Transport,
  debug = false
): UserProfileStore {
  return new UserProfileStore(transport, debug);
}