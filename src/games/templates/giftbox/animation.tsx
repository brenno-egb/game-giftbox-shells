"use client";

import { useEffect, useRef } from "react";
import BaseLottie, { LottieInstance } from "@/games/core/lib/useLottie";

type Props = {
  path: string;
  isOpen: boolean;
  onOpenComplete?: () => void;
  className?: string;
};

export default function GiftboxChestLottie({
  path,
  isOpen,
  onOpenComplete,
  className,
}: Props) {
  const animRef = useRef<LottieInstance | null>(null);
  const completedOnceRef = useRef(false);

  // Idle loop (frames 0–15)
  useEffect(() => {
    const anim = animRef.current;
    if (!anim) return;

    completedOnceRef.current = false;

    try {
      anim.loop = true;
      anim.playSegments?.([0, 15], true);
    } catch {
      anim.loop = true;
      anim.play?.();
    }
  }, [path]);

  // Open (frames 16–30) uma vez
  useEffect(() => {
    const anim = animRef.current;
    if (!anim || !isOpen) return;

    completedOnceRef.current = false;

    const handleComplete = () => {
      if (completedOnceRef.current) return;
      completedOnceRef.current = true;
      onOpenComplete?.();
      anim.removeEventListener?.("complete", handleComplete);
    };

    try {
      anim.loop = false;
      anim.addEventListener?.("complete", handleComplete);
      anim.playSegments?.([16, 30], true);
    } catch {
      anim.loop = false;
      anim.addEventListener?.("complete", handleComplete);
      anim.goToAndPlay?.(0, true);
    }

    return () => anim.removeEventListener?.("complete", handleComplete);
  }, [isOpen, onOpenComplete]);

  return (
    <BaseLottie
      path={path}
      loop
      play
      className={className}
      style={{ width: 170, height: 140 }}
      onReady={(inst) => (animRef.current = inst)}
    />
  );
}
