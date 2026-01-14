import type { Transport } from "../infra/transport/transport.type";
import type { UserProfile } from "../types";
import { SingleValueStore } from "./shared/baseStore";

export class UserProfileStore extends SingleValueStore<UserProfile> {
  constructor(transport: Transport, debug = false) {
    super(transport, "userProfileStore", debug);
  }

  protected async doFetch(): Promise<UserProfile | null> {
    return this.transport.getUserProfile();
  }
}

export function createUserProfileStore(
  transport: Transport,
  debug = false
): UserProfileStore {
  return new UserProfileStore(transport, debug);
}