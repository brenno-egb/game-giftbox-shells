import type { MiniGameTemplate, PlayerInfo } from "./domain.type";

function safeNumber(v: any, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Formata tempo em milissegundos para countdown legível
 */
export function formatCountdown(ms: number): string | null {
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

export type AttemptsDisplay = {
  label: string;
  value: any;
  valueColor?: string;
  showCountdown?: boolean;
};

/**
 * Calcula a exibição de tentativas/status do jogo
 */
export function getAttemptsDisplay(
  game: MiniGameTemplate | null,
  playerInfo: PlayerInfo | null,
  countdown: string | null
): AttemptsDisplay {
  if (!game) return { label: "Tentativas", value: "—" };

  if (countdown) {
    return {
      label: "Próximo em",
      value: countdown,
      valueColor: "text-orange-600",
      showCountdown: true,
    };
  }

  const buyin = game.saw_buyin_type;

  if (buyin === "free") return { label: "Modo", value: "Grátis" };

  if (buyin === "spins") {
    const remaining = safeNumber(game.spin_count, 0);
    const maxAttempts = safeNumber(game.max_number_of_attempts, 0);
    return {
      label: "Tentativas",
      value: maxAttempts > 0 ? `${remaining} / ${maxAttempts}` : remaining,
      valueColor: remaining === 0 ? "text-red-600" : "",
    };
  }

  if (buyin === "points") {
    const cost = safeNumber(game.buyin_cost_points, 0);
    const balance = safeNumber(playerInfo?.ach_points_balance, 0);
    return {
      label: `Pontos (custo: ${cost})`,
      value: balance,
      valueColor: balance < cost ? "text-red-600" : "",
    };
  }

  return { label: "Status", value: "Indisponível" };
}
