"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { getGameEntry, listGames } from "@/games/registry";
import GameHost from "@/games/host/GameHost";

type OpenArgs = {
  key: string;
  uid?: string;
  lang?: string;
  skin?: string;
};

type HubApi = {
  open: (args: OpenArgs) => { ok: true } | { ok: false; message: string };
  close: () => void;
  exists: (key: string) => boolean;
  list: () => string[];
};

declare global {
  interface Window {
    GameHub?: HubApi;
  }
}

export default function GamesBridgeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openArgs, setOpenArgs] = useState<OpenArgs | null>(null);

  const close = useCallback(() => setOpenArgs(null), []);

  const api: HubApi = useMemo(
    () => ({
      open: (args) => {
        const entry = getGameEntry(args.key);
        if (!entry) return { ok: false, message: "Jogo não existe." };
        setOpenArgs(args);
        return { ok: true };
      },
      close,
      exists: (key) => !!getGameEntry(key),
      list: () => listGames(),
    }),
    [close]
  );

  useEffect(() => {
    // tenta instalar no window.top (se não der, instala no window mesmo)
    try {
      (window.top as any).GameHub = api;
    } catch {
      window.GameHub = api;
    }

    return () => {
      try {
        if ((window.top as any).GameHub === api)
          (window.top as any).GameHub = undefined;
      } catch {}
      if (window.GameHub === api) window.GameHub = undefined;
    };
  }, [api]);

  return (
    <>
      {children}

      {openArgs && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="absolute inset-0">
            <GameHost
              gameKey={openArgs.key}
              userId={openArgs.uid}
              language={openArgs.lang}
              skinId={openArgs.skin}
              onClose={close}
            />
          </div>

          {/* botão fechar opcional */}
          <button
            type="button"
            onClick={close}
            className="absolute right-3 top-3 rounded-xl bg-white/10 px-3 py-2 text-white/90 hover:bg-white/15"
          >
            Fechar
          </button>
        </div>
      )}
    </>
  );
}
