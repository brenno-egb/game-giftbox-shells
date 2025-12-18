"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Andika } from "next/font/google";
import { useWheelGame } from "@/games/core/hooks/useWheel";

const andika = Andika({ subsets: ["latin"], weight: ["400", "700"] });

const btnBase =
  "inline-flex items-center justify-center rounded-xl px-3 py-2 font-extrabold transition " +
  "hover:-translate-y-px hover:brightness-[1.02] active:translate-y-0 active:brightness-[.98] " +
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

const btnPrimary =
  btnBase +
  " bg-[linear-gradient(90deg,rgba(18,194,233,.22),rgba(196,113,237,.22))] text-slate-950";
const btnGhost =
  btnBase + " bg-white/70 border border-slate-900/10 text-slate-950";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const DEFAULT_ICON = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http:
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
  <div className="flex h-[86px] w-[128px] flex-col items-center justify-center gap-2 rounded-[14px] border border-slate-900/10 bg-[radial-gradient(90px_60px_at_30%_30%,rgba(255,255,255,.80),rgba(255,255,255,.55))] p-[10px] shadow-[0_14px_30px_rgba(20,25,60,.10)] select-none">
    <img
      src={prize.icon || DEFAULT_ICON}
      alt={prize.name}
      className="h-[34px] w-[34px] object-contain"
      decoding="async"
    />
    <div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[12px] leading-[1.1] text-slate-900/70">
      {prize.name || "Item"}
    </div>
  </div>
);

export default function GiftboxGame({ smartico, templateId, skin }: any) {
  const gameState = useWheelGame({ smartico, templateId });

  const [phase, setPhase] = useState<"intro" | "roll">("intro");
  const [chestOpen, setChestOpen] = useState(false);
  const [targetPrizeIndex, setTargetPrizeIndex] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState(0);
  const [lastPrize, setLastPrize] = useState<any>(null);
  const [showRules, setShowRules] = useState(false);
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
          const eased = easeOutCubic(progress);
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

    setChestOpen(false);
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
      ? pool.find((p) => String(p.id) === prizeId) || null
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

    setChestOpen(true);
    setTargetPrizeIndex(targetIndex);

    const kick = getStepPx() * 6;
    const startX = currentXRef.current;

    await animateTo(startX, startX - kick, 220);

    const toX = getTargetX(targetIndex, currentXRef.current);
    await animateTo(currentXRef.current, toX, 2400);

    setLastPrize(prize);
    setShowWin(true);
    setIsAnimating(false);

    await gameState.refresh();
  }, [gameState, isAnimating, pool, strip, getStepPx, animateTo, getTargetX]);

  const goToRoll = useCallback(() => {
    if (!gameState.canPlay || !gameState.game) return;
    setPhase("roll");
  }, [gameState.canPlay, gameState.game]);

  const goToIntro = useCallback(() => {
    setPhase("intro");
    setChestOpen(false);
    setTargetPrizeIndex(null);
  }, []);

  const closeWin = useCallback(() => {
    setShowWin(false);
    if (lastPrize?.acknowledge_dp && typeof smartico?.dp === "function") {
      try {
        smartico.dp(lastPrize.acknowledge_dp);
      } catch {}
    }
  }, [lastPrize, smartico]);

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
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-lg font-bold">Carregando jogo...</div>
      </div>
    );
  }

  if (gameState.error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-lg font-bold text-red-600">{gameState.error}</div>
      </div>
    );
  }

  return (
    <div
      data-skin={skin?.id ?? "default"}
      className={[
        andika.className,
        "min-h-screen w-full flex items-center justify-center p-[18px] text-slate-950",
        "bg-[radial-gradient(900px_620px_at_20%_10%,rgba(18,194,233,.35),transparent),radial-gradient(900px_620px_at_80%_70%,rgba(196,113,237,.28),transparent),linear-gradient(135deg,#f6fbff,#fff7ff)]",
      ].join(" ")}
    >
      <div className="w-full max-w-[980px]">
        {/* Header */}
        <div className="mb-3">
          <div className="text-[22px] font-extrabold">
            {gameState.game?.name || "Carregando…"}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            {gameState.game?.promo_text || "Preparando o baú"}
          </div>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-[18px] border border-slate-900/10 bg-white/70 shadow-[0_30px_90px_rgba(20,25,60,.18)] backdrop-blur-[10px]">
          {/* HUD */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-900/10 p-3.5">
            <div>
              <div className="text-[13px] leading-[1.35] text-slate-600">
                {phase === "intro"
                  ? "Primeiro: aperte Jogar. Depois: abra o baú na roleta."
                  : "Clique em Abrir Baú para girar e revelar o prêmio."}
              </div>
              <div className="mt-2 text-sm font-extrabold">
                {gameState.statusMessage}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5">
              {/* 🎯 Usar attemptsDisplay do hook */}
              <div className="text-right">
                <div className="text-xs text-slate-600">
                  {gameState.attemptsDisplay.label}
                </div>
                <div
                  className={`text-base font-black ${
                    gameState.attemptsDisplay.valueColor || ""
                  }`}
                >
                  {gameState.attemptsDisplay.value}
                </div>
              </div>

              <button
                className={btnGhost}
                onClick={() => setShowRules(true)}
                disabled={!gameState.game || isAnimating}
                type="button"
              >
                Regras
              </button>
            </div>
          </div>

          {/* Stage */}
          <div className="min-h-[440px] p-3.5">
            {/* FASE 1 - Intro */}
            {phase === "intro" && (
              <div className="flex h-full items-center justify-center">
                <div className="w-full max-w-[520px] rounded-[18px] border border-slate-900/10 bg-white/75 p-4 text-center shadow-[0_20px_70px_rgba(20,25,60,.12)]">
                  <div className="text-lg font-black">
                    Um baú misterioso apareceu…
                  </div>
                  <div className="mt-1.5 text-[13px] text-slate-600">
                    {gameState.canPlay ? (
                      <>
                        Clique em <b>Jogar</b> para revelar a roleta.
                      </>
                    ) : gameState.countdown ? (
                      <>Aguarde {gameState.countdown} para o próximo giro.</>
                    ) : (
                      <>Você não tem tentativas disponíveis no momento.</>
                    )}
                  </div>

                  {/* Chest */}
                  <div
                    className={`relative mx-auto my-3 h-[140px] w-[170px] scale-[1.05] ${
                      chestOpen ? "open" : ""
                    }`}
                    aria-hidden="true"
                  >
                    {/* Lid */}
                    <div
                      className={[
                        "absolute left-0 right-0 top-0 h-[64px] rounded-[18px]",
                        "bg-[linear-gradient(180deg,rgba(18,194,233,.20),rgba(255,255,255,.65))]",
                        "shadow-[inset_0_0_0_1px_rgba(20,25,60,.10)]",
                        "origin-[50%_100%] transition-transform duration-[420ms] ease-out",
                        chestOpen
                          ? "[transform:rotateX(62deg)]"
                          : "[transform:rotateX(0deg)]",
                      ].join(" ")}
                    />
                    {/* Base */}
                    <div className="absolute bottom-0 left-0 right-0 h-[92px] rounded-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,.85),rgba(255,255,255,.65))] shadow-[inset_0_0_0_1px_rgba(20,25,60,.10)]" />
                    {/* Lock */}
                    <div
                      className={`absolute bottom-[30px] left-1/2 h-[46px] w-[46px] -translate-x-1/2 rounded-[14px] shadow-[inset_0_0_0_1px_rgba(20,25,60,.10)] transition-colors ${
                        gameState.canPlay ? "bg-slate-900/5" : "bg-red-500/10"
                      }`}
                    >
                      <div
                        className={`absolute left-1/2 top-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-[6px] transition-all ${
                          gameState.canPlay
                            ? "bg-[rgba(196,113,237,.25)] shadow-[0_0_16px_rgba(196,113,237,.18)]"
                            : "bg-red-500/30 shadow-[0_0_16px_rgba(239,68,68,.15)]"
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    className={btnPrimary + " px-4 py-3 text-[15px]"}
                    onClick={goToRoll}
                    disabled={
                      isAnimating || !gameState.game || !gameState.canPlay
                    }
                    type="button"
                  >
                    {!gameState.canPlay && gameState.countdown
                      ? `Aguarde (${gameState.countdown})`
                      : "Jogar"}
                  </button>

                  <div className="mt-2 text-xs text-slate-600">
                    O resultado final vem do Smartico.
                  </div>
                </div>
              </div>
            )}

            {/* FASE 2 - Roleta */}
            {phase === "roll" && (
              <div className="flex h-full items-center justify-center">
                <div className="relative w-full max-w-190 overflow-hidden rounded-[18px] border border-slate-900/10 bg-white/80 p-3 shadow-[0_20px_70px_rgba(20,25,60,.12)]">
                  <div className="mb-2.5">
                    <div className="text-base font-black">Roleta do Baú</div>
                    <div className="mt-0.5 text-xs text-slate-600">
                      A seta no meio indica onde vai parar.
                    </div>
                  </div>

                  {/* Seta */}
                  <div className="absolute left-1/2 top-12 z-5 h-24 w-0.75 -translate-x-px rounded bg-[rgba(18,194,233,.55)] shadow-[0_0_18px_rgba(18,194,233,.22)]" />

                  {/* Track */}
                  <div className="relative h-[100px] overflow-hidden rounded-[14px] bg-slate-900/5 shadow-[inset_0_0_0_1px_rgba(20,25,60,.08)]">
                    <div
                      ref={trackRef}
                      className="absolute left-0 top-[7px] flex gap-2.5 will-change-transform"
                      style={{
                        transform: `translate3d(${currentX}px, 0, 0)`,
                      }}
                    >
                      {strip.map((prize, idx) => (
                        <PrizeItem key={`${prize.id}-${idx}`} prize={prize} />
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap justify-center gap-2.5">
                    <button
                      className={btnPrimary + " px-4 py-3 text-[15px]"}
                      onClick={playGame}
                      disabled={isAnimating || !gameState.canPlay}
                      type="button"
                    >
                      Abrir Baú
                    </button>

                    <button
                      className={btnGhost}
                      onClick={goToIntro}
                      disabled={isAnimating}
                      type="button"
                    >
                      Voltar
                    </button>
                  </div>

                  <div className="mt-2 text-center text-xs text-slate-600">
                    A roleta é visual — o prêmio é sorteado pelo Smartico.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Regras */}
      {showRules && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowRules(false)}
        >
          <div className="w-full max-w-[560px] rounded-2xl border border-slate-900/10 bg-white/90 p-4 shadow-[0_25px_90px_rgba(20,25,60,.18)]">
            <div className="mb-2.5 text-lg font-black">Regras</div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {`🧰 Baú Giratório

Fluxo:
1) Você clica "Jogar"
2) Abre a roleta e clica "Abrir Baú"
3) O Smartico decide o prêmio (playMiniGame) e a roleta para exatamente nele.

Tentativas: ${gameState.game?.max_number_of_attempts ?? 0} no total${
                gameState.game?.description
                  ? `\n\n(Regras do BackOffice)\n${gameState.game.description}`
                  : ""
              }`}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                className={btnPrimary}
                onClick={() => setShowRules(false)}
                type="button"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Prêmio */}
      {showWin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4"
          onClick={(e) => e.target === e.currentTarget && closeWin()}
        >
          <div className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-slate-900/10 bg-white/90 p-4 text-center shadow-[0_25px_90px_rgba(20,25,60,.18)]">
            <div className="pointer-events-none absolute -inset-20 -z-10 opacity-45 blur-[22px] [background:conic-gradient(from_180deg_at_50%_50%,rgba(18,194,233,.18),rgba(196,113,237,.22),rgba(251,194,235,.18),rgba(18,194,233,.18))] animate-[spin_6s_linear_infinite]" />

            <div className="mb-3 text-lg font-black">
              {lastPrize?.prize_type === "no-prize"
                ? "Quase!"
                : lastPrize
                ? "Você ganhou!"
                : "Resultado"}
            </div>

            <div className="mb-3 flex items-center justify-center gap-2.5">
              {lastPrize?.icon && (
                <img
                  src={lastPrize.icon}
                  alt={lastPrize.name}
                  className="h-11 w-11 object-contain"
                />
              )}
              <div className="max-w-[420px] text-sm leading-snug text-slate-600">
                {prizeLabel}
              </div>
            </div>

            <button className={btnPrimary} onClick={closeWin} type="button">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
