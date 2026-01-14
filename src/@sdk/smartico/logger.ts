type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private namespace: string;
  private debugEnabled: boolean;

  constructor(namespace: string, debug = false) {
    this.namespace = namespace;
    this.debugEnabled = debug;
  }

  setDebug(enabled: boolean) {
    this.debugEnabled = enabled;
  }

  private log(level: LogLevel, ...args: any[]) {
    if (level === "debug" && !this.debugEnabled) return;

    const prefix = `[${this.namespace}]`;
    const method = level === "debug" ? "log" : level;
    console[method](prefix, ...args);
  }

  debug(...args: any[]) {
    this.log("debug", ...args);
  }

  info(...args: any[]) {
    this.log("info", ...args);
  }

  warn(...args: any[]) {
    this.log("warn", ...args);
  }

  error(...args: any[]) {
    this.log("error", ...args);
  }

  child(subNamespace: string, debug?: boolean) {
    return new Logger(
      `${this.namespace}:${subNamespace}`,
      debug ?? this.debugEnabled
    );
  }
}

export function createLogger(namespace: string, debug = false) {
  return new Logger(namespace, debug);
}
