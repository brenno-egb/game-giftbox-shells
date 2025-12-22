"use client";

import { useCallback, useEffect, useRef } from "react";
import BaseRive, { type RiveInstance } from "@/games/core/lib/baseRive";
import { StateMachineInputType } from "@rive-app/react-canvas";

type Props = {
  path: string;
  isOpen: boolean;
  triggerFinal?: boolean;
  onOpenStart?: () => void;
  onOpenPeak?: () => void;
  onOpenComplete?: () => void;
  onFinalComplete?: () => void;
  className?: string;
};

const SM_NAME = "State Machine 2";
const OPEN_INPUT = "isOpen";
const FINAL_INPUT = "final";
const FINAL_STATE = "final";

const PEAK_ANIMATION_MS = 800; // quando já está bem aberto
const FALLBACK_MS = 2200;
const STATECHANGE_EVENT = "statechange";

function norm(x: unknown) {
  return String(x ?? "").trim().toLowerCase();
}

export default function GiftboxChestRive({
  path,
  isOpen,
  triggerFinal = false,
  onOpenStart,
  onOpenPeak,
  onOpenComplete,
  onFinalComplete,
  className,
}: Props) {
  const riveRef = useRef<RiveInstance | null>(null);
  const openedRef = useRef(false);
  const completedOnceRef = useRef(false);
  const peakFiredRef = useRef(false);
  const finalFiredRef = useRef(false);

  const onOpenStartRef = useRef(onOpenStart);
  const onOpenPeakRef = useRef(onOpenPeak);
  const onOpenCompleteRef = useRef(onOpenComplete);
  const onFinalCompleteRef = useRef(onFinalComplete);

  useEffect(() => {
    onOpenStartRef.current = onOpenStart;
    onOpenPeakRef.current = onOpenPeak;
    onOpenCompleteRef.current = onOpenComplete;
    onFinalCompleteRef.current = onFinalComplete;
  }, [onOpenStart, onOpenPeak, onOpenComplete, onFinalComplete]);

  const fallbackTimerRef = useRef<number | null>(null);
  const peakTimerRef = useRef<number | null>(null);
  const detachRef = useRef<null | (() => void)>(null);

  const clearFallback = useCallback(() => {
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  const clearPeak = useCallback(() => {
    if (peakTimerRef.current) {
      window.clearTimeout(peakTimerRef.current);
      peakTimerRef.current = null;
    }
  }, []);

  const fireCompleteOnce = useCallback(() => {
    if (completedOnceRef.current) return;
    completedOnceRef.current = true;
    clearFallback();
    onOpenCompleteRef.current?.();
  }, [clearFallback]);

  const firePeakOnce = useCallback(() => {
    if (peakFiredRef.current) return;
    peakFiredRef.current = true;
    clearPeak();
    onOpenPeakRef.current?.();
  }, [clearPeak]);

  const setOpenValue = useCallback((open: boolean) => {
    const rive: any = riveRef.current;
    if (!rive?.stateMachineInputs) return;

    try {
      const inputs = rive.stateMachineInputs(SM_NAME) ?? [];
      const input = inputs.find((i: any) => norm(i?.name) === norm(OPEN_INPUT));
      if (!input) return;

      if (input.type === StateMachineInputType.Trigger) {
        if (open) input.fire?.();
      } else if (input.type === StateMachineInputType.Boolean) {
        input.value = !!open;
      }
    } catch {}
  }, []);

  const setFinalValue = useCallback(() => {
    const rive: any = riveRef.current;
    if (!rive?.stateMachineInputs) return;

    try {
      const inputs = rive.stateMachineInputs(SM_NAME) ?? [];
      const input = inputs.find((i: any) => norm(i?.name) === norm(FINAL_INPUT));
      if (!input) return;

      if (input.type === StateMachineInputType.Trigger) {
        input.fire?.();
      } else if (input.type === StateMachineInputType.Boolean) {
        input.value = true;
      }
    } catch {}
  }, []);

  const attachStateChangeListener = useCallback(() => {
    const rive: any = riveRef.current;
    if (!rive) return;

    detachRef.current?.();
    detachRef.current = null;

    const handler = (evt: any) => {
      if (!openedRef.current) return;

      const data = evt?.data;
      const states: string[] = Array.isArray(data)
        ? data.map((x: any) => String(x))
        : typeof data === "string"
          ? [data]
          : [];

      const hitFinal = states.some((s) => {
        const v = norm(s);
        return v === norm(FINAL_STATE) || v.includes(norm(FINAL_STATE));
      });

      if (hitFinal) fireCompleteOnce();
    };

    try {
      if (typeof rive.on === "function") {
        rive.on(STATECHANGE_EVENT, handler);
        detachRef.current = () => {
          try {
            rive.off?.(STATECHANGE_EVENT, handler);
          } catch {}
        };
        return;
      }
    } catch {}

    try {
      if (typeof rive.addEventListener === "function") {
        rive.addEventListener(STATECHANGE_EVENT, handler);
        detachRef.current = () => {
          try {
            rive.removeEventListener?.(STATECHANGE_EVENT, handler);
          } catch {}
        };
      }
    } catch {}
  }, [fireCompleteOnce]);

  useEffect(() => {
    openedRef.current = false;
    completedOnceRef.current = false;
    peakFiredRef.current = false;
    finalFiredRef.current = false;
    clearFallback();
    clearPeak();
    setOpenValue(false);
  }, [path, setOpenValue, clearFallback, clearPeak]);

  useEffect(() => {
    if (!triggerFinal || finalFiredRef.current) return;
    
    finalFiredRef.current = true;
    setFinalValue();
    
    // Callback após um delay para a animação completar
    setTimeout(() => {
      onFinalCompleteRef.current?.();
    }, 800);
  }, [triggerFinal, setFinalValue]);

  useEffect(() => {
    if (!isOpen) return;

    openedRef.current = true;
    completedOnceRef.current = false;
    peakFiredRef.current = false;

    // Dispara callback de início imediatamente
    onOpenStartRef.current?.();

    setOpenValue(true);

    // Timer para o "pico" da abertura (quando já está bem aberto)
    clearPeak();
    peakTimerRef.current = window.setTimeout(() => {
      firePeakOnce();
    }, PEAK_ANIMATION_MS);

    // Fallback para garantir que complete
    clearFallback();
    fallbackTimerRef.current = window.setTimeout(() => {
      fireCompleteOnce();
    }, FALLBACK_MS);

    return () => {
      clearFallback();
      clearPeak();
    };
  }, [isOpen, setOpenValue, clearFallback, clearPeak, fireCompleteOnce, firePeakOnce]);

  useEffect(() => {
    return () => {
      clearFallback();
      clearPeak();
      detachRef.current?.();
      detachRef.current = null;
    };
  }, [clearFallback, clearPeak]);

  return (
    <BaseRive
      path={path}
      stateMachines={SM_NAME}
      className={className}
      style={{ width: 170, height: 140 }}
      onReady={(inst) => {
        riveRef.current = inst;
        attachStateChangeListener();
      }}
    />
  );
}