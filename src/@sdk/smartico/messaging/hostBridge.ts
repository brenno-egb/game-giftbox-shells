export type RedirectMode = "assign" | "replace";

export type MessageType = "close" | "ready" | "error" | "analytics";

export type MessagePayload = {
  type: MessageType;
  data?: any;
};

export class HostBridge {
  static redirect(url: string, mode: RedirectMode = "assign"): void {
    try {
      if (window.top && window.top !== window.self && window.top.location) {
        if (mode === "replace") {
          window.top.location.replace(url);
        } else {
          window.top.location.assign(url);
        }
        return;
      }
    } catch {}

    if (mode === "replace") {
      window.location.replace(url);
    } else {
      window.location.assign(url);
    }
  }

  static close(): void {
    window.close();
  }

  static ready(): void {}

  static error(error: string | Error): void {}

  static analytics(event: string, data?: Record<string, any>): void {}
}

export const MESSAGE_TYPES = {
  CLOSE: "close" as const,
  READY: "ready" as const,
  ERROR: "error" as const,
  ANALYTICS: "analytics" as const,
};