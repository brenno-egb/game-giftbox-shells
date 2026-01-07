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
    const prefix = `[${this.namespace}]`;
    
    if (level === "debug" && !this.debugEnabled) return;

    switch (level) {
      case "debug":
        console.debug(prefix, ...args);
        break;
      case "info":
        console.info(prefix, ...args);
        break;
      case "warn":
        console.warn(prefix, ...args);
        break;
      case "error":
        console.error(prefix, ...args);
        break;
    }
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