"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Andika } from "next/font/google";
import { useWheelGame } from "@/games/core/hooks/useWheel";
import GiftboxChestLottie from "./animation";
// import PrizeCharmCurtain from "./PrizeNebula";

const andika = Andika({ subsets: ["latin"], weight: ["400", "700"] });


const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

const DEFAULT_ICON = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <radialGradient id="g" cx="30%" cy="30%" r="70%">
        <stop offset="0" stop-color="rgba(255,255,255,.75)"/>
        <stop offset="1" stop-color="rgba(18,194,233,.25)"/>
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="22" fill="url(#g)"/>
    <circle cx="32" cy="32" r="10" fill="rgba(196,113,237,.25)"/>
  </svg>
`)}`;

const PrizeItem = ({ prize }: { prize: any }) => (
  <div className="flex h-[86px] w-[128px] flex-col items-center justify-center gap-2 rounded-[14px] border border-white/20 bg-white/10 backdrop-blur-sm p-[10px] shadow-lg select-none">
    <img
      src={prize.icon || DEFAULT_ICON}
      alt={prize.name}
      className="h-[34px] w-[34px] object-contain"
      decoding="async"
    />
    <div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[12px] leading-[1.1] text-white/90">
      {prize.name || "Item"}
    </div>
  </div>
);

export default function GiftboxGame({ smartico, templateId, skin }: any) {
  const gameState = useWheelGame({ smartico, templateId });

  console.log(gameState);

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

  const poolKey = useMemo(
    () => pool.map((p: any) => String(p.id)).join("|"),
    [pool]
  );

  const strip = useMemo(() => {
    if (!pool.length) return [];
    const repeats = Math.max(3, Math.ceil(STRIP_TARGET / pool.length));
    return Array.from({ length: repeats }, () => pool).flat();
  }, [poolKey]);

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
    if (trackRef.current) {
      trackRef.current.style.transform = "translate3d(0px, 0, 0)";
    }

    const result = await gameState.play();

    if (!result) {
      setIsAnimating(false);
      return;
    }

    const prizeId = result?.prize_id != null ? String(result.prize_id) : "";
    const prize = prizeId
      ? pool.find((p: { id: any; }) => String(p.id) === prizeId) || null
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

    
    const kick = getStepPx() * 8; 
    const startX = currentXRef.current;
    await animateTo(startX, startX - kick, 300); 

    
    const toX = getTargetX(targetIndex, currentXRef.current);
    await animateTo(currentXRef.current, toX, 5000); 

    
    await animateTo(currentXRef.current, toX, 300);

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
    
    setTimeout(() => {
      playGame();
    }, 100);
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
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${toX}px, 0, 0)`;
        }
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
    if (lastPrize.prize_type === "no-prize")
      return lastPrize.aknowledge_message || "Quase!";
    return `${lastPrize.aknowledge_message ?? "Parabéns! Você ganhou"} ${
      lastPrize.name
    }`;
  }, [lastPrize]);

  if (gameState.isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="text-lg font-bold text-white">Carregando...</div>
      </div>
    );
  }

  if (gameState.error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="text-lg font-bold text-red-400">{gameState.error}</div>
      </div>
    );
  }

  return (
    <div
      data-skin={skin?.id ?? "default"}
      className={[andika.className, "min-h-screen w-full relative"].join(" ")}
    >
      {/* FASE 1 - Baú flutuando */}
      {phase === "chest" && (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-6">
          {/* <PrizeCharmCurtain prizes={pool} max={9} /> */}

          <div className="text-center">
            {/* Baú com animação de flutuação */}
            <div
              className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
              onClick={handleChestClick}
              style={{
                animation: "float 3s ease-in-out infinite",
              }}
            >
              <GiftboxChestLottie
                path={skin?.lottiePath}
                isOpen={chestOpen}
                onOpenComplete={handleChestOpenComplete}
                className="h-[200px] w-[240px] mx-auto"
              />
            </div>

            {/* Mensagem */}
            <div className="mt-8 text-white">
              {gameState.canPlay ? (
                <div className="text-2xl font-bold">
                  Toque no baú para abrir
                </div>
              ) : gameState.countdown ? (
                <div>
                  <div className="text-lg font-bold mb-2">Próximo giro em:</div>
                  <div className="text-3xl font-black text-cyan-400">
                    {gameState.countdown}
                  </div>
                </div>
              ) : (
                <div className="text-xl font-bold text-red-400">
                  Sem tentativas disponíveis
                </div>
              )}

              {/* Info de tentativas */}
              <div className="mt-6 text-sm text-white/60">
                {gameState.attemptsDisplay.label}:{" "}
                <span className="font-bold text-white">
                  {gameState.attemptsDisplay.value}
                </span>
              </div>
            </div>
          </div>

          {/* CSS para animação de flutuação */}
          <style jsx>{`
            @keyframes float {
              0%,
              100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-20px);
              }
            }
          `}</style>
        </div>
      )}

      {/* FASE 2 - Roleta horizontal */}
      {phase === "wheel" && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
          <div className="w-full max-w-4xl">
            {/* Título */}
            <div className="text-center mb-8">
              <div className="text-2xl font-black text-white mb-2">
                Roleta do Baú
              </div>
              <div className="text-sm text-white/60">
                {isAnimating ? "Girando..." : "A seta indica onde vai parar"}
              </div>
            </div>

            {/* Container da roleta */}
            <div className="relative">
              {/* Seta indicadora */}
              <div className="absolute left-1/2 top-0 bottom-0 z-10 w-1 -translate-x-1/2 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.6)]" />

              {/* Track de prêmios */}
              <div className="relative h-[120px] overflow-hidden rounded-2xl bg-black/40 backdrop-blur-sm border border-white/10">
                <div
                  ref={trackRef}
                  className="absolute left-0 top-[17px] flex gap-3 will-change-transform"
                  style={{
                    transform: `translate3d(${currentX}px, 0, 0)`,
                  }}
                >
                  {strip.map((prize, idx) => (
                    <PrizeItem key={`${prize.id}-${idx}`} prize={prize} />
                  ))}
                </div>
              </div>
            </div>

            {/* Botão girar novamente */}
            {!isAnimating && gameState.canPlay && (
              <div className="mt-8 text-center">
                <button
                  onClick={playGame}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!gameState.canPlay || isAnimating}
                >
                  Girar Novamente
                </button>
                <div className="mt-3 text-sm text-white/60">
                  Giros restantes: {gameState.attemptsDisplay.value}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Prêmio */}
      {showWin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeWin()}
        >
          <div className="relative w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-center shadow-2xl border border-white/10">
            {/* Efeito de brilho */}
            <div className="pointer-events-none absolute -inset-10 opacity-30 blur-3xl bg-gradient-conic from-cyan-500 via-purple-500 to-cyan-500 animate-[spin_8s_linear_infinite]" />

            <div className="relative z-10">
              {/* Título */}
              <div className="mb-6 text-2xl font-black text-white">
                {lastPrize?.prize_type === "no-prize"
                  ? "Quase! 😅"
                  : "Parabéns! 🎉"}
              </div>

              {/* Ícone do prêmio */}
              {lastPrize?.icon && (
                <div className="mb-6">
                  <img
                    src={lastPrize.icon}
                    alt={lastPrize.name}
                    className="h-20 w-20 object-contain mx-auto"
                  />
                </div>
              )}

              {/* Mensagem */}
              <div className="mb-8 text-lg text-white/90 leading-relaxed">
                {prizeLabel}
              </div>

              {/* Botão OK */}
              <button
                onClick={closeWin}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
