"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSmarticoTransport } from "../../infra/transport/transport.smartico";
import { createMiniGamesStore } from "../../services/miniGamesStore";
import { createPlayerStore } from "../../services/playerStore";
import {
  computeCanPlay,
  computeStatus,
  computeNextAvailableTs,
} from "../../domain/gameRules";
import { formatCountdown } from "../../domain/formatting";
import type { MiniGameTemplate, PlayerInfo } from "../../domain/domain.type";

type State = {
  game: MiniGameTemplate | null;
  playerInfo: PlayerInfo | null;
  canPlay: boolean;
  statusMessage: string;
  nextAvailableTs: number | null;

  countdownMs: number | null;
  countdown: string | null;

  isLoading: boolean;
  isPlaying: boolean;
  error: string | null;
};

/**
 * Hook principal para mini-games
 * Usa stores centralizadas ao invés de passar onUpdate em todo refresh
 */
export function useMiniGame({
  smartico,
  templateId,
  onTemplatesUpdate,
}: {
  smartico: any;
  templateId: number | string;
  onTemplatesUpdate?: (items: MiniGameTemplate[]) => void;
}) {
  // Cria transport e stores (memoizados)
  const transport = useMemo(
    () => createSmarticoTransport(smartico, false),
    [smartico]
  );

  const miniGamesStore = useMemo(
    () => createMiniGamesStore(transport, false),
    [transport]
  );

  const playerStore = useMemo(
    () => createPlayerStore(transport, false),
    [transport]
  );

  const [state, setState] = useState<State>({
    game: null,
    playerInfo: null,
    canPlay: false,
    statusMessage: "Carregando…",
    nextAvailableTs: null,

    countdownMs: null,
    countdown: null,

    isLoading: true,
    isPlaying: false,
    error: null,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Computa estado derivado
  const computeState = useCallback(
    (game: MiniGameTemplate | null, info: PlayerInfo | null) => {
      if (!game) {
        return {
          game: null,
          playerInfo: info,
          canPlay: false,
          statusMessage: "Jogo não encontrado",
          nextAvailableTs: null,
          countdownMs: null,
          countdown: null,
        };
      }

      const canPlay = computeCanPlay(game, info);
      const status = canPlay ? "Pronto para jogar" : computeStatus(game, info);
      const nextAvailableTs = computeNextAvailableTs(game);

      const countdownMs =
        nextAvailableTs && nextAvailableTs > Date.now()
          ? nextAvailableTs - Date.now()
          : null;

      return {
        game,
        playerInfo: info,
        canPlay,
        statusMessage: status,
        nextAvailableTs,
        countdownMs,
        countdown: countdownMs ? formatCountdown(countdownMs) : null,
      };
    },
    []
  );

  // Subscribe na store de mini-games
  useEffect(() => {
    const unsubscribe = miniGamesStore.subscribe((games) => {
      const game =
        games.find((g) => String(g.id) === String(templateId)) ?? null;
      const info = playerStore.getSnapshot();

      const newState = computeState(game, info);

      setState((prev) => ({
        ...prev,
        ...newState,
        isLoading: false,
      }));

      // Callback opcional para UI
      onTemplatesUpdate?.(games);
    });

    return unsubscribe;
  }, [
    miniGamesStore,
    playerStore,
    templateId,
    computeState,
    onTemplatesUpdate,
  ]);

  // Carrega dados iniciais
  const refresh = useCallback(async () => {
    try {
      setState((p) => ({ ...p, isLoading: true, error: null }));

      const [games, info] = await Promise.all([
        miniGamesStore.refresh(),
        playerStore.fetch(),
      ]);

      const game =
        games.find((g) => String(g.id) === String(templateId)) ?? null;
      const newState = computeState(game, info);

      setState((prev) => ({
        ...prev,
        ...newState,
        isLoading: false,
      }));
    } catch (e: any) {
      setState((p) => ({
        ...p,
        isLoading: false,
        error: e?.message ?? "Erro ao carregar",
        statusMessage: e?.message ?? "Erro ao carregar",
      }));
    }
  }, [miniGamesStore, playerStore, templateId, computeState]);

  // Load inicial
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await refresh();
      } catch (e: any) {
        if (!mounted) return;
        setState((p) => ({
          ...p,
          isLoading: false,
          error: e?.message ?? "Erro ao carregar",
          statusMessage: e?.message ?? "Erro ao carregar",
        }));
      }
    })();

    return () => {
      mounted = false;
    };
  }, [refresh]);

  // Countdown timer baseado em timestamp absoluto
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    if (!state.nextAvailableTs) return;

    timerRef.current = setInterval(() => {
      const remaining = state.nextAvailableTs! - Date.now();

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;

        setState((p) => ({ ...p, countdownMs: null, countdown: null }));
        refresh();
        return;
      }

      setState((p) => ({
        ...p,
        countdownMs: remaining,
        countdown: formatCountdown(remaining),
      }));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [state.nextAvailableTs, refresh]);

  // Executa jogada
  const play = useCallback(async () => {
    if (!state.game || !state.canPlay || state.isPlaying) return null;

    setState((p) => ({ ...p, isPlaying: true, statusMessage: "Jogando..." }));

    try {
      const res = await transport.play(Number(state.game.id));
      return res;
    } catch (e: any) {
      setState((p) => ({
        ...p,
        statusMessage: e?.message ?? "Falha ao jogar",
      }));
      return null;
    } finally {
      setState((p) => ({ ...p, isPlaying: false }));
    }
  }, [transport, state.game, state.canPlay, state.isPlaying]);

  return {
    ...state,
    refresh,
    play,
    transport,
    miniGamesStore,
    playerStore,
  };
}
