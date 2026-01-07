"use client";

import { useMemo } from "react";
import type { GameKey } from "@/games/registry";
import { gamesRegistry } from "@/games/registry";
import GameRenderer from "@/games/host/GameRenderer.client";
import { useSmartico } from "@/@sdk/smartico/context/SmarticoProvider";
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

  const resolvedTemplateId = useMemo(() => {
    return resolvedSkin.templateId ?? entry.templateId;
  }, [resolvedSkin, entry.templateId]);

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Erro</div>
        <pre style={{ whiteSpace: "pre-wrap" }}>{error}</pre>
      </div>
    );
  }

  if (!isReady || !smartico) {
    return (
      <div style={{ padding: 24 }}>
        Carregando Smartico…
      </div>
    );
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