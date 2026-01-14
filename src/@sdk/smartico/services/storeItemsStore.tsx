import type { Transport } from "../infra/transport/transport.type";
import type { StoreItem } from "../types";
import { SubscribableStore } from "./shared/baseStore";

export class StoreItemsStore extends SubscribableStore<StoreItem> {
  constructor(transport: Transport, debug = false) {
    super(transport, "storeItemsStore", debug);
  }

  protected async doFetch(opts?: {
    onUpdate?: (items: StoreItem[]) => void;
  }): Promise<StoreItem[]> {
    return this.transport.getStoreItems(opts);
  }
}

export function createStoreItemsStore(
  transport: Transport,
  debug = false
): StoreItemsStore {
  return new StoreItemsStore(transport, debug);
}