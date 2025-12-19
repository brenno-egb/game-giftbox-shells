// src/games/core/hooks/useMiniGame.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSmarticoClient, formatCountdown } from "@/lib/smartico/client";

type State = {
  game: any | null;
  playerInfo: any | null;
  canPlay: boolean;
  statusMessage: string;
  nextAvailableTs: number | null;

  countdownMs: number | null;
  countdown: string | null;

  isLoading: boolean;
  isPlaying: boolean;
  error: string | null;
};

export function useMiniGame({
  smartico,
  templateId,
  onTemplatesUpdate,
}: {
  smartico: any;
  templateId: number | string;
  onTemplatesUpdate?: (items: any[]) => void; // opcional (Smartico onUpdate)
}) {
  const client = useMemo(() => createSmarticoClient(smartico), [smartico]);

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

  const refresh = useCallback(async () => {
    const s = await client.loadState(templateId, {
      onUpdate: onTemplatesUpdate,
    });

    const countdownMs =
      s.nextAvailableTs && s.nextAvailableTs > Date.now()
        ? s.nextAvailableTs - Date.now()
        : null;

    setState((prev) => ({
      ...prev,
      game: s.game,
      playerInfo: s.playerInfo,
      canPlay: s.canPlay,
      statusMessage: s.status,
      nextAvailableTs: s.nextAvailableTs,
      countdownMs,
      countdown: countdownMs ? formatCountdown(countdownMs) : null,
    }));
  }, [client, templateId, onTemplatesUpdate]);

  // load inicial
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setState((p) => ({ ...p, isLoading: true, error: null }));
        await refresh();
      } catch (e: any) {
        if (!mounted) return;
        setState((p) => ({
          ...p,
          isLoading: false,
          error: e?.message ?? "Erro ao carregar",
          statusMessage: e?.message ?? "Erro ao carregar",
        }));
      } finally {
        if (mounted) setState((p) => ({ ...p, isLoading: false }));
      }
    })();

    return () => {
      mounted = false;
    };
  }, [refresh]);

  // countdown baseado em timestamp absoluto (não drift)
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
      const res = await client.play(state.game.id);
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
  }, [client, state.game, state.canPlay, state.isPlaying]);

  return {
    ...state,
    refresh,
    play,
    smarticoClient: client,
  };
}
