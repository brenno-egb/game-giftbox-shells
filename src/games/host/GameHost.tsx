"use client";

import { useEffect, useMemo, useState } from "react";
import type { GameKey } from "@/games/registry";
import { gamesRegistry } from "@/games/registry";
import GameRenderer from "@/games/host/GameRenderer.client";
import { bootSmartico, resetSmarticoBootForDev } from "@/lib/smartico/boot";

type Props = {
  gameKey: GameKey;
  userId: string;
  language: string;
  skinId?: string;
};

export default function GameHost({ gameKey, userId, language, skinId }: Props) {
  const [smartico, setSmartico] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [step, setStep] = useState<string>("idle");

  const entry = gamesRegistry[gameKey];

  const resolvedSkin = useMemo(() => {
    const id = skinId ?? entry.defaultSkinId;
    return (entry.skins as any)[id] ?? (entry.skins as any)[entry.defaultSkinId];
  }, [entry, skinId]);

  useEffect(() => {
    setErr(null);
    setSmartico(null);

    const labelKey = process.env.NEXT_PUBLIC_SMARTICO_LABEL_KEY!;
    const brandKey = process.env.NEXT_PUBLIC_SMARTICO_BRAND_KEY!;
    const scriptUrl = process.env.NEXT_PUBLIC_SMARTICO_SCRIPT_URL!;
    const allowLocalhost =
      process.env.NEXT_PUBLIC_SMARTICO_ALLOW_LOCALHOST === "true";

    if (!labelKey || !brandKey || !scriptUrl) {
      setErr("Faltam env vars NEXT_PUBLIC_SMARTICO_*");
      return;
    }

    if (process.env.NODE_ENV === "development") {
      resetSmarticoBootForDev();
    }

    bootSmartico({
      scriptUrl,
      labelKey,
      brandKey,
      userId,
      language,
      allowLocalhost,
      debug: true,
      onStep: setStep,
    })
      .then((s) => setSmartico(() => s))
      .catch((e) => {
        console.error("[HOST] boot error", e);
        setErr(e?.message ?? "Erro ao iniciar Smartico");
      });
  }, [userId, language]);

  if (err) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Erro</div>
        <pre style={{ whiteSpace: "pre-wrap" }}>{err}</pre>
      </div>
    );
  }

  if (!smartico) {
    return (
      <div style={{ padding: 24 }}>
        Carregando Smartico…
        <div style={{ opacity: 0.7, marginTop: 8, fontSize: 12 }}>
          step: {step}
        </div>
      </div>
    );
  }

  return (
    <GameRenderer
      gameKey={gameKey}
      smartico={smartico}
      templateId={entry.templateId}
      skin={resolvedSkin}
    />
  );
}
