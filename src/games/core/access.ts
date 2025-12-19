export function formatMs(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);

  if (d > 0) return `${d}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export function canPlaySmarticoGame(game: any, info: any) {
  if (!game) return { ok: false, reason: "Jogo indisponível." };

  const now = Date.now();

  const next = game.next_available_spin_ts;
  if (next && now < next) {
    return { ok: false, reason: `Disponível em ${formatMs(next - now)}.` };
  }

  switch (game.saw_buyin_type) {
    case "free":
      return { ok: true, reason: "" };

    case "spins": {
      const n = Number(game.spin_count ?? 0);
      if (n > 0) return { ok: true, reason: "" };
      return {
        ok: false,
        reason: game.no_attempts_message || "Sem tentativas.",
      };
    }

    case "points": {
      const cost = Number(game.buyin_cost_points ?? 0);
      const bal = Number(info?.ach_points_balance ?? 0);
      if (bal >= cost) return { ok: true, reason: "" };
      return {
        ok: false,
        reason: game.no_attempts_message || "Pontos insuficientes.",
      };
    }

    default:
      return { ok: true, reason: "" };
  }
}
