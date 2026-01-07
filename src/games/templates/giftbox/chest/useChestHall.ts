"use client";

import { useCallback, useEffect, useState } from "react";
import { useSmartico } from "@/@sdk/smartico/context/SmarticoProvider";
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
 * Usa stores do Context + espera storesReady
 */
export function useChestHall() {
  const { storeItemsStore, userProfileStore, miniGamesStore, storesReady } = useSmartico();

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

  // Computa estado derivado
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

  // Subscribe nas stores (SÓ quando storesReady)
  useEffect(() => {
    if (!storeItemsStore || !userProfileStore || !miniGamesStore || !storesReady) {
      console.log("⏳ [useChestHall] Waiting for stores to be ready...", {
        storeItemsStore: !!storeItemsStore,
        userProfileStore: !!userProfileStore,
        miniGamesStore: !!miniGamesStore,
        storesReady,
      });
      return;
    }

    console.log("✅ [useChestHall] Stores ready, subscribing...");

    // Pega snapshots iniciais (já foram carregados pelo Provider!)
    const items = storeItemsStore.getSnapshot();
    const profile = userProfileStore.getSnapshot();
    const games = miniGamesStore.getSnapshot();
    console.log(profile)
    console.log("📊 [useChestHall] Initial snapshots:", {
      items: items.length,
      profile: profile ? "✅" : "❌",
      games: games.length,
    });

    // Computa estado inicial
    const initialState = computeState(items, games, profile);
    setState((prev) => ({ ...prev, ...initialState, isLoading: false }));

    // Subscribe para atualizações futuras
    const unsubItems = storeItemsStore.subscribe((items: any[]) => {
      const games = miniGamesStore.getSnapshot();
      const profile = userProfileStore.getSnapshot();
      const newState = computeState(items, games, profile);
      setState((prev) => ({ ...prev, ...newState, isLoading: false }));
    });

    const unsubProfile = userProfileStore.subscribe((profile: any) => {
      const items = storeItemsStore.getSnapshot();
      const games = miniGamesStore.getSnapshot();
      const newState = computeState(items, games, profile);
      setState((prev) => ({ ...prev, ...newState, isLoading: false }));
    });

    const unsubGames = miniGamesStore.subscribe((games: MiniGameTemplate[]) => {
      const items = storeItemsStore.getSnapshot();
      const profile = userProfileStore.getSnapshot();
      const newState = computeState(items, games, profile);
      setState((prev) => ({ ...prev, ...newState, isLoading: false }));
    });

    return () => {
      unsubItems();
      unsubProfile();
      unsubGames();
    };
  }, [storeItemsStore, userProfileStore, miniGamesStore, storesReady, computeState]);

  // Refresh manual
  const refresh = useCallback(async () => {
    if (!storeItemsStore || !userProfileStore || !miniGamesStore) {
      setState((p) => ({ ...p, error: "Stores não inicializadas" }));
      return;
    }

    try {
      setState((p) => ({ ...p, isLoading: true, error: null }));

      const [items, profile, games] = await Promise.all([
        storeItemsStore.fetch(true),
        userProfileStore.fetch(true),
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

  return {
    ...state,
    refresh,
  };
}