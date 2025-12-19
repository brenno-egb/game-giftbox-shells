type Smartico = any;

declare global {
  interface Window {
    _smartico?: Smartico;
    _smartico_user_id?: string | null;
    _smartico_language?: string | null;
    _smartico_allow_localhost?: boolean;

    __smarticoBootPromise?: Promise<Smartico>;
  }
}

/* ---------------------------------- utils --------------------------------- */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function loadScriptOnce(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-smartico="1"]'
    ) as HTMLScriptElement | null;

    if (existing) {
      if (existing.dataset.loaded === "1") return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Falha ao carregar smartico.js")),
        { once: true }
      );
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
  });
}

async function waitFor(cond: () => boolean, timeoutMs: number, label: string) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (cond()) return;
    await sleep(50);
  }
  throw new Error(`Timeout esperando: ${label}`);
}

/* ---------------------------------- boot ---------------------------------- */

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
    if (debug) console.log("[SMARTICO BOOT]", s);
  };

  // ✅ evita boots concorrentes
  if (window.__smarticoBootPromise) {
    if (debug) console.log("[SMARTICO BOOT] reuse existing boot");
    return window.__smarticoBootPromise;
  }

  window.__smarticoBootPromise = (async () => {
    step("set-globals");
    window._smartico_user_id = opts.userId;
    window._smartico_language = opts.language;
    if (opts.allowLocalhost) window._smartico_allow_localhost = true;

    step("load-script");
    await loadScriptOnce(opts.scriptUrl);

    step("wait-window._smartico");
    await waitFor(() => !!window._smartico, 12000, "window._smartico");

    const s = window._smartico!;

    step("call-init");
    s.init(opts.labelKey, { brand_key: opts.brandKey });

    step("wait-api");
    await waitFor(
      () => typeof s?.api?.getMiniGames === "function",
      12000,
      "s.api.getMiniGames"
    );

    step("suspend-ui");
    try {
      s.suspendInbox?.(true);
      s.suspendPopups?.(true);
    } catch {}

    step("ready");
    return s;
  })();

  return window.__smarticoBootPromise;
}
