"use client";

import { useMemo } from "react";
import { useMiniGame } from "./useMiniGame";
import { getAttemptsDisplay } from "../../domain/formatting";

/**
 * Hook específico para jogos tipo wheel/giftbox
 * Adiciona attemptsDisplay sobre o useMiniGame base
 */
export function useWheelGame({
  smartico,
  templateId,
}: {
  smartico: any;
  templateId: number | string;
}) {
  const base = useMiniGame({ smartico, templateId });
  const attemptsDisplay = useMemo(
    () => getAttemptsDisplay(base.game, base.playerInfo, base.countdown),
    [base.game, base.playerInfo, base.countdown]
  );

  return { ...base, attemptsDisplay };
}
