"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { bootSmartico } from "../infra/boot";

type SmarticoContextValue = {
  smartico: any | null;
  isReady: boolean;
  error: string | null;
};

const SmarticoContext = createContext<SmarticoContextValue | null>(null);

type ProviderProps = {
  children: ReactNode;
  defaultUserId?: string;
  defaultLanguage?: string;
};

export function SmarticoProvider({
  children,
  defaultUserId = "test-user",
  defaultLanguage = "pt",
}: ProviderProps) {
  const searchParams = useSearchParams();
  const [smartico, setSmartico] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const userId = searchParams.get("uid") || defaultUserId;
  const language = searchParams.get("lang") || defaultLanguage;

  useEffect(() => {
    const labelKey = process.env.NEXT_PUBLIC_SMARTICO_LABEL_KEY;
    const brandKey = process.env.NEXT_PUBLIC_SMARTICO_BRAND_KEY;
    const scriptUrl = process.env.NEXT_PUBLIC_SMARTICO_SCRIPT_URL;
    const allowLocalhost =
      process.env.NEXT_PUBLIC_SMARTICO_ALLOW_LOCALHOST === "true";

    if (!labelKey || !brandKey || !scriptUrl) {
      setError("Missing Smartico configuration");
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
        const instance = (window as any)._smartico;
        if (!instance?.api) {
          throw new Error("Smartico API not available after boot");
        }
        setSmartico(() => instance);
      })
      .catch((e) => {
        setError(e?.message ?? "Failed to initialize Smartico");
      });
  }, [userId, language]);

  return (
    <SmarticoContext.Provider value={{ smartico, isReady: !!smartico, error }}>
      {children}
    </SmarticoContext.Provider>
  );
}

export function useSmartico(): SmarticoContextValue {
  const context = useContext(SmarticoContext);
  if (!context) {
    throw new Error("useSmartico must be used within SmarticoProvider");
  }
  return context;
}