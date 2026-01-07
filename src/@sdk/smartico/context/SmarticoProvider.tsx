"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { bootSmartico } from "@/@sdk/smartico/infra/boot";
import { createSmarticoTransport } from "@/@sdk/smartico";
import { createStoreItemsStore } from "@/@sdk/smartico/services/storeItemsStore";
import { createUserProfileStore } from "@/@sdk/smartico/services/userProfileStore";
import { createMiniGamesStore } from "@/@sdk/smartico";
import type { Transport } from "@/@sdk/smartico/infra/transport/transport.type";
import type { StoreItemsStore } from "@/@sdk/smartico/services/storeItemsStore";
import type { UserProfileStore } from "@/@sdk/smartico/services/userProfileStore";
import type { MiniGamesStore } from "@/@sdk/smartico/services/miniGamesStore";

type SmarticoContextValue = {
  smartico: any | null;
  isReady: boolean;
  error: string | null;
  
  transport: Transport | null;
  storeItemsStore: StoreItemsStore | null;
  userProfileStore: UserProfileStore | null;
  miniGamesStore: MiniGamesStore | null;
  
  // Novo: indica se stores já carregaram dados iniciais
  storesReady: boolean;
};

const SmarticoContext = createContext<SmarticoContextValue | null>(null);

export function SmarticoProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  
  const [smartico, setSmartico] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [storesReady, setStoresReady] = useState(false);

  const userId = searchParams.get("uid") || "test-user";
  const language = searchParams.get("lang") || "pt";

  // Boot do Smartico
  useEffect(() => {
    const labelKey = process.env.NEXT_PUBLIC_SMARTICO_LABEL_KEY!;
    const brandKey = process.env.NEXT_PUBLIC_SMARTICO_BRAND_KEY!;
    const scriptUrl = process.env.NEXT_PUBLIC_SMARTICO_SCRIPT_URL!;
    const allowLocalhost = process.env.NEXT_PUBLIC_SMARTICO_ALLOW_LOCALHOST === "true";

    if (!labelKey || !brandKey || !scriptUrl) {
      setError("Faltam env vars NEXT_PUBLIC_SMARTICO_*");
      return;
    }

    bootSmartico({
      scriptUrl,
      labelKey,
      brandKey,
      userId,
      language,
      allowLocalhost,
      debug: false,
    })
      .then(() => {
        const smarticoInstance = (window as any)._smartico;
        
        if (!smarticoInstance?.api) {
          throw new Error("window._smartico.api não encontrado após boot");
        }
        
        setSmartico(() => smarticoInstance);
      })
      .catch((e) => {
        console.error("[Smartico] Boot failed:", e);
        setError(e?.message ?? "Erro ao iniciar Smartico");
      });
  }, [userId, language]);

  // Cria Transport e Stores
  const transport = useMemo(() => {
    if (!smartico) return null;
    return createSmarticoTransport(smartico, false);
  }, [smartico]);

  const storeItemsStore = useMemo(() => {
    if (!transport) return null;
    return createStoreItemsStore(transport, false);
  }, [transport]);

  const userProfileStore = useMemo(() => {
    if (!transport) return null;
    return createUserProfileStore(transport, false);
  }, [transport]);

  const miniGamesStore = useMemo(() => {
    if (!transport) return null;
    return createMiniGamesStore(transport, false);
  }, [transport]);

  // ✅ NOVO: Faz fetch inicial nas stores quando são criadas
  useEffect(() => {
    if (!storeItemsStore || !userProfileStore || !miniGamesStore) {
      return;
    }

    let mounted = true;

    (async () => {
      try {
        console.log("🚀 [SmarticoProvider] Loading initial data...");
        
        // Carrega dados em paralelo
        await Promise.all([
          storeItemsStore.fetch(),
          userProfileStore.fetch(),
          miniGamesStore.refresh(),
        ]);

        console.log(await Promise.all([
          storeItemsStore.fetch(),
          userProfileStore.fetch(),
          miniGamesStore.refresh(),
        ]))

        if (mounted) {
          console.log("✅ [SmarticoProvider] Initial data loaded!");
          setStoresReady(true);
        }
      } catch (e) {
        console.error("❌ [SmarticoProvider] Failed to load initial data:", e);
        if (mounted) {
          setError("Erro ao carregar dados iniciais");
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [storeItemsStore, userProfileStore, miniGamesStore]);

  const value: SmarticoContextValue = {
    smartico,
    isReady: !!smartico,
    error,
    transport,
    storeItemsStore,
    userProfileStore,
    miniGamesStore,
    storesReady,
  };

  return (
    <SmarticoContext.Provider value={value}>
      {children}
    </SmarticoContext.Provider>
  );
}

export function useSmartico() {
  const context = useContext(SmarticoContext);
  
  if (!context) {
    throw new Error("useSmartico deve ser usado dentro de SmarticoProvider");
  }
  
  return context;
}