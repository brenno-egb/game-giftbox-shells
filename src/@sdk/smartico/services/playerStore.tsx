import type { Transport } from "../infra/transport/transport.type";
import type { PlayerInfo } from "../types";
import { SingleValueStore } from "./shared/baseStore";

export class PlayerStore extends SingleValueStore<PlayerInfo> {
  constructor(transport: Transport, debug = false) {
    super(transport, "playerStore", debug);
  }

  protected async doFetch(): Promise<PlayerInfo | null> {
    return this.transport.getPublicProps();
  }
}

export function createPlayerStore(
  transport: Transport,
  debug = false
): PlayerStore {
  return new PlayerStore(transport, debug);
}