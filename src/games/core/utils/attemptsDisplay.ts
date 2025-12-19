export type AttemptsDisplay = {
  label: string;
  value: any;
  valueColor?: string;
  showCountdown?: boolean;
};

export function getAttemptsDisplay(
  game: any,
  playerInfo: any,
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
    const remaining = game.spin_count ?? 0;
    const maxAttempts = game.max_number_of_attempts ?? 0;
    return {
      label: "Tentativas",
      value: maxAttempts > 0 ? `${remaining} / ${maxAttempts}` : remaining,
      valueColor: remaining === 0 ? "text-red-600" : "",
    };
  }

  if (buyin === "points") {
    const cost = game.buyin_cost_points ?? 0;
    const balance = playerInfo?.ach_points_balance ?? 0;
    return {
      label: `Pontos (custo: ${cost})`,
      value: balance,
      valueColor: balance < cost ? "text-red-600" : "",
    };
  }

  return { label: "Status", value: "Indisponível" };
}
