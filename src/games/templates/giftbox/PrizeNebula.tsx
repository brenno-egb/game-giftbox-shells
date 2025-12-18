"use client";

import { useMemo } from "react";

type PrizeLike = { id?: string | number; icon?: string; name?: string };

const FALLBACK_ICON =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <radialGradient id="g" cx="30%" cy="30%" r="70%">
        <stop offset="0" stop-color="rgba(255,255,255,.85)"/>
        <stop offset="1" stop-color="rgba(18,194,233,.22)"/>
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="22" fill="url(#g)"/>
    <circle cx="32" cy="32" r="10" fill="rgba(196,113,237,.18)"/>
  </svg>
`);

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function stableShuffle<T>(arr: T[], seed: string) {
  const a = [...arr];
  let r = hashStr(seed || "seed");
  for (let i = a.length - 1; i > 0; i--) {
    r = (r * 1664525 + 1013904223) % 4294967296;
    const j = Math.floor((r / 4294967296) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PrizeCharmCurtain({
  prizes,
  max = 9,
  className,
}: {
  prizes: PrizeLike[];
  max?: number;
  className?: string;
}) {
  const seed = useMemo(
    () => prizes.map((p) => String(p?.id ?? p?.name ?? "")).join("|"),
    [prizes]
  );

  const items = useMemo(() => {
    const chosen = stableShuffle(prizes.filter(Boolean), seed).slice(0, max);
    const n = Math.max(1, chosen.length);

    return chosen.map((p, i) => {
      const id = String(p?.id ?? p?.name ?? i);
      const r = hashStr(id + "|" + seed);

      // distribui da esquerda pra direita com jitter (evita sobreposição)
      const baseX = n === 1 ? 50 : 12 + (i / (n - 1)) * 76; // 12%..88%
      const jitter = (hashStr(id + "x") - 0.5) * 8; // -4..+4
      const x = Math.max(8, Math.min(92, baseX + jitter));

      // alturas e tamanhos variáveis deixam “orgânico”
      const len = 90 + Math.round(r * 160); // 90..250
      const size = 30 + Math.round(hashStr(id + "s") * 22); // 30..52
      const sway = 2.0 + hashStr(id + "sw") * 3.5; // 2..5.5deg
      const dur = 2.8 + hashStr(id + "d") * 2.6; // 2.8..5.4s
      const delay = -(hashStr(id + "dl") * dur);

      // leve variação de opacidade pra dar profundidade (sem blur)
      const alpha = 0.55 + hashStr(id + "a") * 0.35; // 0.55..0.90

      return { prize: p, x, len, size, sway, dur, delay, alpha };
    });
  }, [prizes, seed, max]);

  return (
    <div className={["pointer-events-none absolute inset-0", className].join(" ")}>
      {/* “luz” bem discreta (opcional) */}
      <div className="absolute inset-0 opacity-40 [background:radial-gradient(480px_320px_at_50%_40%,rgba(34,211,238,.10),transparent_60%),radial-gradient(520px_360px_at_50%_70%,rgba(196,113,237,.10),transparent_62%)]" />

      {items.map((it, idx) => (
        <div
          key={`${it.prize?.id ?? idx}`}
          className="absolute top-0"
          style={{ left: `${it.x}%`, opacity: it.alpha }}
        >
          {/* fio + balanço */}
          <div
            className="relative origin-top will-change-transform"
            style={{
              height: it.len,
              animation: `charmSway ${it.dur}s ease-in-out infinite`,
              animationDelay: `${it.delay}s`,
              ["--sway" as any]: `${it.sway}deg`,
            }}
          >
            {/* fio */}
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/18" />

            {/* miçanga */}
            <div className="absolute left-1/2 top-[18px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/35" />

            {/* charm (ícone) */}
            <div
              className="absolute left-1/2 bottom-0 -translate-x-1/2 will-change-transform"
              style={{
                width: it.size + 16,
                height: it.size + 16,
                animation: `charmBob ${Math.max(2.6, it.dur * 0.9)}s ease-in-out infinite`,
                animationDelay: `${it.delay * 0.6}s`,
              }}
            >
              <div className="grid h-full w-full place-items-center rounded-2xl border border-white/14 bg-white/8 shadow-[0_18px_55px_rgba(0,0,0,.55)]">
                <img
                  src={it.prize?.icon || FALLBACK_ICON}
                  alt={it.prize?.name || "Prize"}
                  className="object-contain"
                  style={{
                    width: it.size,
                    height: it.size,
                    filter:
                      "drop-shadow(0 18px 28px rgba(0,0,0,.55)) drop-shadow(0 0 18px rgba(34,211,238,.10))",
                  }}
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <style jsx global>{`
        @keyframes charmSway {
          0%, 100% { transform: rotate(calc(var(--sway) * -1)); }
          50%      { transform: rotate(var(--sway)); }
        }
        @keyframes charmBob {
          0%, 100% { transform: translate(-50%, 0); }
          50%      { transform: translate(-50%, -8px); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  );
}
