"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

export type RiveInstance = import("@rive-app/canvas").Rive;

type RiveAnimations = string | string[];
type RiveStateMachines = string | string[];
type RiveOnStateChange = (event: any) => void;

type Props = {
  path: string;

  animations?: RiveAnimations;

  stateMachines?: RiveStateMachines;

  artboard?: string;

  play?: boolean;

  className?: string;
  style?: React.CSSProperties;

  onReady?: (inst: RiveInstance) => void;

  onStateChange?: RiveOnStateChange;
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

  const params = useMemo(
    () =>
      ({
        src: path,
        artboard,
        animations,
        stateMachines,
        autoplay: true,
        layout,
        ...(onStateChange ? { onStateChange } : {}),
      } as any),
    [path, artboard, animations, stateMachines, layout, onStateChange]
  );

  const { rive, RiveComponent } = useRive(params);

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

  return <RiveComponent className={className} style={style} />;
}
