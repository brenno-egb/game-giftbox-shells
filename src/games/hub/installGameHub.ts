import { getGameEntry, resolveGameRoute } from "@/games/registry";

type OpenArgs = {
  key: string;
  // opcional: pra abrir direto já com contexto
  uid?: string;
  lang?: string;
  skin?: string;
};

type GameHubApi = {
  open: (args: OpenArgs) => { ok: true } | { ok: false; message: string };
  exists: (key: string) => boolean;
  list: () => Promise<string[]>;
};

declare global {
  interface Window {
    GameHub?: GameHubApi;
  }
}

export function installGameHub() {
  if (typeof window === "undefined") return;

  const api: GameHubApi = {
    open: ({ key, uid, lang, skin }) => {
      const entry = getGameEntry(key);
      if (!entry) return { ok: false, message: "Jogo não existe." };

      const url = new URL(resolveGameRoute(entry), window.location.origin);
      if (uid) url.searchParams.set("uid", uid);
      if (lang) url.searchParams.set("lang", lang);
      if (skin) url.searchParams.set("skin", skin);

      // se quiser overlay depois, a gente troca o "navegar" por evento
      try {
        window.top?.location.assign(url.toString());
        return { ok: true };
      } catch {
        // fallback
        window.location.assign(url.toString());
        return { ok: true };
      }
    },

    exists: (key) => !!getGameEntry(key),
    list: async () => Object.keys((await (import("@/games/registry"))).gamesRegistry),
  };

  try {
    (window.top as any).GameHub = api;
  } catch {
    window.GameHub = api;
  }
}
