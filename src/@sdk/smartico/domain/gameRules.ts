import type { MiniGameTemplate, PlayerInfo } from "../types";

export function safeNumber(value: any, fallback = 0): number {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function computeNextAvailableTs(
  game: MiniGameTemplate | null
): number | null {
  if (!game) return null;
  const ts = safeNumber(game.next_available_spin_ts, 0);
  return ts > 0 ? ts : null;
}

export function computeCanPlay(
  game: MiniGameTemplate | null,
  info: PlayerInfo | null
): boolean {
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

  if (buyin === "spins") {
    return safeNumber(game.spin_count, 0) > 0;
  }

  if (buyin === "points") {
    const cost = safeNumber(game.buyin_cost_points, 0);
    const balance = safeNumber(info?.ach_points_balance, 0);
    return balance >= cost;
  }

  return true;
}

export function computeStatus(
  game: MiniGameTemplate | null,
  info: PlayerInfo | null
): string {
  if (!game) return "Jogo não encontrado";

  const now = Date.now();
  const nextTs = computeNextAvailableTs(game);

  if (nextTs && now < nextTs) {
    return "Aguarde o próximo giro disponível";
  }

  const buyin = game.saw_buyin_type;

  if (buyin === "spins" && safeNumber(game.spin_count, 0) === 0) {
    return game.no_attempts_message || "Sem tentativas disponíveis";
  }

  if (buyin === "points") {
    const cost = safeNumber(game.buyin_cost_points, 0);
    const balance = safeNumber(info?.ach_points_balance, 0);
    if (balance < cost) return "Pontos insuficientes";
  }

  return "Pronto para jogar";
}