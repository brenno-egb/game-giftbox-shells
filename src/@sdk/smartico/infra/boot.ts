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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function loadScriptOnce(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-smartico="1"]'
    ) as HTMLScriptElement | null;

    if (existing) {
      if (existing.dataset.loaded === "1") return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Script load failed")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.smartico = "1";
    script.onload = () => {
      script.dataset.loaded = "1";
      resolve();
    };
    script.onerror = () => reject(new Error("Script load failed"));
    document.head.appendChild(script);
  });
}

async function waitFor(
  condition: () => boolean,
  timeoutMs: number,
  label: string
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (condition()) return;
    await sleep(50);
  }
  throw new Error(`Timeout: ${label}`);
}

async function waitForInternalSetup(
  smartico: Smartico,
  timeoutMs: number
): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const profile = await smartico.api.getUserProfile();

      if (profile && typeof profile === "object") {
        const isValid =
          typeof profile.user_id === "number" ||
          typeof profile.public_username === "string" ||
          typeof profile.ach_points_balance === "number";

        if (isValid) return;
      }
    } catch {
      // Continue polling
    }

    await sleep(100);
  }

  throw new Error("Timeout: internal setup");
}

function suspendUI(smartico: Smartico) {
  try {
    smartico.suspendInbox?.(true);
    smartico.suspendPopups?.(true);
  } catch (e) {
    console.error("[Smartico] Failed to suspend UI:", e);
  }
}

export type BootOptions = {
  scriptUrl: string;
  labelKey: string;
  brandKey: string;
  userId: string;
  language: string;
  allowLocalhost?: boolean;
  debug?: boolean;
  onStep?: (step: string) => void;
};

export async function bootSmartico(opts: BootOptions): Promise<Smartico> {
  const { debug = false, onStep } = opts;
  const step = (s: string) => {
    onStep?.(s);
    if (debug) console.log("[Smartico Boot]", s);
  };

  if (window.__smarticoBootPromise) {
    return window.__smarticoBootPromise;
  }

  window.__smarticoBootPromise = (async () => {
    step("set-globals");
    window._smartico_user_id = opts.userId;
    window._smartico_language = opts.language;
    if (opts.allowLocalhost) window._smartico_allow_localhost = true;

    step("load-script");
    await loadScriptOnce(opts.scriptUrl);

    step("wait-smartico");
    await waitFor(() => !!window._smartico, 12000, "window._smartico");

    const smartico = window._smartico!;

    step("init");
    smartico.init(opts.labelKey, { brand_key: opts.brandKey });

    step("wait-api");
    await waitFor(
      () => typeof smartico?.api?.getMiniGames === "function",
      12000,
      "smartico.api"
    );

    step("wait-setup");
    await waitForInternalSetup(smartico, 12000);

    step("suspend-ui");
    suspendUI(smartico);

    smartico.on?.("init", () => suspendUI(smartico));
    smartico.on?.("identify", () => suspendUI(smartico));

    step("ready");
    return smartico;
  })();

  return window.__smarticoBootPromise;
}