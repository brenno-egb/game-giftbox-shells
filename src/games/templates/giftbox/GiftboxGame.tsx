"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Andika } from "next/font/google";
import { useWheelGame } from "@/games/core/hooks/useWheel";
import GiftboxChestRive from "./animation";
import { runPrizeAcknowledge } from "@/games/core/prize/acknowledge";
import { hostOpenUrl } from "@/games/core/prize/hostBridge";


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
    <div className="flex h-25 w-25 sm:h-19.5 sm:w-30 flex-col items-center justify-center gap-1.5 rounded-xl border border-white/12 bg-black/35 backdrop-blur-[2px] px-2.5 select-none">
      <img
        src={prize.icon || DEFAULT_ICON}
        alt={prize.name}
        className="h-15 w-15 sm:h-7.5 sm:w-7.5 object-contain opacity-95"
        decoding="async"
      />
      <div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[11px] sm:text-[12px] leading-[1.1] text-white/85">
        {prize.name || "Item"}
      </div>
    </div>
  );
}

export default function GiftboxGame({ smartico, templateId, skin }: any) {
  const gameState = useWheelGame({ smartico, templateId });

  const [isShaking, setIsShaking] = useState(false);
  const [chestOpen, setChestOpen] = useState(false);
  const [triggerFinal, setTriggerFinal] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [targetPrizeIndex, setTargetPrizeIndex] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState(0);
  const [lastPrize, setLastPrize] = useState<any>(null);
  const [showPrizeAnnouncement, setShowPrizeAnnouncement] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const currentXRef = useRef<number>(0);

  const pool = useMemo(() => gameState.game?.prizes || [], [gameState.game]);
  const STRIP_TARGET = 200;

  const poolKey = useMemo(
    () => pool.map((p: any) => String(p.id)).join("|"),
    [pool]
  );

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

  const animateTo = useCallback(
    (fromX: number, toX: number, durationMs: number) => {
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
    },
    []
  );

  const playGame = useCallback(async () => {
    if (!gameState.canPlay || gameState.isPlaying || isAnimating) return;

    setIsAnimating(true);

    setTargetPrizeIndex(null);
    setLastPrize(null);
    setCurrentX(0);
    currentXRef.current = 0;

    if (trackRef.current)
      trackRef.current.style.transform = "translate3d(0px, 0, 0)";

    const result = await gameState.play();
    if (!result) {
      setIsAnimating(false);
      return;
    }

    const prizeId = result?.prize_id != null ? String(result.prize_id) : "";
    const prize = prizeId
      ? pool.find((p: any) => String(p.id) === prizeId) || null
      : null;

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

    const kick = getStepPx() * 12;
    const startX = currentXRef.current;

    const toX = getTargetX(targetIndex, currentXRef.current);
    await animateTo(currentXRef.current, toX, 11000);

    setLastPrize(prize);

    setTimeout(() => {
      setTriggerFinal(true);
    }, 200);

    await new Promise((resolve) => setTimeout(resolve, 400));
    setShowPrizeAnnouncement(true);
    setIsAnimating(false);

    await gameState.refresh();
  }, [gameState, isAnimating, pool, strip, getStepPx, animateTo, getTargetX]);

  const handleChestClick = () => {
    if (!gameState.canPlay || isAnimating || chestOpen) return;

    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setChestOpen(true);
    }, 600);
  };

  const handleChestOpenStart = () => {};

  const handleChestOpenPeak = () => {
    setShowWheel(true);

    setTimeout(() => {
      playGame();
    }, 100);
  };

  const closePrizeAnnouncement = useCallback(() => {
    setShowPrizeAnnouncement(false);

    // if (lastPrize?.acknowledge_dp && typeof smartico?.dp === "function") {
    //   try {
    //     smartico.dp(lastPrize.acknowledge_dp);
    //   } catch {}
    // }

    if (lastPrize) {
      runPrizeAcknowledge({
        prize: lastPrize,
        smartico,
        hostOpenUrl,
      });
    }

    setTriggerFinal(true);
    setIsCompactMode(true);

    setTimeout(() => {
      if (!gameState.canPlay) {
        setChestOpen(false);
        setShowWheel(false);

        setTargetPrizeIndex(null);
        setLastPrize(null);
        setTriggerFinal(false);
        setIsCompactMode(false);
      }
    }, 1000);
  }, [lastPrize, smartico, gameState.canPlay]);

  useEffect(() => {
    if (!trackRef.current || targetPrizeIndex === null || isAnimating) return;

    const handleResize = () => {
      if (!isAnimating && targetPrizeIndex !== null) {
        const toX = getTargetX(targetPrizeIndex, currentXRef.current);
        currentXRef.current = toX;
        setCurrentX(toX);
        if (trackRef.current)
          trackRef.current.style.transform = `translate3d(${toX}px, 0, 0)`;
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
    if (lastPrize.prize_type === "no-prize") return msg || "Quase lá!";
    return `${msg ?? "Você ganhou"} ${lastPrize.name ?? ""}`.trim();
  }, [lastPrize]);

  if (gameState.isLoading) {
    return (
      <div
        className={[
          andika.className,
          "min-h-screen w-full flex items-center justify-center",
        ].join(" ")}
      >
        <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white/85 backdrop-blur-[2px]">
          Carregando...
        </div>
      </div>
    );
  }

  if (gameState.error) {
    return (
      <div
        className={[
          andika.className,
          "min-h-screen w-full flex items-center justify-center",
        ].join(" ")}
      >
        <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-red-300 backdrop-blur-[2px]">
          {gameState.error}
        </div>
      </div>
    );
  }

  const chestPath = skin?.rivePath ?? skin?.lottiePath;

  const bgUrl = skin?.background
    ? `${skin.assetsBase}/${skin.background}`
    : null;

  const rootStyle = {
    backgroundImage: bgUrl ? `url('${bgUrl}')` : undefined,
    backgroundColor: skin?.backgroundColor ?? "#07080c",
  } as React.CSSProperties;

  return (
    <div
      data-skin={skin?.id ?? "default"}
      style={rootStyle}
      className={[
        andika.className,
        "min-h-screen w-full relative text-white overflow-hidden bg-center bg-cover bg-no-repeat",
      ].join(" ")}
    >
      {/* Glow quando abre */}
      {chestOpen && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 70%, rgba(255,215,0,0.15) 0%, transparent 50%)",
            animation: "pulse-glow 2s ease-in-out infinite",
          }}
        />
      )}

      {/* Container principal - Layout vertical otimizado */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 gap-3">
        {/* 1. ROLETA NO TOPO */}
        {showWheel && (
          <div
            className="w-full max-w-4xl animate-slide-up-fade shrink-0"
            style={{
              animation:
                "slide-up-fade 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            <div className="text-center mb-3">
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-semibold">
                SORTEANDO
              </div>
              <div className="mt-0.5 text-base font-bold text-white/90">
                {isAnimating ? "Girando..." : "Resultado"}
              </div>
            </div>

            <div className="relative">
              {/* Linha indicadora */}
              <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
                <img src="/games/giftbox/pointer.webp" className="h-10 w-7" />
              </div>
              <div className="absolute left-1/2 top-0 bottom-0 z-10 w-0.5 -translate-x-1/2 bg-linear-to-b from-white/60 via-white/40 to-transparent opacity-60" />

              {/* Container da roleta */}
              <div className="relative h-31.5 sm:h-27.5 overflow-hidden rounded-lg border border-white/15 bg-black/45 backdrop-blur-xs shadow-[0_0_30px_rgba(0,0,0,0.25)]">
                <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-black/60 to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-black/60 to-transparent" />

                <div
                  ref={trackRef}
                  className="absolute left-0 top-3 sm:top-4 flex gap-2.5 sm:gap-3 will-change-transform"
                  style={{ transform: `translate3d(${currentX}px, 0, 0)` }}
                >
                  {strip.map((prize, idx) => (
                    <PrizeItem key={`${prize.id}-${idx}`} prize={prize} />
                  ))}
                </div>
              </div>
            </div>

            {/* Botão girar novamente */}
            {!isAnimating && gameState.canPlay && !showPrizeAnnouncement && (
              <div className="mt-4 flex flex-col items-center gap-2 animate-fade-in">
                <button
                  onClick={playGame}
                  className="rounded-xl border-2 border-white/15 bg-white/10 px-6 py-2.5 text-sm font-bold text-white/90 backdrop-blur-[2px] transition hover:bg-white/15 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-white/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,0,0,0.25)]"
                  disabled={!gameState.canPlay || isAnimating}
                >
                  Girar novamente
                </button>
                <div className="text-[11px] text-white/60 tabular-nums">
                  Giros restantes:{" "}
                  <span className="text-white/90 font-semibold">
                    {gameState.attemptsDisplay.value}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. ANÚNCIO DE PRÊMIO - COMPACTO */}
        {showPrizeAnnouncement && lastPrize && (
          <div className="w-full max-w-md animate-bounce-in z-40 shrink-0">
            <div className="relative overflow-hidden rounded-lg border border-white/15 bg-black/50 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.25)]">
              {/* fundo sutil */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.10) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.06) 0%, transparent 55%)",
                }}
              />

              <div className="relative flex min-h-25">
                <div className="relative w-30 shrink-0">
                  <div className="absolute inset-0">
                    <div className="absolute -inset-6 bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_60%)]" />
                  </div>

                  <div className="relative h-full w-full flex items-center justify-center p-3">
                    <img
                      src={lastPrize?.icon || DEFAULT_ICON}
                      alt={lastPrize?.name || "Prêmio"}
                      className="h-full w-full object-contain"
                      decoding="async"
                    />
                  </div>

                  {/* divisor */}
                  <div className="absolute right-0 top-3 bottom-3 w-px bg-white/10" />
                </div>

                {/* Coluna direita - texto + ações */}
                <div className="flex flex-1 flex-col justify-between p-1 pl-3 text-left">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/55 font-semibold">
                      prêmio
                    </div>

                    <div className="mt-1 text-[15px] font-extrabold leading-snug text-white/95">
                      {lastPrize?.name ?? "Você ganhou!"}
                    </div>

                    <div className="mt-1 text-[12px] leading-snug text-white/75">
                      {prizeLabel}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-white/45 tabular-nums">
                      {/* opcional: dá pra por tentativas aqui se quiser */}
                    </div>

                    <button
                      onClick={closePrizeAnnouncement}
                      className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white/90 backdrop-blur-[2px] transition hover:bg-white/15 active:scale-[0.98] focus-visible:outline focus-visible:outline-white/30 shadow-[0_0_20px_rgba(0,0,0,0.25)]"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. BAÚ EMBAIXO - TAMANHO VARIÁVEL */}
        <div
          className={`relative z-30 shrink-0 transition-all duration-500 ${
            isCompactMode ? "scale-100" : "scale-100"
          }`}
        >
          <button
            type="button"
            onClick={handleChestClick}
            className={`group cursor-pointer outline-none transition-transform duration-200 ${
              isShaking ? "animate-shake" : ""
            }`}
            aria-label="Abrir baú"
            disabled={!gameState.canPlay || isAnimating || chestOpen}
            style={{
              animation:
                !chestOpen && !isShaking
                  ? "float 3.2s ease-in-out infinite"
                  : undefined,
              transform: chestOpen ? "scale(1.05)" : undefined,
            }}
          >
            <div
              className={`transition-all duration-300 ${
                !chestOpen
                  ? "group-hover:scale-[1.05] group-active:scale-[0.97]"
                  : ""
              }`}
            >
              <GiftboxChestRive
                path={chestPath}
                isOpen={chestOpen}
                triggerFinal={triggerFinal}
                onOpenStart={handleChestOpenStart}
                onOpenPeak={handleChestOpenPeak}
                onOpenComplete={() => {}}
                className="h-60.5 w-60.5 mx-auto"
              />
            </div>
          </button>

          {/* Texto abaixo do baú - só quando não tem roleta */}
          {!showWheel && (
            <div className="mt-4 text-center">
              {gameState.canPlay ? (
                <>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-semibold">
                    {isShaking ? "PREPARANDO" : "PRONTO"}
                  </div>
                  <div className="mt-1.5 text-lg font-bold text-white/90 animate-fade-in">
                    Toque no baú
                  </div>
                </>
              ) : gameState.countdown ? (
                <>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-semibold">
                    PRÓXIMO GIRO
                  </div>
                  <div className="mt-1.5 text-xl font-black text-white/90 tabular-nums">
                    {gameState.countdown}
                  </div>
                </>
              ) : (
                <div className="text-base font-semibold text-white/70">
                  Sem tentativas
                </div>
              )}

              <div className="mt-12 text-[15px] text-white/60">
                {gameState.attemptsDisplay.label}:{" "}
                <span className="font-semibold text-white/90 tabular-nums">
                  {gameState.attemptsDisplay.value}
                </span>
              </div>
            </div>
          )}
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

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0) rotate(0deg);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-8px) rotate(-2deg);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(8px) rotate(2deg);
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes slide-up-fade {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fade-in {
          from {
            scale: 1;
          }
          to {
            scale: 1.2;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes particle-burst {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx), var(--ty)) scale(0);
          }
        }

        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }

        .animate-fade-in {
          animation: fade-in 1s infinite alternate;
        }

        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-slide-up-fade {
          animation: slide-up-fade 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
