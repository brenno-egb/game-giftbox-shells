"use client";

import { useMemo } from "react";
import { useMiniGame } from "./useMiniGame";
import { getAttemptsDisplay } from "@/@sdk/smartico";

type UseWheelGameOptions = {
  smartico: any;
  templateId: number | string;
};

export function useWheelGame({ smartico, templateId }: UseWheelGameOptions) {
  const base = useMiniGame({ smartico, templateId });

  const attemptsDisplay = useMemo(
    () => getAttemptsDisplay(base.game, base.playerInfo, base.countdown),
    [base.game, base.playerInfo, base.countdown]
  );

  return { ...base, attemptsDisplay };
}