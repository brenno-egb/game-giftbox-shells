"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Rubik } from "next/font/google";
import { useWheelGame } from "@/@sdk/smartico";
import GiftboxChestRive from "./animation";
import { runPrizeAcknowledge } from "@/@sdk/smartico/domain/acknowledge";
import { HostBridge } from "@/@sdk/smartico/messaging/hostBridge";

import LoadingScreen from "@/components/games/giftbox/LoadingScreen";
import { ErrorState } from "@/components/games/giftbox/shared/StateComponents";

import { PrizeItem, PrizeAnnouncement } from "./PrizeComponents";

import {
  WHEEL_CONFIG,
  CHEST_CONFIG,
  DEFAULT_BACKGROUND,
  easeOutQuint,
  calculateTargetX,
} from "./config";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// ========================================
// TIPOS
// ========================================

interface GiftboxGameProps {
  smartico: any;
  templateId: number | string;
  skin: any;
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function GiftboxGame({
  smartico,
  templateId,
  skin,
}: GiftboxGameProps) {
  // ========================================
  // HOOKS E STATE
  // ========================================

  const gameState = useWheelGame({ smartico, templateId });

  // Estados do baú
  const [isShaking, setIsShaking] = useState(false);
  const [chestOpen, setChestOpen] = useState(false);
  const [triggerFinal, setTriggerFinal] = useState(false);

  // Estados da roleta
  const [showWheel, setShowWheel] = useState(false);
  const [targetPrizeIndex, setTargetPrizeIndex] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState(0);

  // Estados do prêmio
  const [lastPrize, setLastPrize] = useState<any>(null);
  const [showPrizeAnnouncement, setShowPrizeAnnouncement] = useState(false);

  // Estados de controle
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);

  // Refs
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const currentXRef = useRef<number>(0);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const pool = useMemo(() => gameState.game?.prizes || [], [gameState.game]);

  const poolKey = useMemo(
    () => pool.map((p: any) => String(p.id)).join("|"),
    [pool]
  );

  // Cria strip de prêmios (array longo para roleta)
  const strip = useMemo(() => {
    if (!pool.length) return [];
    const repeats = Math.max(3, Math.ceil(WHEEL_CONFIG.STRIP_SIZE / pool.length));
    return Array.from({ length: repeats }, () => pool).flat();
  }, [poolKey, pool.length]);

  // Cor do glow baseada no tema
  const themeGlowColor = skin?.theme?.panelBorder ?? "#00000060";

  // Background do jogo
  const bgUrl = skin?.background
    ? `${skin.assetsBase}/${skin.background}`
    : null;

  const rootStyle = {
    backgroundImage: bgUrl ? `url('${bgUrl}')` : undefined,
    backgroundColor: skin?.backgroundColor ?? DEFAULT_BACKGROUND.COLOR,
  } as React.CSSProperties;

  // ========================================
  // FUNÇÕES DE ANIMAÇÃO
  // ========================================

  /**
   * Anima a roleta de uma posição X para outra
   */
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

  // ========================================
  // FUNÇÕES DE JOGO
  // ========================================

  /**
   * Executa uma jogada
   */
  const playGame = useCallback(async () => {
    if (!gameState.canPlay || gameState.isPlaying || isAnimating) return;

    setIsAnimating(true);

    // Reset state
    setTargetPrizeIndex(null);
    setLastPrize(null);
    setCurrentX(0);
    currentXRef.current = 0;

    if (trackRef.current) {
      trackRef.current.style.transform = "translate3d(0px, 0, 0)";
    }

    // Chama API de jogo
    const result = await gameState.play();
    if (!result) {
      setIsAnimating(false);
      return;
    }

    // Encontra prêmio ganho
    const prizeId = result?.prize_id != null ? String(result.prize_id) : "";
    const prize = prizeId
      ? pool.find((p: any) => String(p.id) === prizeId) || null
      : null;

    // Encontra índice alvo na strip
    const startIndex = Math.floor(strip.length * WHEEL_CONFIG.START_POSITION_RATIO);
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

    // Anima roleta
    const toX = calculateTargetX(trackRef.current, targetIndex, currentXRef.current);
    await animateTo(currentXRef.current, toX, WHEEL_CONFIG.ANIMATION_DURATION_MS);

    // Mostra resultado
    setLastPrize(prize);

    setTimeout(() => {
      setTriggerFinal(true);
    }, CHEST_CONFIG.ANNOUNCEMENT_DELAY_MS);

    await new Promise((resolve) => setTimeout(resolve, 400));
    setShowPrizeAnnouncement(true);
    setIsAnimating(false);

    // Atualiza estado do jogo
    await gameState.refresh();
  }, [gameState, isAnimating, pool, strip, animateTo]);

  /**
   * Clique no baú
   */
  const handleChestClick = () => {
    if (!gameState.canPlay || isAnimating || chestOpen) return;

    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setChestOpen(true);
    }, CHEST_CONFIG.SHAKE_DURATION_MS);
  };

  /**
   * Baú começou a abrir
   */
  const handleChestOpenStart = () => {};

  /**
   * Baú no pico da abertura
   */
  const handleChestOpenPeak = () => {
    setShowWheel(true);
    setTimeout(() => {
      playGame();
    }, CHEST_CONFIG.OPEN_DELAY_MS);
  };

  /**
   * Fecha anúncio de prêmio
   */
  const closePrizeAnnouncement = useCallback(() => {
    setShowPrizeAnnouncement(false);

    // Processa acknowledge do prêmio
    if (lastPrize) {
      runPrizeAcknowledge(
        lastPrize,
        {
          smartico,
          redirect: (url, mode) => HostBridge.redirect(url, mode),
        },
        { redirectMode: "assign" }
      );
    }

    setTriggerFinal(true);
    setIsCompactMode(true);

    // Reset se não puder jogar mais
    setTimeout(() => {
      if (!gameState.canPlay) {
        setChestOpen(false);
        setShowWheel(false);
        setTargetPrizeIndex(null);
        setLastPrize(null);
        setTriggerFinal(false);
        setIsCompactMode(false);
      }
    }, CHEST_CONFIG.POST_ANNOUNCEMENT_DELAY_MS);
  }, [lastPrize, smartico, gameState.canPlay]);

  // ========================================
  // EFFECTS
  // ========================================

  /**
   * Recalcula posição ao redimensionar
   */
  useEffect(() => {
    if (!trackRef.current || targetPrizeIndex === null || isAnimating) return;

    const handleResize = () => {
      if (!isAnimating && targetPrizeIndex !== null) {
        const toX = calculateTargetX(
          trackRef.current,
          targetPrizeIndex,
          currentXRef.current
        );
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
  }, [targetPrizeIndex, isAnimating]);

  /**
   * Cleanup animation frame
   */
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ========================================
  // RENDER STATES
  // ========================================

  // ✅ Loading State (usando componente compartilhado)
  if (gameState.isLoading) {
    return (
      <LoadingScreen
        message="Construindo cenário"
        backgroundImage={DEFAULT_BACKGROUND.IMAGE}
      />
    );
  }

  // ✅ Error State (usando componente compartilhado)
  if (gameState.error) {
    return <ErrorState message={gameState.error} />;
  }

  // ========================================
  // RENDER PRINCIPAL
  // ========================================

  const chestPath = skin?.rivePath ?? skin?.lottiePath;

  return (
    <div
      data-skin={skin?.id ?? "default"}
      style={rootStyle}
      className={`${rubik.className} min-h-screen relative text-white overflow-hidden bg-center bg-cover bg-no-repeat`}
    >
      {/* Glow Overlay quando abre */}
      {chestOpen && (
        <div
          className="absolute inset-0 pointer-events-none animate-pulse-glow"
          style={{
            background:
              "radial-gradient(circle at 50% 70%, rgba(255,215,0,0.15) 0%, transparent 50%)",
          }}
        />
      )}

      {/* Container principal */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 gap-3 pt-10">
        {/* Gradientes laterais */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-linear-to-r from-black/70 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-linear-to-l from-black/70 to-transparent z-10" />

        {/* ROLETA */}
        {showWheel && (
          <div className="w-full max-w-4xl animate-slide-up-fade shrink-0 z-50">
            {/* Header da roleta */}
            <div className="text-center mb-3">
              <div className="mt-0.5 text-2xl font-black text-white uppercase"
              style={{
                textShadow: "2px 2px 0 black",
                WebkitTextStroke: "1px dark-gray",
              }}
              >
                {isAnimating ? "Girando..." : "Resultado"}
              </div>
            </div>

            {/* Container da roleta */}
            <div className="relative">
              {/* Pointer indicador */}
              <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-2">
                <img
                  src="/games/giftbox/pointer.png"
                  alt="Pointer"
                  className="h-10 w-7"
                />
              </div>
              <div className="absolute left-1/2 top-0 bottom-0 z-10 w-0.5 -translate-x-1/2 bg-linear-to-b from-white/60 via-white/40 to-transparent opacity-60" />

              {/* Track da roleta */}
              <div className="relative h-36 overflow-hidden rounded-lg border border-white/15 bg-black/45 backdrop-blur-xs shadow-[0_0_30px_rgba(0,0,0,0.25)]">
                <div
                  ref={trackRef}
                  className="absolute left-0 top-0 flex items-center h-full will-change-transform"
                  style={{ transform: `translate3d(${currentX}px, 0, 0)` }}
                >
                  {strip.map((prize, idx) => (
                    <PrizeItem
                      key={`${prize.id}-${idx}`}
                      prize={prize}
                      isTarget={idx === targetPrizeIndex}
                    />
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
                  Tentativas restantes:{" "}
                  <span className="text-white/90 font-semibold">
                    {gameState.attemptsDisplay.value}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANÚNCIO DE PRÊMIO */}
        {showPrizeAnnouncement && lastPrize && (
          <PrizeAnnouncement
            prize={lastPrize}
            onClose={closePrizeAnnouncement}
          />
        )}

        {/* BAÚ */}
        <div
          className={`relative z-30 shrink-0 transition-all duration-500 ${
            isCompactMode ? "scale-90" : "scale-100"
          }`}
        >
          {/* Glow atrás do baú */}
          <div
            className="absolute top-1/3 left-1/2 w-80 h-80 pointer-events-none -z-10 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"
            style={{
              background: `radial-gradient(circle, ${themeGlowColor} 30%, transparent 100%)`,
              filter: "blur(40px)",
              opacity: 0.6,
            }}
          />

          <button
            type="button"
            onClick={handleChestClick}
            className={`group cursor-pointer outline-none transition-transform duration-200 ${
              isShaking ? "animate-shake" : ""
            } ${!chestOpen && !isShaking ? "animate-float" : ""}`}
            aria-label="Abrir baú"
            disabled={!gameState.canPlay || isAnimating || chestOpen}
            style={{
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

          {/* Texto abaixo do baú */}
          {!showWheel && (
            <div className="mt-4 text-center">
              {gameState.canPlay ? (
                <>
                  <div
                    className="mt-1.5 text-2xl font-black text-white/90 animate-fade-in uppercase"
                    style={{
                      textShadow: "2px 2px 0 black",
                      WebkitTextStroke: "1px black",
                    }}
                  >
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
                <div
                  className="mt-1.5 text-2xl font-black text-white/90 uppercase"
                  style={{
                    textShadow: "2px 2px 0 black",
                    WebkitTextStroke: "1px black",
                  }}
                >
                  Sem tentativas
                </div>
              )}

              <div className="mt-12 font-bold text-lg text-black">
                {gameState.attemptsDisplay.label}:{" "}
                <span className="font-bold text-black tabular-nums">
                  {gameState.attemptsDisplay.value}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}