import type { Prize } from "../types";

export type RedirectMode = "assign" | "replace";

export type AckIntent =
  | { kind: "none" }
  | { kind: "dp_parent"; payload: unknown }
  | { kind: "redirect"; url: URL; mode: RedirectMode }
  | { kind: "dp"; payload: unknown };

function parseHttpUrl(value: unknown): URL | null {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function extractDpGoUrl(payload: unknown): URL | null {
  if (typeof payload !== "string") return null;
  const match = payload.match(/^dp:go&url=(.+)$/);
  if (!match) return null;
  try {
    return new URL(match[1]);
  } catch {
    return null;
  }
}

function tryGetParentSmartico(): any {
  try {
    return (window.top as any)?._smartico;
  } catch {
    return null;
  }
}

export function resolvePrizeAcknowledge(
  prize: Prize | null | undefined,
  opts?: { redirectMode?: RedirectMode }
): AckIntent {
  const raw = prize?.acknowledge_dp;
  if (raw == null || raw === "") return { kind: "none" };

  const parentSmartico = tryGetParentSmartico();

  if (parentSmartico?.dp) {
    return { kind: "dp_parent", payload: raw };
  }

  const dpGoUrl = extractDpGoUrl(raw);
  if (dpGoUrl) {
    return {
      kind: "redirect",
      url: dpGoUrl,
      mode: opts?.redirectMode ?? "assign",
    };
  }

  const url = parseHttpUrl(raw);
  if (url) {
    return { kind: "redirect", url, mode: opts?.redirectMode ?? "assign" };
  }

  return { kind: "dp", payload: raw };
}

export type AckDeps = {
  smartico?: { dp?: (payload: unknown) => void };
  redirect?: (url: string, mode: RedirectMode) => void;
};

export function runPrizeAcknowledge(
  prize: Prize | null | undefined,
  deps: AckDeps,
  opts?: { redirectMode?: RedirectMode }
): AckIntent {
  const intent = resolvePrizeAcknowledge(prize, opts);

  if (intent.kind === "none") return intent;

  if (intent.kind === "dp_parent") {
    try {
      const parentSmartico = tryGetParentSmartico();
      parentSmartico?.dp(intent.payload);
    } catch {}
    return intent;
  }

  if (intent.kind === "redirect") {
    deps.redirect?.(intent.url.toString(), intent.mode);
    return intent;
  }

  try {
    deps.smartico?.dp?.(intent.payload);
  } catch {}

  return intent;
}