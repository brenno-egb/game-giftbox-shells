export type RedirectMode = "assign" | "replace";

export type MessageType =
  | "redirect"
  | "close"
  | "ready"
  | "error"
  | "analytics";

export type RedirectPayload = {
  url: string;
  mode: RedirectMode;
};

export type MessagePayload = {
  type: MessageType;
  data?: any;
};

const isIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

export class HostBridge {
  private static postToParent(message: MessagePayload): void {
    if (isIframe() && window.parent) {
      window.parent.postMessage(message, "*");
    }
  }

  static redirect(url: string, mode: RedirectMode = "assign"): void {
    if (isIframe()) {
      this.postToParent({
        type: "redirect",
        data: { url, mode } as RedirectPayload,
      });
    } else {
      if (mode === "replace") {
        window.location.replace(url);
      } else {
        window.location.assign(url);
      }
    }
  }

  static close(): void {
    if (isIframe()) {
      this.postToParent({ type: "close" });
    } else {
      window.close();
    }
  }

  static ready(): void {
    this.postToParent({ type: "ready" });
  }

  static error(error: string | Error): void {
    this.postToParent({
      type: "error",
      data: { message: error instanceof Error ? error.message : error },
    });
  }

  static analytics(event: string, data?: Record<string, any>): void {
    this.postToParent({
      type: "analytics",
      data: { event, ...data },
    });
  }
}

export const MESSAGE_TYPES = {
  REDIRECT: "redirect" as const,
  CLOSE: "close" as const,
  READY: "ready" as const,
  ERROR: "error" as const,
  ANALYTICS: "analytics" as const,
};
