import type { Transport } from "../infra/transport/transport.type";
import type { UserLevel } from "../types";
import { SingleValueStore } from "./shared/baseStore";

export class UserLevelStore extends SingleValueStore<UserLevel> {
  constructor(transport: Transport, debug = false) {
    super(transport, "userLevelStore", debug);
  }

  protected async doFetch(): Promise<UserLevel | null> {
    return this.transport.getCurrentLevel();
  }
}

export function createUserLevelStore(
  transport: Transport,
  debug = false
): UserLevelStore {
  return new UserLevelStore(transport, debug);
}