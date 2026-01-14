"use client";

import { useMemo } from "react";
import type { GameKey } from "@/@games/registry";
import { gamesRegistry } from "@/@games/registry";
import GameRenderer from "./GameRenderer.client";
import { useSmartico } from "@/@sdk/smartico";
import LoadingScreen from "@/components/games/giftbox/LoadingScreen";
import { ErrorState } from "@/components/games/giftbox/shared/StateComponents";
import type { BaseSkin } from "../core/types";

type Props = {
  gameKey: GameKey;
  skinId?: string;
};

export default function GameHost({ gameKey, skinId }: Props) {
  const { smartico, isReady, error } = useSmartico();
  const entry = gamesRegistry[gameKey];

  const resolvedSkin = useMemo((): BaseSkin => {
    const skins = entry.skins as Record<string, BaseSkin>;
    const id = skinId ?? entry.defaultSkinId;
    return skins[id] ?? skins[entry.defaultSkinId];
  }, [entry, skinId]);

  const resolvedTemplateId = useMemo(
    () => resolvedSkin.templateId ?? entry.templateId,
    [resolvedSkin, entry.templateId]
  );

  if (error) {
    return (
      <ErrorState
        title="Falha ao Inicializar"
        message={error}
        onRetry={() => window.location.reload()}
        retryLabel="Recarregar Página"
      />
    );
  }

  if (!isReady || !smartico) {
    return <LoadingScreen message="Inicializando Sistema" />;
  }

  return (
    <GameRenderer
      gameKey={gameKey}
      smartico={smartico}
      templateId={resolvedTemplateId}
      skin={resolvedSkin}
    />
  );
}