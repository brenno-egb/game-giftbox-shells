import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type {
  SmarticoGame,
  SmarticoPlayerInfo,
  GameState,
  AttemptsDisplay,
  SmarticoPlayResult,
} from "@/@types/games";

interface UseWheelGameParams {
  smartico: any;
  templateId: number | string;
}

export function useWheelGame({
  smartico,
  templateId,
}: UseWheelGameParams): GameState & {
  attemptsDisplay: AttemptsDisplay;
} {
  const [game, setGame] = useState<SmarticoGame | null>(null);
  const [playerInfo, setPlayerInfo] = useState<SmarticoPlayerInfo | null>(null);
  const [canPlay, setCanPlay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Carregando…");
  const [countdown, setCountdown] = useState<string | null>(null);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatCountdown = useCallback((ms: number): string | null => {
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

  const checkCanPlay = useCallback(
    (g: SmarticoGame, info: SmarticoPlayerInfo): boolean => {
      if (!g) return false;

      const now = Date.now();
      if (g.activeFromDate && now < g.activeFromDate) return false;
      if (g.activeTillDate && now > g.activeTillDate) return false;

      if (g.next_available_spin_ts) {
        if (now < g.next_available_spin_ts) return false;
      }

      switch (g.saw_buyin_type) {
        case "free":
          return true;
        case "spins":
          return (g.spin_count ?? 0) > 0;
        case "points":
          return (g.buyin_cost_points ?? 0) <= (info?.ach_points_balance ?? 0);
        default:
          return true;
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    try {
      const [games, info] = await Promise.all([
        smartico.api.getMiniGames(),
        smartico.getPublicProps(),
      ]);

      const updated = games.find(
        (g: any) => String(g.id) === String(templateId)
      );

      if (updated) {
        setGame(updated);
        setPlayerInfo(info);
        const canPlayNow = checkCanPlay(updated, info);
        setCanPlay(canPlayNow);

        if (!canPlayNow) {
          if (
            updated.next_available_spin_ts &&
            Date.now() < updated.next_available_spin_ts
          ) {
            setStatusMessage("Aguarde o próximo giro disponível");
          } else if (
            updated.saw_buyin_type === "spins" &&
            (updated.spin_count ?? 0) === 0
          ) {
            setStatusMessage(
              updated.no_attempts_message || "Sem tentativas disponíveis"
            );
          } else if (updated.saw_buyin_type === "points") {
            setStatusMessage("Pontos insuficientes");
          } else {
            setStatusMessage(updated.no_attempts_message || "Indisponível");
          }
        } else {
          setStatusMessage("Pronto para jogar");
        }
      }
    } catch (err) {
      console.error("Erro ao atualizar estado:", err);
      setError("Erro ao atualizar");
    }
  }, [smartico, templateId, checkCanPlay]);

  useEffect(() => {
    const loadGame = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [games, info] = await Promise.all([
          smartico.api.getMiniGames(),
          smartico.getPublicProps(),
        ]);

        const foundGame = games.find(
          (g: any) => String(g.id) === String(templateId)
        );

        if (!foundGame) {
          setError("Jogo não encontrado");
          setStatusMessage("Jogo não encontrado");
          setIsLoading(false);
          return;
        }

        setGame(foundGame);
        setPlayerInfo(info);

        const canPlayNow = checkCanPlay(foundGame, info);
        setCanPlay(canPlayNow);

        if (!canPlayNow) {
          if (
            foundGame.next_available_spin_ts &&
            Date.now() < foundGame.next_available_spin_ts
          ) {
            setStatusMessage("Aguarde o próximo giro disponível");
          } else if (
            foundGame.saw_buyin_type === "spins" &&
            (foundGame.spin_count ?? 0) === 0
          ) {
            setStatusMessage(
              foundGame.no_attempts_message || "Sem tentativas disponíveis"
            );
          } else if (foundGame.saw_buyin_type === "points") {
            setStatusMessage("Pontos insuficientes");
          } else {
            setStatusMessage(foundGame.no_attempts_message || "Indisponível");
          }
        } else {
          setStatusMessage("Pronto. Clique em Jogar.");
        }
      } catch (err) {
        console.error("Erro ao carregar jogo:", err);
        setError("Erro ao carregar");
        setStatusMessage("Erro ao carregar");
      } finally {
        setIsLoading(false);
      }
    };

    loadGame();
  }, [smartico, templateId, checkCanPlay]);

  useEffect(() => {
    if (!game?.next_available_spin_ts) {
      setCountdown(null);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const nextAvailable = game.next_available_spin_ts!;
      const remaining = nextAvailable - now;

      if (remaining <= 0) {
        setCountdown(null);
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        refresh();
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
  }, [game?.next_available_spin_ts, formatCountdown, refresh]);

  const play = useCallback(async (): Promise<SmarticoPlayResult | null> => {
    if (!game || !canPlay || isPlaying) return null;

    setIsPlaying(true);
    setStatusMessage("Jogando...");

    try {
      const result = await smartico.api.playMiniGame(game.id);

      if (result?.err_code !== 0) {
        console.error("Erro playMiniGame:", result);
        setStatusMessage("Falha ao jogar. Tente novamente.");
        setIsPlaying(false);
        return null;
      }

      return result;
    } catch (err) {
      console.error("Erro ao jogar:", err);
      setStatusMessage("Erro no playMiniGame.");
      setIsPlaying(false);
      return null;
    } finally {
      setIsPlaying(false);
    }
  }, [game, canPlay, isPlaying, smartico]);

  const attemptsDisplay = useMemo((): AttemptsDisplay => {
    if (!game) {
      return { label: "Tentativas", value: "—" };
    }

    if (game.saw_buyin_type === "free") {
      return { label: "Modo", value: "Grátis" };
    }

    if (game.saw_buyin_type === "spins") {
      const remaining = game.spin_count ?? 0;
      const maxAttempts = game.max_number_of_attempts ?? 0;

      if (countdown) {
        return {
          label: "Próximo em",
          value: countdown,
          valueColor: "text-orange-600",
          showCountdown: true,
        };
      }

      return {
        label: "Tentativas",
        value: maxAttempts > 0 ? `${remaining} / ${maxAttempts}` : remaining,
        valueColor: remaining === 0 ? "text-red-600" : "",
      };
    }

    if (game.saw_buyin_type === "points") {
      const cost = game.buyin_cost_points ?? 0;
      const balance = playerInfo?.ach_points_balance ?? 0;

      if (countdown) {
        return {
          label: "Próximo em",
          value: countdown,
          valueColor: "text-orange-600",
          showCountdown: true,
        };
      }

      return {
        label: `Pontos (custo: ${cost})`,
        value: balance,
        valueColor: balance < cost ? "text-red-600" : "",
      };
    }

    return { label: "Status", value: "Indisponível" };
  }, [game, playerInfo, countdown]);

  return {
    game,
    playerInfo,
    canPlay,
    isLoading,
    isPlaying,
    error,
    statusMessage,
    countdown,
    play,
    refresh,
    attemptsDisplay,
  };
}
