"use client";

import React, { useEffect, useMemo, useRef } from "react";
import {
  useRive,
  Layout,
  Fit,
  Alignment,
  type UseRiveParameters,
} from "@rive-app/react-canvas";

export type RiveInstance = import("@rive-app/canvas").Rive;

type Props = {
  /** caminho do .riv (ex: "/assets/games/giftbox/chest.riv") */
  path: string;

  /** se você usar animation timelines ao invés de state machine */
  animations?: UseRiveParameters["animations"];

  /** recomendado no seu caso (state machine com entry/isOpen/final) */
  stateMachines?: UseRiveParameters["stateMachines"];

  artboard?: string;

  /** equivalente ao seu "play" */
  play?: boolean;

  className?: string;
  style?: React.CSSProperties;

  onReady?: (inst: RiveInstance) => void;

  /** proxy útil se você quiser observar mudanças de estado externamente */
  onStateChange?: UseRiveParameters["onStateChange"];
};

export default function BaseRive({
  path,
  animations,
  stateMachines,
  artboard,
  play = true,
  className,
  style,
  onReady,
  onStateChange,
}: Props) {
  const readyOnceRef = useRef(false);

  const layout = useMemo(
    () => new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    []
  );

  const { rive, RiveComponent } = useRive({
    src: path,
    artboard,
    animations,
    stateMachines,
    autoplay: true,
    layout,
    onStateChange,
  });

  useEffect(() => {
    if (!rive || readyOnceRef.current) return;
    readyOnceRef.current = true;
    onReady?.(rive as unknown as RiveInstance);
  }, [rive, onReady, path]);

  useEffect(() => {
    if (!rive) return;
    if (play) rive.play();
    else rive.pause();
  }, [rive, play]);

  // ⚠️ IMPORTANTE: o canvas depende do tamanho do container.
  // Dê width/height via style/className ou wrapper.
  return <RiveComponent className={className} style={style} />;
}
