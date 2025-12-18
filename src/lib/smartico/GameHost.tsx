"use client";

import { useEffect, useState } from "react";
import { bootSmartico } from "./boot";
import GiftboxGame from "@/games/templates/giftbox/GiftboxGame";
import { giftboxSkins } from "@/games/templates/giftbox/skins";

export default function GameHost({ game, userId, language }: any) {
  const [smartico, setSmartico] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [step, setStep] = useState<string>("idle");

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

    // ✅ DEV: garante que não fica preso numa promise antiga do HMR
    if (process.env.NODE_ENV === "development") {
      (window as any).__smarticoInitPromise = undefined;
      // opcional: remove script pra recomeçar limpo
      document.querySelector('script[data-smartico="1"]')?.remove();
      // não é obrigatório apagar _smartico, mas ajuda em debug
      // delete (window as any)._smartico;
    }

    console.log("[HOST] boot start", {
      userId,
      language,
      allowLocalhost,
      scriptUrl,
    });

    bootSmartico({
      scriptUrl,
      labelKey,
      brandKey,
      userId,
      language,
      allowLocalhost,
      debug: true,
      onStep: (s: string) => setStep(s),
    })
      .then(async (s) => {
        console.log("[HOST] boot resolved", s);
        const games = await s.api.getMiniGames();
        console.log("[HOST] getMiniGames OK, count:", games?.length);

        // ✅ IMPORTANTE: _smartico é function -> envolver!
        setSmartico(() => s);
      })
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

  if (game.template === "giftbox") {
    const skin = giftboxSkins[game.skinId];
    return (
      <GiftboxGame
        smartico={smartico}
        templateId={game.templateId}
        skin={skin}
      />
    );
  }

  return <div style={{ padding: 24 }}>Template não suportado.</div>;
}
