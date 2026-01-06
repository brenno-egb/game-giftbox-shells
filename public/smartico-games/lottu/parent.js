window.__SMARTICO_GAMES__ = {
  baseUrl: "http://localhost:3000",
  debug: true,
  
  routesByItemId: {
    6136: { slug: "giftbox", skin: "emerald" },
  },
  
  templateIds: [7070],
  
  user: {
    getUserId: () => window._smartico_user_id,
    getLanguage: () => window._smartico_language || "pt",
  },
  
  watcher: {
    autoStart: true,
    openCooldownMs: 2000,
  },
  
  messaging: {
    allowAnyOrigin: true,
  },
};