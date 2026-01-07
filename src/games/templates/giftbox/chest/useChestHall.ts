"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSmartico } from "@/@sdk/smartico/context/SmarticoProvider";
import { createSmarticoTransport } from "@/@sdk/smartico";
import { createStoreItemsStore } from "@/@sdk/smartico/services/storeItemsStore";
import { createUserProfileStore } from "@/@sdk/smartico/services/userProfileStore";
import { createMiniGamesStore } from "@/@sdk/smartico";
import { UserProfile } from "@/@sdk/smartico";
import { filterChests, enrichChestsWithGameData, categorizeChests, hasAnyAvailableChest } from "@/games/templates/giftbox/chest/chest.rules";
import type { ChestItem } from "@/games/templates/giftbox/chest/chest.types";
import type { MiniGameTemplate } from "@/@sdk/smartico";

type State = {
  chests: ChestItem[];
  available: ChestItem[];
  purchasable: ChestItem[];
  locked: ChestItem[];

  profile: UserProfile | null;
  games: MiniGameTemplate[];

  hasAvailable: boolean;
  isLoading: boolean;
  error: string | null;
};

/**
 * Hook para o Hall dos Baús
 * Boot completo garante que setup interno já completou
 */
export function useChestHall() {
  const { smartico } = useSmartico();

  // Cria transport e stores localmente
  const transport = useMemo(
    () => smartico ? createSmarticoTransport(smartico, false) : null,
    [smartico]
  );

  const storeItemsStore = useMemo(
    () => transport ? createStoreItemsStore(transport, false) : null,
    [transport]
  );

  const userProfileStore = useMemo(
    () => transport ? createUserProfileStore(transport, false) : null,
    [transport]
  );

  const miniGamesStore = useMemo(
    () => transport ? createMiniGamesStore(transport, false) : null,
    [transport]
  );

  const [state, setState] = useState<State>({
    chests: [],
    available: [],
    purchasable: [],
    locked: [],
    profile: null,
    games: [],
    hasAvailable: false,
    isLoading: true,
    error: null,
  });

  const computeState = useCallback(
    (
      storeItems: any[],
      games: MiniGameTemplate[],
      profile: UserProfile | null
    ) => {
      const chests = filterChests(storeItems);
      const enrichedChests = enrichChestsWithGameData(chests, games, profile);
      const categorized = categorizeChests(enrichedChests);

      return {
        chests: enrichedChests,
        ...categorized,
        profile,
        games,
        hasAvailable: hasAnyAvailableChest(enrichedChests),
      };
    },
    []
  );

  const refresh = useCallback(async () => {
    if (!storeItemsStore || !userProfileStore || !miniGamesStore) {
      return;
    }

    try {
      setState((p) => ({ ...p, isLoading: true, error: null }));

      // Chama em paralelo - boot já garantiu que setup completou
      const [items, profile, games] = await Promise.all([
        storeItemsStore.fetch(),
        userProfileStore.fetch(),
        miniGamesStore.refresh(),
      ]);

      const newState = computeState(items, games, profile);

      setState((prev) => ({
        ...prev,
        ...newState,
        isLoading: false,
      }));
    } catch (e: any) {
      setState((p) => ({
        ...p,
        isLoading: false,
        error: e?.message ?? "Erro ao carregar dados",
      }));
    }
  }, [storeItemsStore, userProfileStore, miniGamesStore, computeState]);

  // Load inicial
  useEffect(() => {
    if (!smartico) return;
    
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
        }));
      }
    })();

    return () => {
      mounted = false;
    };
  }, [smartico, refresh]);

  return {
    ...state,
    refresh,
  };
}