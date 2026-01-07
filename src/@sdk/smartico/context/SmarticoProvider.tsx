"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { bootSmartico } from "@/@sdk/smartico/infra/boot";

type SmarticoContextValue = {
  smartico: any | null;
  isReady: boolean;
  error: string | null;
};

const SmarticoContext = createContext<SmarticoContextValue | null>(null);

/**
 * Provider MINIMALISTA
 * Só faz boot do Smartico - cada componente cria suas stores
 * Padrão GameHost
 */
export function SmarticoProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  
  const [smartico, setSmartico] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const userId = searchParams.get("uid") || "test-user";
  const language = searchParams.get("lang") || "pt";

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

  return (
    <SmarticoContext.Provider value={{ smartico, isReady: !!smartico, error }}>
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