import type { Prize } from "../types";

export type RedirectMode = "assign" | "replace";

export type AckIntent =
  | { kind: "none" }
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

export function resolvePrizeAcknowledge(
  prize: Prize | null | undefined,
  opts?: { redirectMode?: RedirectMode }
): AckIntent {
  const raw = prize?.acknowledge_dp;
  if (raw == null || raw === "") return { kind: "none" };

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

  if (intent.kind === "redirect") {
    deps.redirect?.(intent.url.toString(), intent.mode);
    return intent;
  }

  try {
    deps.smartico?.dp?.(intent.payload);
  } catch {}

  return intent;
}