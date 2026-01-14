"use client";

import { useEffect, useRef } from "react";
import { useSmartico } from "../context/SmarticoProvider";

export type SmarticoEventType =
  | "init"
  | "identify"
  | "props_change"
  | "login"
  | "logout"
  | "gf_starting"
  | "gf_closing"
  | "gf_ux";

export function useSmarticoEvent<T = any>(
  event: SmarticoEventType,
  callback: (data: T) => void
): void {
  const { smartico } = useSmartico();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!smartico) return;

    const handler = (data: T) => callbackRef.current(data);
    smartico.on(event, handler);

    return () => {
      smartico.off(event, handler);
    };
  }, [smartico, event]);
}

export function usePropsChange(callback: (props: any) => void): void {
  useSmarticoEvent("props_change", callback);
}