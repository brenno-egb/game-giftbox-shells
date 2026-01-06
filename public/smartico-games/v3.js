/* smartico-games v1.1-fab-FINAL - Resolve problema compra com localStorage */
(function () {
  "use strict";

  if (window.SmarticoGames && window.SmarticoGames.version) return;

  var OVERLAY_ID = "__smartico_games_overlay";
  var IFRAME_ID = "__smartico_games_iframe";
  var BTN_ID = "__smartico_games_close_btn";
  var FAB_ID = "__smartico_games_fab";
  var MSG_INSTALLED = "__smartico_games_msg_installed__";
  var STORAGE_KEY = "__smartico_games_cache__";

  // ---------------------------
  // Utils
  // ---------------------------
  function isObj(x) {
    return x && typeof x === "object" && !Array.isArray(x);
  }

  function deepMerge(target, src) {
    var out = target ? Object.assign({}, target) : {};
    if (!isObj(src)) return out;
    Object.keys(src).forEach(function (k) {
      var v = src[k];
      if (isObj(v) && isObj(out[k])) out[k] = deepMerge(out[k], v);
      else out[k] = v;
    });
    return out;
  }

  function nowMs() {
    return Date.now();
  }

  function sleep(ms) {
    return new Promise(function (r) {
      setTimeout(r, ms);
    });
  }

  function safeNum(v, fallback) {
    var n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : fallback || 0;
  }

  function enc(s) {
    return encodeURIComponent(String(s ?? ""));
  }

  function canAccessTop() {
    try {
      return !!(window.top && window.top.document && window.top.document.body);
    } catch (e) {
      return false;
    }
  }

  function getHostWindow() {
    return canAccessTop() ? window.top : window;
  }

  function originOf(url) {
    try {
      return new URL(String(url)).origin;
    } catch (e) {
      return "";
    }
  }

  // ---------------------------
  // Default config
  // ---------------------------
  var DEFAULT_CONFIG = {
    baseUrl: "",
    debug: false,
    routesByItemId: {},
    templateIds: [],
    templateIdByItemId: {}, // ✅ Mapeia itemId → templateId
    user: {
      getUserId: function () {
        return window._smartico_user_id;
      },
      getLanguage: function () {
        return window._smartico_language || "pt";
      },
    },
    ui: {
      mode: "overlay",
      mobileWidth: 414,
      mobileHeight: "100%",
      iframeAllow:
        "fullscreen; autoplay; clipboard-read; clipboard-write; payment; web-share",
    },
    watcher: {
      autoStart: false,
      openCooldownMs: 2000,
    },
    messaging: {
      allowAnyOrigin: false,
    },
    fab: {
      enabled: true,
      position: "bottom-right",
      text: "",
    },
  };

  var config = deepMerge(DEFAULT_CONFIG, window.__SMARTICO_GAMES__ || {});

  function log() {
    if (!config.debug) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift("[SmarticoGames]");
    console.log.apply(console, args);
  }

  function warn() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift("[SmarticoGames]");
    console.warn.apply(console, args);
  }

  function errLog() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift("[SmarticoGames]");
    console.error.apply(console, args);
  }

  // ---------------------------
  // Event emitter
  // ---------------------------
  var listeners = {};
  function on(event, fn) {
    listeners[event] = listeners[event] || [];
    listeners[event].push(fn);
    return function unsubscribe() {
      off(event, fn);
    };
  }
  function off(event, fn) {
    var arr = listeners[event] || [];
    listeners[event] = arr.filter(function (x) {
      return x !== fn;
    });
  }
  function emit(event, payload) {
    var arr = listeners[event] || [];
    arr.forEach(function (fn) {
      try {
        fn(payload);
      } catch (e) {
        errLog("listener error", event, e);
      }
    });
  }

  // ---------------------------
  // Smartico helpers
  // ---------------------------
  function getSmartico() {
    return window._smartico || null;
  }

  async function waitForSmartico(timeoutMs) {
    var t0 = nowMs();
    while (nowMs() - t0 < timeoutMs) {
      var s = getSmartico();
      if (s && s.api) return s;
      await sleep(50);
    }
    throw new Error("Timeout esperando window._smartico.api");
  }

  function findPurchasedFn(api) {
    return (
      api.getStorePurchasedItems ||
      api.getPurchasedStoreItems ||
      api.getStoreItemsPurchased ||
      api.getStorePurchased ||
      null
    );
  }

  function getUid() {
    try {
      return config.user.getUserId() || "test-user";
    } catch (e) {
      return "test-user";
    }
  }

  function getLang() {
    try {
      return config.user.getLanguage() || "pt";
    } catch (e) {
      return "pt";
    }
  }

  // ---------------------------
  // ✅ CACHE localStorage Inteligente
  // ---------------------------
  var GameCache = {
    get: function () {
      try {
        var data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
      } catch (e) {
        return {};
      }
    },

    set: function (cache) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
        return true;
      } catch (e) {
        return false;
      }
    },

    update: function (templateId, attempts, source) {
      var cache = this.get();
      var key = String(templateId);

      if (attempts > 0) {
        cache[key] = {
          attempts: attempts,
          lastSync: nowMs(),
          source: source || "unknown",
        };
      } else {
        delete cache[key];
      }

      this.set(cache);
      log("✅ Cache updated:", templateId, "→", attempts, "attempts (" + source + ")");
    },

    // ✅ Incrementa quando detecta compra
    increment: function (templateId) {
      var cache = this.get();
      var key = String(templateId);
      var current = cache[key];
      var newAttempts = current ? current.attempts + 1 : 1;

      this.update(templateId, newAttempts, "purchase");
      log("🛒 Purchase detected, incremented:", templateId, "→", newAttempts);
      return newAttempts;
    },

    // ✅ Decrementa quando joga
    decrement: function (templateId) {
      var cache = this.get();
      var key = String(templateId);
      var current = cache[key];

      if (!current || current.attempts <= 0) {
        log("⚠️ No attempts to decrement for:", templateId);
        return 0;
      }

      var newAttempts = current.attempts - 1;
      this.update(templateId, newAttempts, "postmessage");
      return newAttempts;
    },

    // ✅ Sync com API (só atualiza se API tiver mais)
    syncFromAPI: function (templateId, apiAttempts) {
      var cache = this.get();
      var key = String(templateId);
      var current = cache[key];

      // Se não tem cache, aceita API
      if (!current) {
        this.update(templateId, apiAttempts, "api");
        return apiAttempts;
      }

      // Se API tem mais, atualiza
      if (apiAttempts > current.attempts) {
        log("📥 API has more attempts, updating:", current.attempts, "→", apiAttempts);
        this.update(templateId, apiAttempts, "api");
        return apiAttempts;
      }

      // Senão, mantém cache (mais confiável)
      log("✅ Cache has more attempts than API, keeping cache:", current.attempts, "(API:", apiAttempts + ")");
      log("   (This is normal after purchase - API has 30s cache delay)");
      return current.attempts;
    },

    getFirstAvailable: function () {
      var cache = this.get();
      var templateIds = config.templateIds || [];
      var routesByItemId = config.routesByItemId || {};

      for (var i = 0; i < templateIds.length; i++) {
        var templateId = templateIds[i];
        var key = String(templateId);
        var cached = cache[key];

        if (cached && cached.attempts > 0) {
          var itemId = null;
          for (var id in routesByItemId) {
            itemId = id;
            break;
          }

          if (itemId) {
            return {
              templateId: templateId,
              itemId: itemId,
              slug: routesByItemId[itemId].slug,
              skin: routesByItemId[itemId].skin,
              attempts: cached.attempts,
              source: cached.source,
            };
          }
        }
      }

      return null;
    },

    clear: function () {
      this.set({});
      log("✅ Cache cleared");
    },
  };

  // ---------------------------
  // ✅ FAB
  // ---------------------------
  function createFAB() {
    var hostWin = getHostWindow();
    var doc = hostWin.document;

    var fab = doc.getElementById(FAB_ID);
    if (fab) return fab;

    fab = doc.createElement("button");
    fab.id = FAB_ID;
    fab.innerHTML =
      '<div style="position:relative; display:flex; justify-content: center; align-items: center;">' +
      '<img src="https://skullandbonestools.de/api/imagesservice?src=items%2FahPakTreasureChest&width=256" style="width: 46px; aspect-ratio: 1"/>' +
      '<span style="position: absolute; top: -8px; right: -6px; background: #e11e1e; border-radius: 100%; padding: 9px;"></span>' +
      "</div>";

    var baseStyle = {
      position: "fixed",
      bottom: "100px",
      right: "20px",
      zIndex: "2147483646",
      display: "none",
      alignItems: "center",
      padding: "6px 6px",
      borderRadius: "100%",
      border: "solid #c69810 2px",
      cursor: "pointer",
      background: "none",
      color: "white",
      transition: "all 0.3s ease",
    };

    Object.assign(fab.style, baseStyle);

    fab.onmouseover = function () {
      fab.style.transform = "scale(1.05)";
    };
    fab.onmouseout = function () {
      fab.style.transform = "scale(1)";
    };

    fab.onclick = function () {
      var game = GameCache.getFirstAvailable();
      if (!game) return;

      var route = (config.routesByItemId || {})[game.itemId];
      if (route) {
        open(route.slug, { skin: route.skin });
      }
    };

    doc.body.appendChild(fab);
    return fab;
  }

  function updateFAB() {
    if (!config.fab || !config.fab.enabled) return;

    var fab = createFAB();
    var game = GameCache.getFirstAvailable();

    if (game && game.attempts > 0) {
      fab.style.display = "flex";
      log("✅ FAB shown:", game.slug, "with", game.attempts, "attempts");
    } else {
      fab.style.display = "none";
      log("✅ FAB hidden - no games available");
    }
  }

  // ✅ Sync com API
  async function syncWithAPI() {
    try {
      var smartico = getSmartico();
      if (!smartico || !smartico.api) return;

      var games = await smartico.api.getMiniGames();
      if (!Array.isArray(games)) return;

      var templateIds = config.templateIds || [];
      if (!templateIds.length) return;

      log("🔄 Syncing with API...");

      var synced = 0;
      for (var i = 0; i < games.length; i++) {
        var game = games[i];
        var templateId = safeNum(game.id, 0);

        if (templateIds.indexOf(templateId) === -1) continue;

        var apiAttempts = safeNum(game.spin_count, 0);
        GameCache.syncFromAPI(templateId, apiAttempts);
        synced++;
      }

      log("✅ Sync completed:", synced, "games");
      updateFAB();
    } catch (err) {
      warn("Sync error:", err);
    }
  }

  // ---------------------------
  // Messaging
  // ---------------------------
  function isAllowedOrigin(evOrigin) {
    var allowAny =
      !!(config.messaging && config.messaging.allowAnyOrigin) && !!config.debug;
    if (allowAny) return true;
    var allowed = originOf(config.baseUrl);
    if (!allowed) return false;
    return evOrigin === allowed;
  }

  function createMessageRouter(hostWin) {
    var handlers = {};
    function onMsg(type, fn) {
      handlers[type] = handlers[type] || [];
      handlers[type].push(fn);
      return function offMsg() {
        handlers[type] = (handlers[type] || []).filter(function (x) {
          return x !== fn;
        });
      };
    }
    function handle(ev) {
      var msg = ev && ev.data;
      if (!msg || typeof msg !== "object") return;
      var t = msg.t;
      if (typeof t !== "string") return;
      if (t.indexOf("SG:") !== 0) return;
      if (!isAllowedOrigin(ev.origin)) {
        warn("Blocked message from origin:", ev.origin, t);
        return;
      }
      try {
        var frame = hostWin.document.getElementById(IFRAME_ID);
        if (frame && frame.contentWindow && ev.source !== frame.contentWindow) {
          warn("Blocked message: source != overlay iframe");
          return;
        }
      } catch (e) {}
      var list = handlers[t] || [];
      for (var i = 0; i < list.length; i++) {
        try {
          list[i](msg.p, ev);
        } catch (e) {
          errLog("msg handler error:", t, e);
        }
      }
    }
    return { on: onMsg, handle: handle };
  }

  var _msgRouter = null;

  function installMessagingOnce() {
    var hostWin = getHostWindow();
    if (hostWin[MSG_INSTALLED]) return;
    hostWin[MSG_INSTALLED] = true;

    _msgRouter = createMessageRouter(hostWin);

    _msgRouter.on("SG:REDIRECT", function (p) {
      if (!p || !p.url) return;
      var u;
      try {
        u = new URL(String(p.url));
        if (u.protocol !== "http:" && u.protocol !== "https:") return;
      } catch (e) {
        return;
      }
      if (String(p.mode) === "replace") hostWin.location.replace(u.toString());
      else hostWin.location.assign(u.toString());
    });

    _msgRouter.on("SG:HIDE_OVERLAY", function () {
      hideOverlay();
    });

    // ✅ SPIN_COMPLETED - Decrementa localStorage
    _msgRouter.on("SG:SPIN_COMPLETED", function (p) {
      if (!p || !p.templateId) {
        log("⚠️ SG:SPIN_COMPLETED sem templateId");
        return;
      }

      log("✅ Spin completed for template:", p.templateId);

      var remaining = GameCache.decrement(p.templateId);
      emit("spinCompleted", { templateId: p.templateId, remaining: remaining });

      updateFAB();
    });

    hostWin.addEventListener("message", _msgRouter.handle);
    log("messaging installed");
  }

  // ---------------------------
  // Overlay UI
  // ---------------------------
  function ensureOverlay() {
    var hostWin = getHostWindow();
    var doc = hostWin.document;

    var overlay = doc.getElementById(OVERLAY_ID);
    if (overlay) return { hostWin: hostWin, doc: doc, overlay: overlay };

    overlay = doc.createElement("div");
    overlay.id = OVERLAY_ID;

    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483647",
      display: "none",
      backgroundColor: "transparent",
      overflow: "hidden",
    });

    var close = doc.createElement("button");
    close.id = BTN_ID;
    close.textContent = "✕";
    Object.assign(close.style, {
      position: "fixed",
      top: "12px",
      right: "12px",
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      border: "0",
      cursor: "pointer",
      fontSize: "20px",
      fontWeight: "900",
      background: "rgba(255,255,255,.9)",
      zIndex: "2147483648",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    });
    close.onclick = function () {
      API.hide();
    };

    var frame = doc.createElement("iframe");
    frame.id = IFRAME_ID;

    var mobileWidth = config.ui.mobileWidth || 414;
    var mobileHeight = config.ui.mobileHeight || "100%";

    Object.assign(frame.style, {
      position: "fixed",
      border: "0",
      borderRadius: "0",
      boxShadow: "none",
      backgroundColor: "transparent",
      zIndex: "2147483647",
    });

    function applyResponsiveStyles() {
      var isMobile = hostWin.innerWidth <= 768;
      if (isMobile) {
        Object.assign(frame.style, {
          top: "0",
          left: "0",
          width: "100vw",
          height: "100vh",
          maxWidth: "100vw",
          maxHeight: "100vh",
          transform: "none",
        });
        Object.assign(close.style, { top: "8px", right: "8px" });
      } else {
        Object.assign(frame.style, {
          top: "0",
          left: "50%",
          width: mobileWidth + "px",
          height: mobileHeight,
          maxWidth: mobileWidth + "px",
          maxHeight: "100vh",
          transform: "translateX(-50%)",
        });
        Object.assign(close.style, {
          top: "12px",
          right: "calc(50% - " + (mobileWidth / 2 + 56) + "px)",
        });
      }
    }

    applyResponsiveStyles();

    var resizeTimeout;
    hostWin.addEventListener("resize", function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(applyResponsiveStyles, 100);
    });

    frame.setAttribute("allow", config.ui.iframeAllow || "");

    overlay.appendChild(frame);
    doc.body.appendChild(overlay);
    doc.body.appendChild(close);

    return { hostWin: hostWin, doc: doc, overlay: overlay };
  }

  function showOverlay(url) {
    var o = ensureOverlay();
    var doc = o.doc;
    var overlay = o.overlay;
    var frame = doc.getElementById(IFRAME_ID);
    var close = doc.getElementById(BTN_ID);

    overlay.style.display = "block";
    if (close) close.style.display = "block";

    doc.body.style.overflow = "hidden";
    doc.documentElement.style.overflow = "hidden";

    if (o.hostWin.innerWidth <= 768) {
      doc.body.style.position = "fixed";
      doc.body.style.width = "100%";
      doc.body.style.height = "100%";
    }

    frame.src = url;
    emit("open", { url: url });
  }

  function hideOverlay() {
    var hostWin = getHostWindow();
    var doc = hostWin.document;

    var overlay = doc.getElementById(OVERLAY_ID);
    var frame = doc.getElementById(IFRAME_ID);
    var close = doc.getElementById(BTN_ID);

    if (overlay) overlay.style.display = "none";
    if (close) close.style.display = "none";
    if (frame) frame.src = "about:blank";

    doc.body.style.overflow = "";
    doc.documentElement.style.overflow = "";
    doc.body.style.position = "";
    doc.body.style.width = "";
    doc.body.style.height = "";

    // ✅ Atualiza FAB ao fechar (se ainda tiver tentativas, aparece!)
    setTimeout(function() {
      updateFAB();
    }, 100);

    emit("hide", {});
  }

  try {
    installMessagingOnce();
  } catch (e) {
    errLog("messaging install failed:", e);
  }

  // ---------------------------
  // Open game
  // ---------------------------
  function buildGameUrl(slug, opts) {
    opts = opts || {};
    var baseUrl = (config.baseUrl || "").replace(/\/$/, "");
    if (!baseUrl) throw new Error("config.baseUrl não definido.");

    var uid = opts.uid || getUid();
    var lang = opts.lang || getLang();
    var skin = opts.skin;

    var url =
      baseUrl +
      "/games/" +
      enc(slug) +
      "?uid=" +
      enc(uid) +
      "&lang=" +
      enc(lang);

    if (skin) url += "&skin=" + enc(skin);
    return url;
  }

  function open(slug, opts) {
    var url = buildGameUrl(slug, opts);

    if ((config.ui.mode || "overlay") === "popup") {
      var w = window.open(url, "_blank", "noopener,noreferrer");
      if (!w) warn("Popup bloqueado");
      emit("open", { url: url, mode: "popup" });
      return;
    }

    showOverlay(url);
  }

  // ---------------------------
  // Purchases watcher
  // ---------------------------
  var watching = false;
  var openLockUntil = 0;
  var lastSeenByItemId = {};

  function maxPurchaseTsForItem(items, itemId) {
    var maxTs = 0;
    for (var i = 0; i < (items || []).length; i++) {
      var it = items[i];
      if (safeNum(it && it.id, -1) !== safeNum(itemId, -2)) continue;
      var ts = safeNum(it && it.purchase_ts, 0);
      if (ts > maxTs) maxTs = ts;
    }
    return maxTs;
  }

  function getMappedItemIds() {
    var map = config.routesByItemId || {};
    return Object.keys(map)
      .map(function (k) {
        return safeNum(k, 0);
      })
      .filter(Boolean);
  }

  function openFromPurchase(itemId, purchaseItem) {
    var route = (config.routesByItemId || {})[String(itemId)];
    if (!route || !route.slug) return;

    // ✅ INTELIGENTE: Descobre templateId (configurado ou fallback)
    var templateId = (config.templateIdByItemId || {})[String(itemId)];
    
    // Fallback: se não configurou templateIdByItemId, usa primeiro da lista
    if (!templateId) {
      var templateIds = config.templateIds || [];
      if (templateIds.length > 0) {
        templateId = templateIds[0];
        log("⚠️ templateIdByItemId não configurado, usando fallback:", templateId);
      }
    }

    if (templateId) {
      log("🛒 Purchase detected! Incrementing templateId:", templateId);
      GameCache.increment(templateId);
      updateFAB();
      log("✅ localStorage updated, FAB should appear now");
    } else {
      warn("❌ Não consegui descobrir templateId para itemId:", itemId);
      warn("Configure templateIdByItemId ou templateIds!");
    }

    log("✅ purchase detected => opening game", { itemId: itemId, route: route });

    emit("purchase", {
      itemId: itemId,
      purchaseItem: purchaseItem,
      route: route,
    });

    open(route.slug, { skin: route.skin });
  }

  async function watchPurchases(opts) {
    opts = opts || {};
    if (watching) return;

    watching = true;

    var smartico = await waitForSmartico(12000);
    var api = smartico.api;

    var fn = findPurchasedFn(api);
    if (!fn) {
      watching = false;
      throw new Error("Não achei função de 'purchased store items'");
    }

    var itemIds =
      opts.itemIds && opts.itemIds.length ? opts.itemIds : getMappedItemIds();

    try {
      var initial = await fn.call(api, {});
      if (Array.isArray(initial)) {
        itemIds.forEach(function (id) {
          lastSeenByItemId[id] = maxPurchaseTsForItem(initial, id) || 0;
        });
      }
    } catch (e) {}

    function onUpdate(items) {
      if (!watching) return;
      var t = nowMs();
      if (t < openLockUntil) return;

      itemIds.forEach(function (itemId) {
        var prev = safeNum(lastSeenByItemId[itemId], 0);
        var maxTs = maxPurchaseTsForItem(items, itemId);

        if (maxTs && maxTs > prev) {
          openLockUntil =
            nowMs() + safeNum(config.watcher.openCooldownMs, 2000);
          lastSeenByItemId[itemId] = maxTs;

          var newest = null;
          for (var i = 0; i < items.length; i++) {
            var it = items[i];
            if (safeNum(it && it.id, -1) !== safeNum(itemId, -2)) continue;
            if (safeNum(it && it.purchase_ts, 0) === maxTs) {
              newest = it;
              break;
            }
          }

          openFromPurchase(itemId, newest);
        }
      });
    }

    try {
      var res = await fn.call(api, { onUpdate: onUpdate });
      if (Array.isArray(res)) onUpdate(res);
    } catch (e2) {
      watching = false;
      throw e2;
    }

    log("watchPurchases armed");
    emit("watch", { itemIds: itemIds });
  }

  function stop() {
    watching = false;
    emit("stop", {});
  }

  // ---------------------------
  // Public API
  // ---------------------------
  var API = {
    version: "1.1-fab-final",

    setConfig: function (partial) {
      config = deepMerge(config, partial || {});
      return config;
    },

    getConfig: function () {
      return config;
    },

    open: function (slug, opts) {
      return open(slug, opts);
    },

    hide: function () {
      return hideOverlay();
    },

    watchPurchases: function (opts) {
      return watchPurchases(opts);
    },

    stop: function () {
      return stop();
    },

    refresh: function () {
      return syncWithAPI();
    },

    getCache: function () {
      return GameCache.get();
    },

    clearCache: function () {
      GameCache.clear();
      updateFAB();
    },

    on: on,
    off: off,
  };

  window.SmarticoGames = API;

  log("ready v1.1-fab-final");

  // Init
  (async function () {
    try {
      var smartico = await waitForSmartico(12000);

      // ✅ Sync inicial se FAB habilitado
      if (config.fab && config.fab.enabled) {
        await syncWithAPI();
        updateFAB();
      }

      // AutoStart watcher
      if (config.watcher && config.watcher.autoStart) {
        API.watchPurchases().catch(function (e) {
          errLog("autoStart failed:", e);
        });
      }
    } catch (e) {
      errLog("init error:", e);
    }
  })();
})();