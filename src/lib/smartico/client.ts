export type MiniGameTemplate = any;
export type PlayerInfo = any;

export type LoadStateResult = {
  game: MiniGameTemplate | null;
  playerInfo: PlayerInfo | null;
  canPlay: boolean;
  status: string;
  nextAvailableTs: number | null; // timestamp absoluto (ms)
};

function safeNumber(v: any, fallback = 0) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function formatCountdown(ms: number) {
  if (ms <= 0) return null;

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function createSmarticoClient(smartico: any) {
  if (!smartico?.api) {
    throw new Error("Smartico não inicializado (smartico.api ausente).");
  }

  const api = smartico.api;

  async function getMiniGames(opts?: { onUpdate?: (items: MiniGameTemplate[]) => void }) {
    // docs: getMiniGames pode ser cached e tem onUpdate
    return await api.getMiniGames(opts ?? undefined);
  }

  async function getPublicProps(): Promise<PlayerInfo | null> {
    if (typeof smartico.getPublicProps !== "function") return null;
    return await smartico.getPublicProps();
  }

  function computeNextAvailableTs(game: MiniGameTemplate): number | null {
    const ts = safeNumber(game?.next_available_spin_ts, 0);
    if (!ts) return null;
    return ts;
  }

  function computeCanPlay(game: MiniGameTemplate, info: PlayerInfo | null): boolean {
    if (!game) return false;

    const now = Date.now();

    const activeFrom = safeNumber(game.activeFromDate, 0);
    const activeTill = safeNumber(game.activeTillDate, 0);
    if (activeFrom && now < activeFrom) return false;
    if (activeTill && now > activeTill) return false;

    const nextTs = computeNextAvailableTs(game);
    if (nextTs && now < nextTs) return false;

    const buyin = game.saw_buyin_type;

    if (buyin === "free") return true;
    if (buyin === "spins") return safeNumber(game.spin_count, 0) > 0;

    if (buyin === "points") {
      const cost = safeNumber(game.buyin_cost_points, 0);
      const bal = safeNumber(info?.ach_points_balance, 0);
      return bal >= cost;
    }

    return true;
  }

  function computeStatus(game: MiniGameTemplate, info: PlayerInfo | null): string {
    if (!game) return "Jogo não encontrado";

    const now = Date.now();
    const nextTs = computeNextAvailableTs(game);

    if (nextTs && now < nextTs) return "Aguarde o próximo giro disponível";

    const buyin = game.saw_buyin_type;

    if (buyin === "spins" && safeNumber(game.spin_count, 0) === 0) {
      return game.no_attempts_message || "Sem tentativas disponíveis";
    }

    if (buyin === "points") {
      const cost = safeNumber(game.buyin_cost_points, 0);
      const bal = safeNumber(info?.ach_points_balance, 0);
      if (bal < cost) return "Pontos insuficientes";
    }

    return "Pronto para jogar";
  }

  async function loadState(
    templateId: number | string,
    opts?: { onUpdate?: (items: MiniGameTemplate[]) => void }
  ): Promise<LoadStateResult> {
    const [games, info] = await Promise.all([getMiniGames(opts), getPublicProps()]);

    console.log(games)
    console.log(info)

    const game =
      games?.find((g: any) => String(g.id) === String(templateId)) ?? null;

    if (!game) {
      return {
        game: null,
        playerInfo: info,
        canPlay: false,
        status: "Jogo não encontrado",
        nextAvailableTs: null,
      };
    }

    const canPlay = computeCanPlay(game, info);
    const status = canPlay ? "Pronto para jogar" : computeStatus(game, info);
    const nextAvailableTs = computeNextAvailableTs(game);

    return { game, playerInfo: info, canPlay, status, nextAvailableTs };
  }

  async function play(templateId: number) {
    // docs: playMiniGame retorna prize_id / err_code
    const res = await api.playMiniGame(templateId);
    console.log(res)

    if (res?.err_code != null && res.err_code !== 0) {
      throw new Error(res?.err_msg || "Falha ao jogar (err_code != 0).");
    }

    return res;
  }

  async function getHistory(params?: { limit?: number; offset?: number; templateId?: number }) {
    // docs: getMiniGamesHistory({limit, offset, saw_template_id})
    return await api.getMiniGamesHistory({
      limit: params?.limit,
      offset: params?.offset,
      saw_template_id: params?.templateId,
    });
  }

  async function acknowledge(requestId: string) {
    // docs: miniGameWinAcknowledgeRequest(request_id)
    return await api.miniGameWinAcknowledgeRequest(requestId);
  }

  function dp(payload: any) {
    try {
      smartico?.dp?.(payload);
    } catch {}
  }

  return {
    smartico,
    getMiniGames,
    getPublicProps,
    loadState,
    play,
    getHistory,
    acknowledge,
    dp,
    formatCountdown,
  };
}
