"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Andika } from "next/font/google";
import { useWheelGame } from "@/games/core/hooks/useWheel";
import GiftboxChestLottie from "./animation";

const andika = Andika({ subsets: ["latin"], weight: ["400", "700"] });

const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

const DEFAULT_ICON = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <radialGradient id="g" cx="30%" cy="30%" r="70%">
        <stop offset="0" stop-color="rgba(255,255,255,.75)"/>
        <stop offset="1" stop-color="rgba(255,255,255,.10)"/>
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="22" fill="url(#g)"/>
    <circle cx="32" cy="32" r="10" fill="rgba(255,255,255,.12)"/>
  </svg>
`)}`;

function PrizeItem({ prize }: { prize: any }) {
  return (
    <div className="flex h-[78px] w-[120px] flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/25 backdrop-blur-[2px] px-3 select-none">
      <img
        src={prize.icon || DEFAULT_ICON}
        alt={prize.name}
        className="h-[30px] w-[30px] object-contain opacity-95"
        decoding="async"
      />
      <div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[12px] leading-[1.1] text-white/85">
        {prize.name || "Item"}
      </div>
    </div>
  );
}

export default function GiftboxGame({ smartico, templateId, skin }: any) {
  const gameState = useWheelGame({ smartico, templateId });

  const [phase, setPhase] = useState<"chest" | "wheel">("chest");
  const [chestOpen, setChestOpen] = useState(false);
  const [targetPrizeIndex, setTargetPrizeIndex] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState(0);
  const [lastPrize, setLastPrize] = useState<any>(null);
  const [showWin, setShowWin] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const currentXRef = useRef<number>(0);

  const pool = useMemo(() => gameState.game?.prizes || [], [gameState.game]);
  const STRIP_TARGET = 140;

  const poolKey = useMemo(() => pool.map((p: any) => String(p.id)).join("|"), [pool]);

  const strip = useMemo(() => {
    if (!pool.length) return [];
    const repeats = Math.max(3, Math.ceil(STRIP_TARGET / pool.length));
    return Array.from({ length: repeats }, () => pool).flat();
  }, [poolKey, pool.length]);

  const getStepPx = useCallback(() => {
    if (!trackRef.current) return 140;
    const items = trackRef.current.children;
    if (items.length < 2) return 140;
    const a = items[0] as HTMLElement;
    const b = items[1] as HTMLElement;
    return b.offsetLeft - a.offsetLeft;
  }, []);

  const getTargetX = useCallback((index: number, xPosition: number) => {
    if (!trackRef.current) return 0;
    const viewport = trackRef.current.parentElement;
    const item = trackRef.current.children[index] as HTMLElement;
    if (!viewport || !item) return xPosition;

    const viewportCenter = viewport.clientWidth / 2;
    const itemCenter = item.offsetLeft + item.offsetWidth / 2;
    return Math.round(viewportCenter - itemCenter);
  }, []);

  const animateTo = useCallback((fromX: number, toX: number, durationMs: number) => {
    return new Promise<void>((resolve) => {
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const eased = easeOutQuint(progress);
        const newX = fromX + (toX - fromX) * eased;

        currentXRef.current = newX;

        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${newX}px, 0, 0)`;
        }

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setCurrentX(newX);
          resolve();
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    });
  }, []);

  const playGame = useCallback(async () => {
    if (!gameState.canPlay || gameState.isPlaying || isAnimating) return;

    setIsAnimating(true);

    setTargetPrizeIndex(null);
    setLastPrize(null);
    setCurrentX(0);
    currentXRef.current = 0;

    if (trackRef.current) trackRef.current.style.transform = "translate3d(0px, 0, 0)";

    const result = await gameState.play();
    if (!result) {
      setIsAnimating(false);
      return;
    }

    const prizeId = result?.prize_id != null ? String(result.prize_id) : "";
    const prize = prizeId ? pool.find((p: any) => String(p.id) === prizeId) || null : null;

    const startIndex = Math.floor(strip.length * 0.65);
    let targetIndex = startIndex;

    if (prizeId) {
      for (let i = startIndex; i < strip.length; i++) {
        if (String(strip[i]?.id) === prizeId) {
          targetIndex = i;
          break;
        }
      }
    }

    setTargetPrizeIndex(targetIndex);

    const kick = getStepPx() * 8;
    const startX = currentXRef.current;

    await animateTo(startX, startX - kick, 260);
    const toX = getTargetX(targetIndex, currentXRef.current);
    await animateTo(currentXRef.current, toX, 4600);
    await animateTo(currentXRef.current, toX, 220);

    setLastPrize(prize);
    setShowWin(true);
    setIsAnimating(false);

    await gameState.refresh();
  }, [gameState, isAnimating, pool, strip, getStepPx, animateTo, getTargetX]);

  const handleChestClick = () => {
    if (!gameState.canPlay || isAnimating || chestOpen) return;
    setChestOpen(true);
  };

  const handleChestOpenComplete = () => {
    setPhase("wheel");
    setTimeout(() => playGame(), 100);
  };

  const closeWin = useCallback(() => {
    setShowWin(false);

    if (lastPrize?.acknowledge_dp && typeof smartico?.dp === "function") {
      try {
        smartico.dp(lastPrize.acknowledge_dp);
      } catch {}
    }

    if (!gameState.canPlay) {
      setPhase("chest");
      setChestOpen(false);
    }
  }, [lastPrize, smartico, gameState.canPlay]);

  useEffect(() => {
    if (!trackRef.current || targetPrizeIndex === null || isAnimating) return;

    const handleResize = () => {
      if (!isAnimating && targetPrizeIndex !== null) {
        const toX = getTargetX(targetPrizeIndex, currentXRef.current);
        currentXRef.current = toX;
        setCurrentX(toX);
        if (trackRef.current) trackRef.current.style.transform = `translate3d(${toX}px, 0, 0)`;
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    const viewport = trackRef.current.parentElement;

    if (viewport) resizeObserver.observe(viewport);
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [targetPrizeIndex, isAnimating, getTargetX]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const prizeLabel = useMemo(() => {
    if (!lastPrize) return "Jogada concluída.";
    const msg = lastPrize.acknowledge_message ?? lastPrize.aknowledge_message;
    if (lastPrize.prize_type === "no-prize") return msg || "Quase!";
    return `${msg ?? "Parabéns! Você ganhou"} ${lastPrize.name ?? ""}`.trim();
  }, [lastPrize]);

  if (gameState.isLoading) {
    return (
      <div className={[andika.className, "min-h-screen w-full flex items-center justify-center"].join(" ")}>
        <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white/85 backdrop-blur-[2px]">
          Carregando…
        </div>
      </div>
    );
  }

  if (gameState.error) {
    return (
      <div className={[andika.className, "min-h-screen w-full flex items-center justify-center"].join(" ")}>
        <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-red-300 backdrop-blur-[2px]">
          {gameState.error}
        </div>
      </div>
    );
  }

  return (
    <div data-skin={skin?.id ?? "default"} className={[andika.className, "min-h-screen w-full relative text-white"].join(" ")}>
      {/* FASE 1 - Baú */}
      {phase === "chest" && (
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-6">
          <div className="text-center">
            <button
              type="button"
              onClick={handleChestClick}
              className="group cursor-pointer outline-none"
              aria-label="Abrir baú"
              style={{ animation: "float 3.2s ease-in-out infinite" }}
              disabled={!gameState.canPlay || isAnimating || chestOpen}
            >
              <div className="transition-transform duration-200 group-hover:scale-[1.03] group-active:scale-[0.98]">
                <GiftboxChestLottie
                  path={skin?.lottiePath}
                  isOpen={chestOpen}
                  onOpenComplete={handleChestOpenComplete}
                  className="h-[190px] w-[230px] mx-auto"
                />
              </div>
            </button>

            <div className="mt-8">
              {gameState.canPlay ? (
                <>
                  <div className="text-[13px] uppercase tracking-[0.18em] text-white/55">Pronto</div>
                  <div className="mt-2 text-xl font-bold text-white/90">Toque no baú</div>
                </>
              ) : gameState.countdown ? (
                <>
                  <div className="text-[13px] uppercase tracking-[0.18em] text-white/55">Próximo giro</div>
                  <div className="mt-2 text-2xl font-black text-white/90 tabular-nums">{gameState.countdown}</div>
                </>
              ) : (
                <div className="text-lg font-semibold text-white/70">Sem tentativas</div>
              )}

              <div className="mt-6 text-xs text-white/55">
                {gameState.attemptsDisplay.label}:{" "}
                <span className="font-semibold text-white/85 tabular-nums">{gameState.attemptsDisplay.value}</span>
              </div>
            </div>

            <style jsx>{`
              @keyframes float {
                0%,
                100% {
                  transform: translateY(0px);
                }
                50% {
                  transform: translateY(-14px);
                }
              }
            `}</style>
          </div>
        </div>
      )}

      {/* FASE 2 - Roleta */}
      {phase === "wheel" && (
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-6">
          <div className="w-full max-w-4xl">
            <div className="text-center mb-7">
              <div className="text-[13px] uppercase tracking-[0.18em] text-white/55">Roleta</div>
              <div className="mt-2 text-xl font-bold text-white/90">
                {isAnimating ? "Girando…" : "A linha marca o resultado"}
              </div>
            </div>

            <div className="relative">
              {/* Marcador central minimalista */}
              <div className="absolute left-1/2 top-[-8px] z-20 -translate-x-1/2">
                <div className="h-0 w-0 border-l-[7px] border-r-[7px] border-b-[10px] border-l-transparent border-r-transparent border-b-white/70" />
              </div>
              <div className="absolute left-1/2 top-0 bottom-0 z-10 w-[1px] -translate-x-1/2 bg-white/40" />

              {/* Track */}
              <div className="relative h-[110px] overflow-hidden rounded-2xl border border-white/10 bg-black/25 backdrop-blur-[2px]">
                <div
                  ref={trackRef}
                  className="absolute left-0 top-[16px] flex gap-3 will-change-transform"
                  style={{ transform: `translate3d(${currentX}px, 0, 0)` }}
                >
                  {strip.map((prize, idx) => (
                    <PrizeItem key={`${prize.id}-${idx}`} prize={prize} />
                  ))}
                </div>
              </div>
            </div>

            {!isAnimating && gameState.canPlay && (
              <div className="mt-8 flex flex-col items-center gap-3">
                <button
                  onClick={playGame}
                  className="rounded-2xl border border-white/12 bg-white/10 px-7 py-3 text-sm font-semibold text-white/90 backdrop-blur-[2px] transition hover:bg-white/12 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!gameState.canPlay || isAnimating}
                >
                  Girar novamente
                </button>
                <div className="text-xs text-white/55 tabular-nums">
                  Giros restantes: <span className="text-white/80 font-semibold">{gameState.attemptsDisplay.value}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Prêmio */}
      {showWin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-[2px]"
          onClick={(e) => e.target === e.currentTarget && closeWin()}
        >
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/45 p-7 text-center shadow-[0_18px_60px_rgba(0,0,0,.55)]">
            <div className="text-[13px] uppercase tracking-[0.18em] text-white/55">
              {lastPrize?.prize_type === "no-prize" ? "Quase" : "Você ganhou"}
            </div>

            <div className="mt-2 text-2xl font-black text-white/90">
              {lastPrize?.prize_type === "no-prize" ? "😅" : "🎉"}
            </div>

            {(lastPrize?.icon || DEFAULT_ICON) && (
              <div className="mt-5">
                <img
                  src={lastPrize?.icon || DEFAULT_ICON}
                  alt={lastPrize?.name || "Prêmio"}
                  className="h-16 w-16 object-contain mx-auto opacity-95"
                />
              </div>
            )}

            <div className="mt-5 text-[15px] leading-relaxed text-white/85">{prizeLabel}</div>

            <button
              onClick={closeWin}
              className="mt-7 inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-[2px] transition hover:bg-white/12 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/30"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
