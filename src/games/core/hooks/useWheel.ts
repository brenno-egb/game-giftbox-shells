"use client";

import { useMemo } from "react";
import { useMiniGame } from "@/games/core/hooks/useMiniGame";
import { getAttemptsDisplay } from "@/games/core/utils/attemptsDisplay";

export function useWheelGame({ smartico, templateId }: { smartico: any; templateId: number | string }) {
  const base = useMiniGame({ smartico, templateId });

  const attemptsDisplay = useMemo(
    () => getAttemptsDisplay(base.game, base.playerInfo, base.countdown),
    [base.game, base.playerInfo, base.countdown]
  );

  return { ...base, attemptsDisplay };
}
