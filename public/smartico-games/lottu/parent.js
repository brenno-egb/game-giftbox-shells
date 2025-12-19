  window.__SMARTICO_GAMES__ = {
    baseUrl: "http://localhost:3000",
    debug: true,

    routesByItemId: {
      6136: { slug: "giftbox", skin: "classic" },
      // 7001: { slug: "wheel", skin: "neon" },
    },

    // como extrair uid/lang (normalmente esses globals já existem no host Smartico)
    user: {
      getUserId: () => window._smartico_user_id,
      getLanguage: () => window._smartico_language || "pt",
    },

    ui: {
      mode: "overlay",     // overlay | popup
      overlayInset: { top: 60, right: 16, bottom: 16, left: 16 },
    },

    watcher: {
      // abre o jogo quando detectar compra nova do item mapeado
      autoStart: true,
      // evita múltiplas aberturas por listas duplicadas (ms)
      openCooldownMs: 2000,
    },
  };