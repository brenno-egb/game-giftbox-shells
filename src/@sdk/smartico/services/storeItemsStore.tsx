import type { Transport } from "../infra/transport/transport.type";
import type { StoreItem } from "../domain/domain.type";
import { createLogger } from "../logger";

type Listener = (items: StoreItem[]) => void;

/**
 * Store para itens da loja
 * Smartico faz cache de 30s - sempre chama API
 * Mantém lastResult apenas para getSnapshot (acesso síncrono)
 */
export class StoreItemsStore {
  private transport: Transport;
  private logger: ReturnType<typeof createLogger>;
  private listeners = new Set<Listener>();
  private lastResult: StoreItem[] = [];

  constructor(transport: Transport, debug = false) {
    this.transport = transport;
    this.logger = createLogger("smartico:storeItemsStore", debug);
  }

  private notifyListeners(items: StoreItem[]) {
    this.listeners.forEach((fn) => {
      try {
        fn(items);
      } catch (err) {
        this.logger.error("listener error", err);
      }
    });
  }

  subscribe(listener: Listener): () => void {
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

  getSnapshot(): StoreItem[] {
    return this.lastResult;
  }

  async fetch(): Promise<StoreItem[]> {
    this.logger.debug("fetching store items");
    
    try {
      const items = await this.transport.getStoreItems();
      this.lastResult = items;
      this.notifyListeners(items);
      return items;
    } catch (err) {
      this.logger.error("fetch failed", err);
      throw err;
    }
  }
}

export function createStoreItemsStore(
  transport: Transport,
  debug = false
): StoreItemsStore {
  return new StoreItemsStore(transport, debug);
}