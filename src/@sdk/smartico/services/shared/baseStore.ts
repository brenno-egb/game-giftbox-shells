import type { Transport } from "@/@sdk/smartico";
import { createLogger } from "@/@sdk/smartico";

type Listener<T> = (data: T) => void;

export abstract class BaseStore<T> {
  protected transport: Transport;
  protected logger: ReturnType<typeof createLogger>;
  protected listeners = new Set<Listener<T>>();
  protected lastResult: T;
  protected isSubscribed = false;

  constructor(
    transport: Transport,
    namespace: string,
    initialValue: T,
    debug = false
  ) {
    this.transport = transport;
    this.logger = createLogger(`smartico:${namespace}`, debug);
    this.lastResult = initialValue;
  }

  protected notifyListeners(data: T) {
    this.listeners.forEach((fn) => {
      try {
        fn(data);
      } catch (err) {
        this.logger.error("listener error", err);
      }
    });
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);

    const hasData = Array.isArray(this.lastResult)
      ? this.lastResult.length > 0
      : this.lastResult !== null;

    if (hasData) {
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

  getSnapshot(): T {
    return this.lastResult;
  }

  abstract fetch(): Promise<T>;
}

export abstract class SubscribableStore<T> extends BaseStore<T[]> {
  constructor(transport: Transport, namespace: string, debug = false) {
    super(transport, namespace, [], debug);
  }

  protected abstract doFetch(opts?: {
    onUpdate?: (items: T[]) => void;
  }): Promise<T[]>;

  protected ensureSubscribed() {
    if (this.isSubscribed) return;

    this.logger.debug("registering onUpdate");
    this.isSubscribed = true;

    this.doFetch({
      onUpdate: (items) => {
        this.logger.debug("onUpdate received", items.length, "items");
        this.lastResult = items;
        this.notifyListeners(items);
      },
    })
      .then((items) => {
        this.lastResult = items;
        this.notifyListeners(items);
      })
      .catch((err) => {
        this.logger.error("initial fetch failed", err);
      });
  }

  subscribe(listener: Listener<T[]>): () => void {
    this.ensureSubscribed();
    return super.subscribe(listener);
  }

  async fetch(): Promise<T[]> {
    this.logger.debug("manual fetch");

    try {
      const items = await this.doFetch();
      this.lastResult = items;
      this.notifyListeners(items);
      return items;
    } catch (err) {
      this.logger.error("fetch failed", err);
      throw err;
    }
  }

  async refresh(): Promise<T[]> {
    return this.fetch();
  }
}

export abstract class SingleValueStore<T> extends BaseStore<T | null> {
  constructor(transport: Transport, namespace: string, debug = false) {
    super(transport, namespace, null, debug);
  }

  protected abstract doFetch(): Promise<T | null>;

  async fetch(): Promise<T | null> {
    this.logger.debug("fetching");

    try {
      const data = await this.doFetch();
      this.lastResult = data;
      this.notifyListeners(data);
      return data;
    } catch (err) {
      this.logger.error("fetch failed", err);
      throw err;
    }
  }
}