"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useSmartico,
  usePropsChange,
  createSmarticoTransport,
  createStoreItemsStore,
  createUserProfileStore,
  createUserLevelStore,
  createMiniGamesStore,
  type UserProfile,
  type UserLevel,
  type MiniGameTemplate,
} from "@/@sdk/smartico";
import type { ChestItem, CategorizedChests } from "./chest.types";
import {
  filterChests,
  enrichChestsWithGameData,
  categorizeChests,
  hasAnyAvailableChest,
} from "../chest/chest.rules";

type ChestHallState = CategorizedChests & {
  chests: ChestItem[];
  profile: UserProfile | null;
  level: UserLevel | null;
  games: MiniGameTemplate[];
  hasAvailable: boolean;
  isLoading: boolean;
  error: string | null;
};

const INITIAL_STATE: ChestHallState = {
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
};

export function useChestHall() {
  const { smartico } = useSmartico();
  const [state, setState] = useState<ChestHallState>(INITIAL_STATE);

  const transport = useMemo(
    () => (smartico ? createSmarticoTransport(smartico, false) : null),
    [smartico],
  );

  const stores = useMemo(() => {
    if (!transport) return null;
    return {
      storeItems: createStoreItemsStore(transport, false),
      userProfile: createUserProfileStore(transport, false),
      userLevel: createUserLevelStore(transport, false),
      miniGames: createMiniGamesStore(transport, false),
    };
  }, [transport]);

  const computeState = useCallback(
    (
      storeItems: any[],
      games: MiniGameTemplate[],
      profile: UserProfile | null,
      level: UserLevel | null,
    ): Omit<ChestHallState, "isLoading" | "error"> => {
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
    [],
  );

  const refresh = useCallback(async () => {
    if (!stores) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [items, profile, level, games] = await Promise.all([
        stores.storeItems.fetch(),
        stores.userProfile.fetch(),
        stores.userLevel.fetch(),
        stores.miniGames.refresh(),
      ]);

      const filteredItems = items.filter(item => item.priority === 9);

      const newState = computeState(filteredItems, games, profile, level);

      setState((prev) => ({ ...prev, ...newState, isLoading: false }));
    } catch (e: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: e?.message ?? "Erro ao carregar dados",
      }));
    }
  }, [stores, computeState]);

  usePropsChange(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  useEffect(() => {
    if (!smartico) return;

    let mounted = true;

    (async () => {
      try {
        await refresh();
      } catch (e: any) {
        if (!mounted) return;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: e?.message ?? "Erro ao carregar",
        }));
      }
    })();

    return () => {
      mounted = false;
    };
  }, [smartico, refresh]);

  return { ...state, refresh };
}
