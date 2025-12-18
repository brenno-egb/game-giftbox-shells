"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Andika } from "next/font/google";

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
  <div className="flex h-[86px] w-[128px] flex-col items-center justify-center gap-2 rounded-[14px] border border-slate-900/10 bg-[radial-gradient(90px_60px_at_30%_30%,rgba(255,255,255,.80),rgba(255,255,255,.55))] p-[10px] shadow-[0_14px_30px_rgba(20,25,60,.10)] select-none">
    <img
      src={prize.icon || DEFAULT_ICON}
      alt={prize.name}
      className="h-[34px] w-[34px] object-contain drop-shadow-[0_10px_16px_rgba(20,25,60,.16)]"
      decoding="async"
    />
    <div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[12px] leading-[1.1] text-slate-900/70">
      {prize.name || "Item"}
    </div>
  </div>
);

export default function GiftboxGame({ smartico, templateId, skin }: any) {
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [playerInfo, setPlayerInfo] = useState<any>(null);
  const [pool, setPool] = useState<any[]>([]);

  const [phase, setPhase] = useState<"intro" | "roll">("intro");
  const [playing, setPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [chestOpen, setChestOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Carregando…");

  const [targetPrizeIndex, setTargetPrizeIndex] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState(0);
  const [lastPrize, setLastPrize] = useState<any>(null);

  const [showRules, setShowRules] = useState(false);
  const [showWin, setShowWin] = useState(false);

  // Countdown state
  const [countdown, setCountdown] = useState<string | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const strip = useMemo(() => Array(12).fill(pool).flat(), [pool]);

  // Formatar countdown
  const formatCountdown = useCallback((ms: number) => {
    if (ms <= 0) return null;
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  // Verificar se pode jogar
  const checkCanPlay = useCallback((game: any, info: any) => {
    console.log(game)
    if (!game) return false;

    // Verificar período ativo
    const now = Date.now();
    if (game.activeFromDate && now < game.activeFromDate) return false;
    if (game.activeTillDate && now > game.activeTillDate) return false;

    // Verificar se há próximo spin disponível
    if (game.next_available_spin_ts) {
      const nextAvailable = game.next_available_spin_ts;
      if (now < nextAvailable) return false;
    }

    switch (game.saw_buyin_type) {
      case "free":
        return true;
      case "spins":
        const used = game.spin_count ?? 0;
        const max = game.max_number_of_attempts ?? 0;
        return used < max;
      case "points":
        return (game.buyin_cost_points ?? 0) <= (info?.ach_points_balance ?? 0);
      default:
        return true;
    }
  }, []);

  // Atualizar countdown
  useEffect(() => {
    if (!selectedGame?.next_available_spin_ts) {
      setCountdown(null);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const nextAvailable = selectedGame.next_available_spin_ts;
      const remaining = nextAvailable - now;

      if (remaining <= 0) {
        setCountdown(null);
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        // Atualizar estado do jogo quando o countdown terminar
        refreshState();
      } else {
        setCountdown(formatCountdown(remaining));
      }
    };

    updateCountdown();
    countdownIntervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [selectedGame?.next_available_spin_ts, formatCountdown]);

  useEffect(() => {
    const loadGame = async () => {
      try {
        const [games, info] = await Promise.all([
          smartico.api.getMiniGames(),
          smartico.getPublicProps(),
        ]);

        const game = games.find(
          (g: any) => String(g.id) === String(templateId)
        );

        if (!game) {
          setStatusMessage("Jogo não encontrado");
          return;
        }

        setSelectedGame(game);
        setPlayerInfo(info);
        setPool(Array.isArray(game.prizes) ? game.prizes : []);

        const canPlayNow = checkCanPlay(game, info);
        setCanPlay(canPlayNow);
        
        if (!canPlayNow) {
          if (game.next_available_spin_ts && Date.now() < game.next_available_spin_ts) {
            setStatusMessage("Aguarde o próximo giro disponível");
          } else if (game.saw_buyin_type === "spins" && (game.spin_count ?? 0) === 0) {
            setStatusMessage("Sem tentativas disponíveis");
          } else {
            setStatusMessage(game.no_attempts_message || "Indisponível.");
          }
        } else {
          setStatusMessage("Pronto. Clique em Jogar.");
        }
      } catch (error) {
        console.error("Erro ao carregar jogo:", error);
        setStatusMessage("Erro ao carregar");
      }
    };

    loadGame();
  }, [smartico, templateId, checkCanPlay]);

  const refreshState = useCallback(async () => {
    try {
      const [games, info] = await Promise.all([
        smartico.api.getMiniGames(),
        smartico.getPublicProps(),
      ]);

      const updated = games.find(
        (g: any) => String(g.id) === String(selectedGame?.id)
      );
      if (updated) {
        setSelectedGame(updated);
        setPlayerInfo(info);
        const canPlayNow = checkCanPlay(updated, info);
        setCanPlay(canPlayNow);
        
        if (!canPlayNow && phase === "intro") {
          if (updated.next_available_spin_ts && Date.now() < updated.next_available_spin_ts) {
            setStatusMessage("Aguarde o próximo giro disponível");
          } else {
            setStatusMessage("Sem tentativas disponíveis");
          }
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    }
  }, [smartico, selectedGame?.id, checkCanPlay, phase]);

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
    (
      fromX: number,
      toX: number,
      durationMs: number,
      onUpdate: (x: number) => void
    ) => {
      return new Promise<void>((resolve) => {
        const startTime = performance.now();

        const tick = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / durationMs, 1);
          const eased = easeOutCubic(progress);
          const newX = fromX + (toX - fromX) * eased;

          onUpdate(newX);

          if (progress < 1) {
            rafRef.current = requestAnimationFrame(tick);
          } else {
            resolve();
          }
        };

        rafRef.current = requestAnimationFrame(tick);
      });
    },
    []
  );

  const playGame = useCallback(async () => {
    if (!selectedGame || !canPlay || playing) return;

    setPlaying(true);
    setStatusMessage("Abrindo…");
    setChestOpen(false);

    try {
      const result = await smartico.api.playMiniGame(selectedGame.id);

      if (result?.err_code !== 0) {
        console.error("Erro playMiniGame:", result);
        setStatusMessage("Falha ao jogar. Tente novamente.");
        setPlaying(false);
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
      let tempX = currentX;

      await animateTo(tempX, tempX - kick, 220, (x) => {
        tempX = x;
        setCurrentX(x);
      });

      const toX = getTargetX(targetIndex, tempX);
      await animateTo(tempX, toX, 2400, setCurrentX);

      setStatusMessage("Resultado!");
      setLastPrize(prize);
      setShowWin(true);

      await refreshState();
    } catch (error) {
      console.error("Erro ao jogar:", error);
      setStatusMessage("Erro no playMiniGame.");
    } finally {
      setPlaying(false);
    }
  }, [
    selectedGame,
    canPlay,
    playing,
    pool,
    strip,
    getStepPx,
    animateTo,
    getTargetX,
    currentX,
    refreshState,
  ]);

  const goToRoll = useCallback(() => {
    if (!canPlay || !selectedGame) return;
    setPhase("roll");
    setStatusMessage("Pronto para girar.");
  }, [canPlay, selectedGame]);

  const goToIntro = useCallback(() => {
    setPhase("intro");
    setChestOpen(false);
    setTargetPrizeIndex(null);
    setStatusMessage(canPlay ? "Pronto. Clique em Jogar." : "Sem tentativas disponíveis");
  }, [canPlay]);

  const reset = useCallback(() => {
    setChestOpen(false);
    setTargetPrizeIndex(null);
    setLastPrize(null);
    setCurrentX(0);
    setStatusMessage(
      phase === "intro" 
        ? (canPlay ? "Pronto. Clique em Jogar." : "Sem tentativas disponíveis")
        : "Pronto para girar."
    );
  }, [phase, canPlay]);

  const closeWin = useCallback(() => {
    setShowWin(false);
    if (lastPrize?.acknowledge_dp && typeof smartico?.dp === "function") {
      try {
        smartico.dp(lastPrize.acknowledge_dp);
      } catch {}
    }
  }, [lastPrize, smartico]);

  useEffect(() => {
    if (!trackRef.current || targetPrizeIndex === null || playing) return;

    const handleResize = () => {
      if (!playing && targetPrizeIndex !== null) {
        const toX = getTargetX(targetPrizeIndex, currentX);
        setCurrentX(toX);
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
  }, [targetPrizeIndex, playing, getTargetX, currentX]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Display de tentativas melhorado
  const attemptsDisplay = useMemo(() => {
    if (!selectedGame) {
      return (
        <>
          <div className="text-xs text-slate-600">Tentativas</div>
          <div className="text-base font-black">—</div>
        </>
      );
    }

    if (selectedGame.saw_buyin_type === "free") {
      return (
        <>
          <div className="text-xs text-slate-600">Modo</div>
          <div className="text-base font-black">Grátis</div>
        </>
      );
    }

    if (selectedGame.saw_buyin_type === "spins") {
      const remaining = selectedGame.spin_count ?? 0;
      const maxAttempts = selectedGame.max_number_of_attempts ?? 0;
      const used = maxAttempts > 0 ? maxAttempts - remaining : 0;

      return (
        <>
          <div className="text-xs text-slate-600">
            {countdown ? "Próximo em" : "Tentativas"}
          </div>
          <div className="text-base font-black">
            {countdown ? (
              <span className="text-orange-600">{countdown}</span>
            ) : (
              <>
                {remaining > 0 ? (
                  maxAttempts > 0 ? (
                    <span>
                      {remaining} <span className="text-xs text-slate-500">/ {maxAttempts}</span>
                    </span>
                  ) : (
                    remaining
                  )
                ) : (
                  <span className="text-red-600">0</span>
                )}
              </>
            )}
          </div>
        </>
      );
    }

    if (selectedGame.saw_buyin_type === "points") {
      const cost = selectedGame.buyin_cost_points ?? 0;
      const balance = playerInfo?.ach_points_balance ?? 0;

      return (
        <>
          <div className="text-xs text-slate-600">
            {countdown ? "Próximo em" : `Pontos (custo: ${cost})`}
          </div>
          <div className="text-base font-black">
            {countdown ? (
              <span className="text-orange-600">{countdown}</span>
            ) : (
              <span className={balance >= cost ? "" : "text-red-600"}>
                {balance}
              </span>
            )}
          </div>
        </>
      );
    }

    return (
      <>
        <div className="text-xs text-slate-600">Status</div>
        <div className="text-base font-black">Indisponível</div>
      </>
    );
  }, [selectedGame, canPlay, playerInfo, countdown]);

  const prizeLabel = useMemo(() => {
    if (!lastPrize) return "Jogada concluída.";
    if (lastPrize.prize_type === "no-prize")
      return lastPrize.aknowledge_message || "Quase!";
    return `${lastPrize.aknowledge_message ?? "Parabéns! Você ganhou"} ${
      lastPrize.name
    }`;
  }, [lastPrize]);

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
            {selectedGame?.name || "Carregando…"}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            {selectedGame?.promo_text || "Preparando o baú"}
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
              <div className="mt-2 text-sm font-extrabold">{statusMessage}</div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5">
              <div className="text-right">{attemptsDisplay}</div>

              <button
                className={btnGhost}
                onClick={() => setShowRules(true)}
                disabled={!selectedGame || playing}
                type="button"
              >
                Regras
              </button>

              <button
                className={btnGhost}
                onClick={reset}
                disabled={playing || phase !== "roll"}
                type="button"
              >
                Reset
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
                    {canPlay ? (
                      <>Clique em <b>Jogar</b> para revelar a roleta.</>
                    ) : countdown ? (
                      <>Aguarde {countdown} para o próximo giro.</>
                    ) : (
                      <>Você não tem tentativas disponíveis no momento.</>
                    )}
                  </div>

                  {/* Chest */}
                  <div
                    className={`relative mx-auto my-3 h-[140px] w-[170px] scale-[1.05] drop-shadow-[0_18px_45px_rgba(20,25,60,.22)] ${
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
                    <div className={`absolute bottom-[30px] left-1/2 h-[46px] w-[46px] -translate-x-1/2 rounded-[14px] shadow-[inset_0_0_0_1px_rgba(20,25,60,.10)] transition-colors ${
                      canPlay ? "bg-slate-900/5" : "bg-red-500/10"
                    }`}>
                      <div className={`absolute left-1/2 top-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-[6px] transition-all ${
                        canPlay 
                          ? "bg-[rgba(196,113,237,.25)] shadow-[0_0_16px_rgba(196,113,237,.18)]"
                          : "bg-red-500/30 shadow-[0_0_16px_rgba(239,68,68,.15)]"
                      }`} />
                    </div>
                  </div>

                  <button
                    className={btnPrimary + " px-4 py-3 text-[15px]"}
                    onClick={goToRoll}
                    disabled={playing || !selectedGame || !canPlay}
                    type="button"
                  >
                    {!canPlay && countdown ? `Aguarde (${countdown})` : "Jogar"}
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
                <div className="relative w-full max-w-[760px] overflow-hidden rounded-[18px] border border-slate-900/10 bg-white/80 p-3 shadow-[0_20px_70px_rgba(20,25,60,.12)]">
                  <div className="mb-2.5">
                    <div className="text-base font-black">Roleta do Baú</div>
                    <div className="mt-0.5 text-xs text-slate-600">
                      A seta no meio indica onde vai parar.
                    </div>
                  </div>

                  {/* Seta */}
                  <div className="absolute left-1/2 top-12 z-[5] h-[96px] w-[3px] -translate-x-[1px] rounded bg-[rgba(18,194,233,.55)] shadow-[0_0_18px_rgba(18,194,233,.22)]" />

                  {/* Track */}
                  <div className="relative h-[100px] overflow-hidden rounded-[14px] bg-slate-900/5 shadow-[inset_0_0_0_1px_rgba(20,25,60,.08)]">
                    <div
                      ref={trackRef}
                      className="absolute left-0 top-[7px] flex gap-2.5 will-change-transform"
                      style={{
                        transform: `translate3d(${currentX}px, 0, 0)`,
                        transition: playing
                          ? "none"
                          : "transform 140ms ease-out",
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
                      disabled={playing || !canPlay}
                      type="button"
                    >
                      Abrir Baú
                    </button>

                    <button
                      className={btnGhost}
                      onClick={goToIntro}
                      disabled={playing}
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

Tentativas: ${selectedGame?.max_number_of_attempts ?? 0} no total${
                selectedGame?.description
                  ? `\n\n(Regras do BackOffice)\n${selectedGame.description}`
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