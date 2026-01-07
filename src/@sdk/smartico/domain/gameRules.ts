import type { MiniGameTemplate, PlayerInfo } from "./domain.type";

function safeNumber(v: any, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Calcula o próximo timestamp disponível para jogar
 */
export function computeNextAvailableTs(
  game: MiniGameTemplate | null
): number | null {
  if (!game) return null;
  const ts = safeNumber(game.next_available_spin_ts, 0);
  return ts > 0 ? ts : null;
}

/**
 * Verifica se o jogador pode jogar agora
 */
export function computeCanPlay(
  game: MiniGameTemplate | null,
  info: PlayerInfo | null
): boolean {
  if (!game) return false;

  const now = Date.now();

  // Verifica janela de ativação
  const activeFrom = safeNumber(game.activeFromDate, 0);
  const activeTill = safeNumber(game.activeTillDate, 0);
  if (activeFrom && now < activeFrom) return false;
  if (activeTill && now > activeTill) return false;

  // Verifica cooldown
  const nextTs = computeNextAvailableTs(game);
  if (nextTs && now < nextTs) return false;

  const buyin = game.saw_buyin_type;

  // Free: sempre pode jogar (se passar as verificações acima)
  if (buyin === "free") return true;

  // Spins: precisa ter tentativas
  if (buyin === "spins") {
    return safeNumber(game.spin_count, 0) > 0;
  }

  // Points: precisa ter saldo suficiente
  if (buyin === "points") {
    const cost = safeNumber(game.buyin_cost_points, 0);
    const bal = safeNumber(info?.ach_points_balance, 0);
    return bal >= cost;
  }

  // Outros tipos: assume que pode jogar
  return true;
}

/**
 * Calcula a mensagem de status do jogo
 */
export function computeStatus(
  game: MiniGameTemplate | null,
  info: PlayerInfo | null
): string {
  if (!game) return "Jogo não encontrado";

  const now = Date.now();
  const nextTs = computeNextAvailableTs(game);

  // Verifica cooldown
  if (nextTs && now < nextTs) {
    return "Aguarde o próximo giro disponível";
  }

  const buyin = game.saw_buyin_type;

  // Spins: verifica se tem tentativas
  if (buyin === "spins" && safeNumber(game.spin_count, 0) === 0) {
    return game.no_attempts_message || "Sem tentativas disponíveis";
  }

  // Points: verifica saldo
  if (buyin === "points") {
    const cost = safeNumber(game.buyin_cost_points, 0);
    const bal = safeNumber(info?.ach_points_balance, 0);
    if (bal < cost) return "Pontos insuficientes";
  }

  return "Pronto para jogar";
}
