"use client";

import { useEffect, useRef } from "react";
import Lottie from "react-lottie-player";

export type LottieInstance = any;

type Props = {
  path?: string;
  animationData?: any;
  loop?: boolean;
  play?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onReady?: (inst: LottieInstance) => void;
  onComplete?: () => void;
};

export default function BaseLottie({
  path,
  animationData,
  loop = true,
  play = true,
  className,
  style,
  onReady,
  onComplete,
}: Props) {
  const instRef = useRef<LottieInstance | null>(null);

  useEffect(() => {
    if (instRef.current) onReady?.(instRef.current);
  }, [onReady, path, animationData]);

  useEffect(() => {
    const inst = instRef.current;
    if (!inst?.addEventListener || !onComplete) return;

    inst.addEventListener("complete", onComplete);
    return () => {
      try {
        inst.removeEventListener("complete", onComplete);
      } catch {}
    };
  }, [onComplete, path, animationData]);

  return (
    <Lottie
      ref={instRef}
      path={path}
      animationData={animationData}
      loop={loop}
      play={play}
      className={className}
      style={style}
    />
  );
}
