type Smartico = any;

declare global {
  interface Window {
    _smartico?: Smartico;
    _smartico_user_id?: string | null;
    _smartico_language?: string | null;
    _smartico_allow_localhost?: boolean;
    __smarticoInitPromise?: Promise<Smartico>;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function loadScriptOnce(src: string, debug?: boolean) {
  const log = (...a: any[]) => debug && console.log("[BOOT]", ...a);

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-smartico="1"]`) as HTMLScriptElement | null;

    if (existing) {
      // ✅ Se já existe, só resolve quando realmente carregou
      if (existing.dataset.loaded === "1") {
        log("script already loaded");
        return resolve();
      }
      log("script exists but not loaded yet; waiting on it");
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Falha ao carregar smartico.js (existing tag)")), { once: true });
      return;
    }

    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.smartico = "1";
    s.onload = () => {
      s.dataset.loaded = "1";
      resolve();
    };
    s.onerror = () => reject(new Error("Falha ao carregar smartico.js"));
    document.head.appendChild(s);
    log("script appended");
  });
}

async function waitFor(cond: () => boolean, timeoutMs: number, debug?: boolean, label?: string) {
  const log = (...a: any[]) => debug && console.log("[BOOT]", ...a);
  const start = Date.now();
  let lastPrint = 0;

  while (Date.now() - start < timeoutMs) {
    if (cond()) return;
    await sleep(50);

    if (debug && Date.now() - lastPrint > 500) {
      lastPrint = Date.now();
      log(`waiting: ${label ?? "cond"}`);
    }
  }
  throw new Error(`Timeout esperando: ${label ?? "cond"}`);
}

export async function bootSmartico(opts: {
  scriptUrl: string;
  labelKey: string;
  brandKey: string;
  userId: string;
  language: string;
  allowLocalhost?: boolean;
  debug?: boolean;
  onStep?: (s: string) => void;
}): Promise<Smartico> {
  const debug = !!opts.debug;
  const step = (s: string) => {
    opts.onStep?.(s);
    debug && console.log("[BOOT step]", s);
  };

  if (window.__smarticoInitPromise) {
    debug && console.log("[BOOT] using cached promise");
    return window.__smarticoInitPromise;
  }

  window.__smarticoInitPromise = (async () => {
    step("set-globals");
    window._smartico_user_id = opts.userId;
    window._smartico_language = opts.language;
    if (opts.allowLocalhost) window._smartico_allow_localhost = true;

    step("load-script");
    await loadScriptOnce(opts.scriptUrl, debug);

    step("wait-window-smartico");
    await waitFor(() => !!window._smartico, 12000, debug, "window._smartico");
    const s = window._smartico!;

    step("attach-listeners");
    // listeners antes do init (não depende deles)
    try { s.on?.("init", () => debug && console.log("[BOOT] event:init")); } catch {}
    try { s.on?.("identify", () => debug && console.log("[BOOT] event:identify")); } catch {}

    step("call-init");
    s.init(opts.labelKey, { brand_key: opts.brandKey });

    step("wait-api");
    await waitFor(() => typeof s?.api?.getMiniGames === "function", 12000, debug, "s.api.getMiniGames");

    step("probe-getMiniGames");
    // tenta de verdade (se der erro real, a gente mostra)
    await s.api.getMiniGames();

    step("suspend-ui");
    try { s.suspendInbox?.(true); } catch {}
    try { s.suspendPopups?.(true); } catch {}

    step("ready");
    return s;
  })();

  return window.__smarticoInitPromise;
}
