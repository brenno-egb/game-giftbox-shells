type Ack =
  | { kind: "none" }
  | { kind: "url"; url: string }
  | { kind: "dp"; payload: any };

function isHttpUrl(v: any) {
  try {
    const u = new URL(String(v));
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function resolvePrizeAcknowledge(prize: any): Ack {
  const v = prize?.acknowledge_dp;
  if (!v) return { kind: "none" };

  if (isHttpUrl(v)) return { kind: "url", url: String(v) };

  return { kind: "dp", payload: v };
}

export function runPrizeAcknowledge(opts: {
  prize: any;
  smartico?: any;

  hostOpenUrl?: (url: string) => void;
}) {
  const ack = resolvePrizeAcknowledge(opts.prize);

  if (ack.kind === "none") return ack;

  if (ack.kind === "url") {
    if (opts.hostOpenUrl) {
      opts.hostOpenUrl(ack.url);
    } else {
      window.open(ack.url, "_blank", "noopener,noreferrer");
    }
    return ack;
  }

  if (typeof opts.smartico?.dp === "function") {
    try {
      opts.smartico.dp(ack.payload);
    } catch {}
  }

  return ack;
}
