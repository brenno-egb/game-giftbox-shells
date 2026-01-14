"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSmartico } from "@/@sdk/smartico/context/SmarticoProvider";
import { usePropsChange } from "@/@sdk/smartico/hooks/useSmarticoEvent";
import { createSmarticoTransport } from "@/@sdk/smartico";
import { createStoreItemsStore } from "@/@sdk/smartico/services/storeItemsStore";
import { createUserProfileStore } from "@/@sdk/smartico/services/userProfileStore";
import { createUserLevelStore } from "@/@sdk/smartico/services/userLevelStore";
import { createMiniGamesStore } from "@/@sdk/smartico";
import { UserProfile, UserLevel } from "@/@sdk/smartico";
import {
  filterChests,
  enrichChestsWithGameData,
  categorizeChests,
  hasAnyAvailableChest,
} from "@/@games/templates/giftbox/chest/chest.rules";
import type { ChestItem } from "@/@games/templates/giftbox/chest/chest.types";
import type { MiniGameTemplate } from "@/@sdk/smartico";

type State = {
  chests: ChestItem[];
  available: ChestItem[];
  purchasable: ChestItem[];
  locked: ChestItem[];

  profile: UserProfile | null;
  level: UserLevel | null;
  games: MiniGameTemplate[];

  hasAvailable: boolean;
  isLoading: boolean;
  error: string | null;
};

export function useChestHall() {
  const { smartico } = useSmartico();

  const transport = useMemo(
    () => (smartico ? createSmarticoTransport(smartico, false) : null),
    [smartico]
  );

  const storeItemsStore = useMemo(
    () => (transport ? createStoreItemsStore(transport, false) : null),
    [transport]
  );

  const userProfileStore = useMemo(
    () => (transport ? createUserProfileStore(transport, false) : null),
    [transport]
  );

  const userLevelStore = useMemo(
    () => (transport ? createUserLevelStore(transport, false) : null),
    [transport]
  );

  const miniGamesStore = useMemo(
    () => (transport ? createMiniGamesStore(transport, false) : null),
    [transport]
  );

  const [state, setState] = useState<State>({
    chests: [],
    available: [],
    purchasable: [],
    locked: [],
    profile: null,
    level: null,
    games: [],
    hasAvailable: false,
    isLoading: true,
    error: null,
  });

  const computeState = useCallback(
    (
      storeItems: any[],
      games: MiniGameTemplate[],
      profile: UserProfile | null,
      level: UserLevel | null
    ) => {
      const chests = filterChests(storeItems);
      const enrichedChests = enrichChestsWithGameData(chests, games, profile);
      const categorized = categorizeChests(enrichedChests);

      return {
        chests: enrichedChests,
        ...categorized,
        profile,
        level,
        games,
        hasAvailable: hasAnyAvailableChest(enrichedChests),
      };
    },
    []
  );

  const refresh = useCallback(async () => {
    if (
      !storeItemsStore ||
      !userProfileStore ||
      !userLevelStore ||
      !miniGamesStore
    ) {
      return;
    }

    try {
      setState((p) => ({ ...p, isLoading: true, error: null }));

      const [items, profile, level, games] = await Promise.all([
        storeItemsStore.fetch(),
        userProfileStore.fetch(),
        userLevelStore.fetch(),
        miniGamesStore.refresh(),
      ]);

      const newState = computeState(items, games, profile, level);

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
  }, [
    storeItemsStore,
    userProfileStore,
    userLevelStore,
    miniGamesStore,
    computeState,
  ]);

  usePropsChange(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

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
