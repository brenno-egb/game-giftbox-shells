"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createSmarticoTransport,
  createMiniGamesStore,
  createPlayerStore,
  useSmarticoEvent,
  computeCanPlay,
  computeStatus,
  computeNextAvailableTs,
  formatCountdown,
  type MiniGameTemplate,
  type PlayerInfo,
} from "@/@sdk/smartico";

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

const INITIAL_STATE: State = {
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
};

type UseMiniGameOptions = {
  smartico: any;
  templateId: number | string;
  onTemplatesUpdate?: (items: MiniGameTemplate[]) => void;
};

export function useMiniGame({
  smartico,
  templateId,
  onTemplatesUpdate,
}: UseMiniGameOptions) {
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

  const [state, setState] = useState<State>(INITIAL_STATE);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useSmarticoEvent(
    "props_change",
    useCallback(() => {
      refresh();
    }, [refresh])
  );

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
