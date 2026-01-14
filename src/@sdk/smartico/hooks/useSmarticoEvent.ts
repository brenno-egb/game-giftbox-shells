"use client";

import { useEffect, useRef } from "react";
import { useSmartico } from "../context/SmarticoProvider";

type SmarticoEvent = 
  | "init"
  | "identify"
  | "props_change"
  | "login"
  | "logout"
  | "gf_starting"
  | "gf_closing"
  | "gf_ux";

/**
 * Hook para escutar eventos da Smartico
 * Gerencia subscribe/unsubscribe automaticamente
 * 
 * @example
 * useSmarticoEvent("props_change", (props) => {
 *   console.log("Props mudaram:", props);
 *   refresh();
 * });
 */
export function useSmarticoEvent<T = any>(
  event: SmarticoEvent,
  callback: (data: T) => void
) {
  const { smartico } = useSmartico();
  const callbackRef = useRef(callback);

  // Mantém referência atualizada do callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!smartico) return;

    const handler = (data: T) => {
      callbackRef.current(data);
    };

    // Subscribe
    smartico.on(event, handler);

    // Unsubscribe on cleanup
    return () => {
      smartico.off(event, handler);
    };
  }, [smartico, event]);
}

export function usePropsChange(callback: (props: any) => void) {
  useSmarticoEvent("props_change", callback);
}