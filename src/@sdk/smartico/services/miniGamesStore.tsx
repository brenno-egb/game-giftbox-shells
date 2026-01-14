import type { Transport } from "../infra/transport/transport.type";
import type { MiniGameTemplate } from "../types";
import { SubscribableStore } from "./shared/baseStore";

export class MiniGamesStore extends SubscribableStore<MiniGameTemplate> {
  constructor(transport: Transport, debug = false) {
    super(transport, "miniGamesStore", debug);
  }

  protected async doFetch(opts?: {
    onUpdate?: (items: MiniGameTemplate[]) => void;
  }): Promise<MiniGameTemplate[]> {
    return this.transport.getMiniGames(opts);
  }
}

export function createMiniGamesStore(
  transport: Transport,
  debug = false
): MiniGamesStore {
  return new MiniGamesStore(transport, debug);
}