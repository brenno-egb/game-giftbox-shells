// ✅ Adicionar apenas isso:
window.__SMARTICO_GAMES__ = {
  baseUrl: "http://localhost:3000",
  debug: true,
  routesByItemId: {
    6136: { slug: "giftbox", skin: "emerald" },
  },
  
  // ✅ NOVO: Config do FAB
  fab: {
    enabled: true,
    position: "bottom-right",
    text: "🎁 Abrir Prêmio",
    pulseAnimation: true,
  },
  
  watcher: { autoStart: true },
};