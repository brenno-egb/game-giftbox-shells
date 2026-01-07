import type { Transport } from "../infra/transport/transport.type";
import type { StoreItem } from "../domain/domain.type";
import { createLogger } from "../logger";

type Listener = (items: StoreItem[]) => void;

/**
 * Store para itens da loja (baús, etc)
 */
export class StoreItemsStore {
  private transport: Transport;
  private logger: ReturnType<typeof createLogger>;

  private cache: StoreItem[] | null = null;
  private listeners = new Set<Listener>();
  private isFetching = false;

  constructor(transport: Transport, debug = false) {
    this.transport = transport;
    this.logger = createLogger("smartico:storeItemsStore", debug);
  }

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

  getSnapshot(): StoreItem[] {
    return this.cache ?? [];
  }

  async fetch(forceRefresh = false): Promise<StoreItem[]> {
    if (!forceRefresh && this.cache !== null) {
      this.logger.debug("using cached store items");
      return this.cache;
    }

    if (this.isFetching) {
      this.logger.debug("fetch already in progress");
      return this.cache ?? [];
    }

    this.logger.debug("fetching store items");
    this.isFetching = true;

    try {
      const items = await this.transport.getStoreItems();
      this.cache = items;
      this.notifyListeners();
      return items;
    } catch (err) {
      this.logger.error("fetch failed", err);
      throw err;
    } finally {
      this.isFetching = false;
    }
  }

  async refresh(): Promise<StoreItem[]> {
    return this.fetch(true);
  }

  clear() {
    this.logger.debug("clearing cache");
    this.cache = null;
    this.notifyListeners();
  }
}

export function createStoreItemsStore(
  transport: Transport,
  debug = false
): StoreItemsStore {
  return new StoreItemsStore(transport, debug);
}