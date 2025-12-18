export function initGiftbox(root: HTMLElement, ctx: { smartico: any; templateId: number }) {
  const smartico = ctx.smartico;

  const $ = <T extends Element = Element>(sel: string) => root.querySelector(sel) as T | null;
  const must = <T extends Element = Element>(sel: string) => {
    const el = $(sel);
    if (!el) throw new Error(`Elemento não encontrado: ${sel}`);
    return el as T;
  };

  // DOM
  const elTitle = must<HTMLDivElement>("#game-title");
  const elSubtitle = must<HTMLDivElement>("#game-subtitle");
  const elStatus = must<HTMLDivElement>("#status");

  const elAttemptsLabel = must<HTMLDivElement>("#attempts-label");
  const elAttemptsValue = must<HTMLDivElement>("#attempts-value");

  const elRulesBtn = must<HTMLButtonElement>("#rules-btn");
  const elResetBtn = must<HTMLButtonElement>("#reset-btn");

  const sceneIntro = must<HTMLDivElement>("#scene-intro");
  const sceneRoll = must<HTMLDivElement>("#scene-roll");

  const playBtn = must<HTMLButtonElement>("#play-btn");
  const backBtn = must<HTMLButtonElement>("#back-btn");

  const track = must<HTMLDivElement>("#track");

  const chest = must<HTMLDivElement>("#chest");
  const openBtn = must<HTMLButtonElement>("#open-btn");

  const rulesBackdrop = must<HTMLDivElement>("#rules-backdrop");
  const rulesBody = must<HTMLDivElement>("#rules-body");
  const rulesClose = must<HTMLButtonElement>("#rules-close");

  const winBackdrop = must<HTMLDivElement>("#win-backdrop");
  const winTitle = must<HTMLDivElement>("#win-title");
  const winText = must<HTMLDivElement>("#win-text");
  const winIcon = must<HTMLImageElement>("#win-icon");
  const winClose = must<HTMLButtonElement>("#win-close");

  // Smartico state
  let miniGames: any[] = [];
  let selectedGame: any = null;
  let playerInfo: any = null;
  let canPlay = false;

  // Game state
  let pool: any[] = [];
  let strip: any[] = [];
  let playing = false;
  let currentX = 0;

  let phase: "intro" | "roll" = "intro";
  let lastStopIndex: number | null = null;
  let lastPrize: any = null;
  let pendingRealign = false;

  let ro: ResizeObserver | null = null;
  let destroyed = false;
  let rafId: number | null = null;

  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const strId = (v: any) => (v === null || v === undefined ? "" : String(v));

  const show = (el: HTMLElement, on: boolean) => {
    el.classList.toggle("hidden", !on);
  };

  const shake = (el: HTMLElement) => {
    try {
      el.animate(
        [
          { transform: "translateX(0px)" },
          { transform: "translateX(-6px)" },
          { transform: "translateX(6px)" },
          { transform: "translateX(-4px)" },
          { transform: "translateX(4px)" },
          { transform: "translateX(0px)" },
        ],
        { duration: 360, easing: "ease-in-out" }
      );
    } catch {}
  };

  const updateButtons = () => {
    const hasGame = !!selectedGame;
    const ok = !!canPlay;

    elRulesBtn.disabled = !hasGame || playing;
    elResetBtn.disabled = playing || phase !== "roll";

    playBtn.disabled = playing || phase !== "intro" || !hasGame || !ok;

    openBtn.disabled = playing || phase !== "roll" || !hasGame || !ok;
    backBtn.disabled = playing || phase !== "roll";
  };

  const setPhase = (next: "intro" | "roll") => {
    phase = next;

    if (phase === "intro") {
      show(sceneIntro, true);
      show(sceneRoll, false);
      elStatus.textContent = "Pronto. Clique em Jogar.";
      chest.classList.remove("open");
    } else {
      show(sceneIntro, false);
      show(sceneRoll, true);
      elStatus.textContent = "Pronto para girar.";
    }

    updateButtons();
  };

  const SAWCanPlay = (game: any, pointsBalance: number) => {
    if (!game) return false;
    switch (game.saw_buyin_type) {
      case "free":
        return true;
      case "spins":
        return game.spin_count != null && game.spin_count > 0;
      case "points":
        return (game.buyin_cost_points || 0) <= (pointsBalance || 0);
      default:
        console.warn("Unknown saw_buyin_type:", game.saw_buyin_type);
        return true;
    }
  };

  const setAttemptsUI = (game: any, info: any, ok: boolean) => {
    if (!game) {
      elAttemptsLabel.textContent = "Tentativas";
      elAttemptsValue.textContent = "—";
      return;
    }

    if (game.saw_buyin_type === "free") {
      elAttemptsLabel.textContent = "";
      elAttemptsValue.textContent = "Free";
      return;
    }

    if (game.saw_buyin_type === "spins") {
      if (ok) {
        elAttemptsLabel.textContent = "Tentativas";
        elAttemptsValue.textContent = String(game.spin_count ?? 0);
      } else {
        elAttemptsLabel.textContent = game.no_attempts_message || "Sem tentativas";
        elAttemptsValue.textContent = "";
      }
      return;
    }

    if (game.saw_buyin_type === "points") {
      if (ok) {
        elAttemptsLabel.textContent = "Pontos";
        elAttemptsValue.textContent = String(info?.ach_points_balance ?? 0);
      } else {
        elAttemptsLabel.textContent = game.no_attempts_message || "Sem pontos";
        elAttemptsValue.textContent = "";
      }
      return;
    }

    elAttemptsLabel.textContent = "Indisponível";
    elAttemptsValue.textContent = "";
  };

  const prizeLabel = (prize: any) => {
    if (!prize) return "Jogada concluída.";
    if (prize.prize_type === "no-prize") return prize.aknowledge_message || "Quase!";
    return `${prize.aknowledge_message ?? "Parabéns! Você ganhou"} ${prize.name}`;
  };

  const openRules = () => {
    const backofficeRules = selectedGame?.description ? `\n\n(Regras do BackOffice)\n${selectedGame.description}` : "";
    rulesBody.textContent =
      `🧰 Baú Giratório

Fluxo:
1) Você clica "Jogar"
2) Abre a roleta e clica "Abrir Baú"
3) O Smartico decide o prêmio (playMiniGame) e a roleta para exatamente nele.` + backofficeRules;

    show(rulesBackdrop, true);
  };

  const closeRulesModal = () => show(rulesBackdrop, false);

  const openWin = (prize: any) => {
    lastPrize = prize || null;

    const isNoPrize = prize?.prize_type === "no-prize";
    winTitle.textContent = isNoPrize ? "Quase!" : prize ? "Você ganhou!" : "Resultado";
    winText.textContent = prizeLabel(prize);

    if (prize?.icon) {
      winIcon.src = prize.icon;
      winIcon.style.display = "";
    } else {
      winIcon.removeAttribute("src");
      winIcon.style.display = "none";
    }

    show(winBackdrop, true);
  };

  const closeWinModal = () => {
    show(winBackdrop, false);
    try {
      const dp = lastPrize?.acknowledge_dp;
      if (dp && typeof smartico?.dp === "function") smartico.dp(dp);
    } catch {}
    lastPrize = null;
  };

  // Roleta
  const normalizePool = (game: any) => (Array.isArray(game?.prizes) ? game.prizes : []);

  const renderItem = (p: any) => {
    const div = document.createElement("div");
    div.className =
      "w-[128px] h-[86px] rounded-[14px] border border-slate-900/10 " +
      "bg-[radial-gradient(90px_60px_at_30%_30%,rgba(255,255,255,.80),rgba(255,255,255,.55))] " +
      "shadow-[0_14px_30px_rgba(20,25,60,.10)] flex flex-col items-center justify-center " +
      "p-[10px] gap-2 select-none";

    const img = document.createElement("img");
    img.decoding = "async";
    img.className = "w-[34px] h-[34px] object-contain drop-shadow-[0_10px_16px_rgba(20,25,60,.16)]";

    if (p?.icon) {
      img.src = p.icon;
    } else {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
        <defs>
          <radialGradient id="g" cx="30%" cy="30%" r="70%">
            <stop offset="0" stop-color="rgba(255,255,255,.75)"/>
            <stop offset="1" stop-color="rgba(18,194,233,.25)"/>
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="22" fill="url(#g)"/>
        <circle cx="32" cy="32" r="10" fill="rgba(196,113,237,.25)"/>
      </svg>`;
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }

    const name = document.createElement("div");
    name.className =
      "max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[12px] leading-[1.1] text-slate-900/70";
    name.textContent = p?.name || "Item";

    div.appendChild(img);
    div.appendChild(name);
    return div;
  };

  const buildStrip = (poolIn: any[]) => {
    lastStopIndex = null;

    const repeats = 12;
    strip = [];
    for (let r = 0; r < repeats; r++) for (const p of poolIn) strip.push(p);

    track.innerHTML = "";
    for (const p of strip) track.appendChild(renderItem(p));

    currentX = 0;
    track.style.transform = `translate3d(${currentX}px,0,0)`;
  };

  const getStepPx = () => {
    const a = track.children[0] as HTMLElement | undefined;
    const b = track.children[1] as HTMLElement | undefined;
    if (a && b) return b.offsetLeft - a.offsetLeft;
    if (a) return a.offsetWidth + 10;
    return 140;
  };

  const getToXForIndex = (index: number) => {
    const viewport = track.parentElement as HTMLElement | null;
    const item = track.children[index] as HTMLElement | undefined;
    if (!viewport || !item) return currentX;

    const viewportCenter = viewport.clientWidth / 2;
    const itemCenter = item.offsetLeft + item.offsetWidth / 2;
    return Math.round(viewportCenter - itemCenter);
  };

  const animateTo = (toX: number, durationMs: number) =>
    new Promise<void>((resolve) => {
      const fromX = currentX;
      const start = performance.now();

      const tick = (now: number) => {
        if (destroyed) return resolve();
        const t = clamp((now - start) / durationMs, 0, 1);
        const e = easeOutCubic(t);
        currentX = fromX + (toX - fromX) * e;
        track.style.transform = `translate3d(${currentX}px,0,0)`;
        if (t < 1) rafId = requestAnimationFrame(tick);
        else resolve();
      };

      rafId = requestAnimationFrame(tick);
    });

  const realignToStop = async (animate = false) => {
    if (lastStopIndex == null) return;
    const toX = getToXForIndex(lastStopIndex);
    if (!animate) {
      currentX = toX;
      track.style.transform = `translate3d(${currentX}px,0,0)`;
      return;
    }
    await animateTo(toX, 140);
  };

  const refreshState = async () => {
    const games = await smartico.api.getMiniGames();
    const info = await smartico.getPublicProps();

    miniGames = games;
    playerInfo = info;

    const updated = games.find((g: any) => strId(g.id) === strId(selectedGame?.id));
    if (updated) selectedGame = updated;

    canPlay = SAWCanPlay(selectedGame, playerInfo?.ach_points_balance);
    setAttemptsUI(selectedGame, playerInfo, canPlay);
    updateButtons();
  };

  const spinAndReveal = async () => {
    if (playing || destroyed) return;
    if (!selectedGame) return;

    if (!canPlay) {
      shake(chest);
      return;
    }

    playing = true;
    pendingRealign = false;
    updateButtons();

    elStatus.textContent = "Abrindo…";
    chest.classList.remove("open");

    try {
      const result = await smartico.api.playMiniGame(selectedGame.id);

      if (result?.err_code !== 0) {
        console.error("playMiniGame error:", result);
        elStatus.textContent = "Falha ao jogar. Tenta de novo.";
        shake(chest);
        return;
      }

      const prizeId = result?.prize_id != null ? strId(result.prize_id) : "";
      const prize = prizeId ? pool.find((p) => strId(p.id) === prizeId) || null : null;

      chest.classList.add("open");

      const startIndex = Math.max(0, Math.floor(strip.length * 0.65));
      let targetIndex = startIndex;

      if (prizeId) {
        for (let i = startIndex; i < strip.length; i++) {
          if (strId(strip[i]?.id) === prizeId) {
            targetIndex = i;
            break;
          }
        }
      } else {
        targetIndex = startIndex + Math.floor(Math.random() * Math.max(1, pool.length));
      }

      lastStopIndex = targetIndex;

      const kick = getStepPx() * 6;
      await animateTo(currentX - kick, 220);

      const toX = getToXForIndex(targetIndex);
      await animateTo(toX, 2400);

      await realignToStop(false);

      elStatus.textContent = "Resultado!";
      openWin(prize);

      await refreshState();
    } catch (e) {
      console.error(e);
      elStatus.textContent = "Erro no playMiniGame. Veja o console.";
      shake(chest);
    } finally {
      playing = false;
      if (pendingRealign) {
        pendingRealign = false;
        await realignToStop(true);
      }
      updateButtons();
    }
  };

  const loadMiniGames = async (templateId: number) => {
    const games = await smartico.api.getMiniGames();
    const info = await smartico.getPublicProps();

    miniGames = games;
    playerInfo = info;

    selectedGame = miniGames.find((g) => strId(g.id) === strId(templateId)) || null;

    if (!selectedGame) {
      elTitle.textContent = "Jogo não encontrado";
      elSubtitle.textContent = `Não achei template_id=${templateId} em getMiniGames().`;
      elStatus.textContent = "Indisponível.";
      pool = [];
      strip = [];
      canPlay = false;
      setAttemptsUI(null, null, false);
      updateButtons();
      return;
    }

    elTitle.textContent = selectedGame.name || "Baú Giratório";
    elSubtitle.textContent = selectedGame.promo_text || "Abra o baú e acompanhe a roleta";

    pool = normalizePool(selectedGame);
    buildStrip(pool);

    canPlay = SAWCanPlay(selectedGame, playerInfo?.ach_points_balance);
    setAttemptsUI(selectedGame, playerInfo, canPlay);

    elStatus.textContent = canPlay
      ? "Pronto. Clique em Jogar."
      : selectedGame.no_attempts_message
        ? `Indisponível: ${selectedGame.no_attempts_message}`
        : "Indisponível.";

    updateButtons();
  };

  const installResizeHandlers = () => {
    const viewportEl = track.parentElement as HTMLElement | null;
    if (!viewportEl) return;

    const onResize = () => {
      if (destroyed) return;
      if (phase !== "roll") return;
      if (lastStopIndex == null) return;

      if (playing) {
        pendingRealign = true;
        return;
      }
      void realignToStop(false);
    };

    try {
      ro = new ResizeObserver(onResize);
      ro.observe(viewportEl);
    } catch {}

    window.addEventListener("resize", onResize);
    cleanups.push(() => window.removeEventListener("resize", onResize));
  };

  // listeners (handlers nomeados pra remover certinho)
  const cleanups: Array<() => void> = [];

  const onRulesBackdropClick = (e: MouseEvent) => {
    if (e.target === rulesBackdrop) closeRulesModal();
  };
  const onWinBackdropClick = (e: MouseEvent) => {
    if (e.target === winBackdrop) closeWinModal();
  };

  const onPlayClick = () => {
    if (!canPlay || !selectedGame) return;
    setPhase("roll");
    requestAnimationFrame(() => {
      if (destroyed) return;
      buildStrip(pool);
      void realignToStop(false);
    });
  };

  const onBackClick = () => {
    if (playing) return;
    setPhase("intro");
  };

  const onOpenClick = () => void spinAndReveal();

  const onResetClick = () => {
    if (playing) return;
    chest.classList.remove("open");
    elStatus.textContent = phase === "intro" ? "Pronto. Clique em Jogar." : "Pronto para girar.";
    lastStopIndex = null;
    lastPrize = null;
    buildStrip(pool);
  };

  elRulesBtn.addEventListener("click", openRules);
  rulesClose.addEventListener("click", closeRulesModal);
  rulesBackdrop.addEventListener("click", onRulesBackdropClick as any);

  winClose.addEventListener("click", closeWinModal);
  winBackdrop.addEventListener("click", onWinBackdropClick as any);

  playBtn.addEventListener("click", onPlayClick);
  backBtn.addEventListener("click", onBackClick);
  openBtn.addEventListener("click", onOpenClick);
  elResetBtn.addEventListener("click", onResetClick);

  cleanups.push(() => elRulesBtn.removeEventListener("click", openRules));
  cleanups.push(() => rulesClose.removeEventListener("click", closeRulesModal));
  cleanups.push(() => rulesBackdrop.removeEventListener("click", onRulesBackdropClick as any));
  cleanups.push(() => winClose.removeEventListener("click", closeWinModal));
  cleanups.push(() => winBackdrop.removeEventListener("click", onWinBackdropClick as any));
  cleanups.push(() => playBtn.removeEventListener("click", onPlayClick));
  cleanups.push(() => backBtn.removeEventListener("click", onBackClick));
  cleanups.push(() => openBtn.removeEventListener("click", onOpenClick));
  cleanups.push(() => elResetBtn.removeEventListener("click", onResetClick));

  // init
  show(winBackdrop, false);
  show(rulesBackdrop, false);
  setPhase("intro");
  installResizeHandlers();

  void loadMiniGames(ctx.templateId).catch((e) => {
    console.error(e);
    elTitle.textContent = "Erro ao carregar";
    elSubtitle.textContent = "Veja o console para detalhes.";
    elStatus.textContent = "Indisponível.";
    selectedGame = null;
    canPlay = false;
    updateButtons();
  });

  return () => {
    destroyed = true;
    if (rafId != null) cancelAnimationFrame(rafId);
    if (ro) ro.disconnect();
    for (const fn of cleanups) {
      try {
        fn();
      } catch {}
    }
  };
}
