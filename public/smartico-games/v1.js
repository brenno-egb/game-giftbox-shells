/* smartico-games v1 - Mobile Fix */
(function () {
  "use strict";

  // Evita duplicar se o script for carregado 2x
  if (window.SmarticoGames && window.SmarticoGames.version) return;

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
    return Number.isFinite(n) ? n : (fallback || 0);
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

  // ---------------------------
  // Default config
  // ---------------------------
  var DEFAULT_CONFIG = {
    baseUrl: "", // obrigatorio (https em prod)

    debug: false,

    routesByItemId: {
      // 6136: { slug:"giftbox", skin:"classic" }
    },

    user: {
      getUserId: function () {
        return window._smartico_user_id;
      },
      getLanguage: function () {
        return window._smartico_language || "pt";
      },
    },

    ui: {
      mode: "overlay", // overlay | popup
      mobileWidth: 414, // largura do iframe no desktop (como um celular)
      mobileHeight: "100%", // altura do iframe no desktop
      iframeAllow:
        "fullscreen; autoplay; clipboard-read; clipboard-write; payment; web-share",
    },

    watcher: {
      autoStart: false,
      openCooldownMs: 2000,
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
  // Tiny event emitter
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
  // Overlay UI
  // ---------------------------
  var OVERLAY_ID = "__smartico_games_overlay";
  var IFRAME_ID = "__smartico_games_iframe";
  var BTN_ID = "__smartico_games_close_btn";

  function ensureOverlay() {
    var hostWin = getHostWindow();
    var doc = hostWin.document;

    var overlay = doc.getElementById(OVERLAY_ID);
    if (overlay) return { hostWin: hostWin, doc: doc, overlay: overlay };

    overlay = doc.createElement("div");
    overlay.id = OVERLAY_ID;

    // Overlay sem backdrop-filter, totalmente transparente
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
      zIndex: "2147483648", // Sempre acima do iframe
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    });
    close.onclick = function () {
      API.hide();
    };

    var frame = doc.createElement("iframe");
    frame.id = IFRAME_ID;

    var mobileWidth = config.ui.mobileWidth || 414;
    var mobileHeight = config.ui.mobileHeight || "100%";

    // Estilos base do iframe
    Object.assign(frame.style, {
      position: "fixed", // Mudado de absolute para fixed
      border: "0",
      borderRadius: "0",
      boxShadow: "none",
      backgroundColor: "transparent",
      zIndex: "2147483647", // Mesmo z-index do overlay
    });

    // Media query via JavaScript
    function applyResponsiveStyles() {
      var isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        // No mobile: tela cheia sem margens
        Object.assign(frame.style, {
          top: "0",
          left: "0",
          width: "100vw",
          height: "100vh",
          maxWidth: "100vw",
          maxHeight: "100vh",
          transform: "none",
        });
        
        // Ajusta botão no mobile
        Object.assign(close.style, {
          top: "8px",
          right: "8px",
        });
      } else {
        // No desktop: tamanho mobile centralizado
        Object.assign(frame.style, {
          top: "0",
          left: "50%",
          width: mobileWidth + "px",
          height: mobileHeight,
          maxWidth: mobileWidth + "px",
          maxHeight: "100vh",
          transform: "translateX(-50%)",
        });
        
        // Ajusta botão no desktop (ao lado do iframe)
        Object.assign(close.style, {
          top: "12px",
          right: "calc(50% - " + (mobileWidth / 2 + 56) + "px)", // 56px = margem + largura do botão
        });
      }
    }

    // Aplica estilos inicialmente
    applyResponsiveStyles();

    // Reaplica quando a janela é redimensionada
    var resizeTimeout;
    window.addEventListener("resize", function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(applyResponsiveStyles, 100);
    });

    frame.setAttribute("allow", config.ui.iframeAllow || "");

    frame.addEventListener("load", function () {
      log("iframe loaded:", frame.src);
    });

    overlay.appendChild(frame);
    doc.body.appendChild(overlay);
    doc.body.appendChild(close); // Botão fora do overlay

    log("overlay created in", hostWin === window.top ? "window.top" : "window");
    return { hostWin: hostWin, doc: doc, overlay: overlay };
  }

  function showOverlay(url) {
    var o = ensureOverlay();
    var doc = o.doc;
    var hostWin = o.hostWin;
    var overlay = o.overlay;
    var frame = doc.getElementById(IFRAME_ID);
    var close = doc.getElementById(BTN_ID);

    overlay.style.display = "block";
    if (close) close.style.display = "block";
    
    // Previne scroll no body
    doc.body.style.overflow = "hidden";
    doc.documentElement.style.overflow = "hidden";
    
    // Fix para mobile - previne bounce/scroll
    if (window.innerWidth <= 768) {
      doc.body.style.position = "fixed";
      doc.body.style.width = "100%";
      doc.body.style.height = "100%";
    }

    // Set src depois de mostrar ajuda em alguns casos de layout/CSP
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
    
    // Restaura scroll no body
    doc.body.style.overflow = "";
    doc.documentElement.style.overflow = "";
    doc.body.style.position = "";
    doc.body.style.width = "";
    doc.body.style.height = "";

    emit("hide", {});
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

    var url = baseUrl + "/games/" + enc(slug) + "?uid=" + enc(uid) + "&lang=" + enc(lang);
    if (skin) url += "&skin=" + enc(skin);
    return url;
  }

  function open(slug, opts) {
    var url = buildGameUrl(slug, opts);

    // Mixed content check (https page + http iframe = bloqueado)
    try {
      var pageIsHttps = location.protocol === "https:";
      var urlIsHttp = /^http:\/\//i.test(url);
      if (pageIsHttps && urlIsHttp) {
        warn("Mixed content: página HTTPS não pode iframar URL HTTP:", url);
      }
    } catch (e) {}

    if ((config.ui.mode || "overlay") === "popup") {
      // popup pode ser bloqueado se não for click do usuário
      var w = window.open(url, "_blank", "noopener,noreferrer");
      if (!w) warn("Popup bloqueado. Use ui.mode='overlay' ou chame em clique do usuário.");
      emit("open", { url: url, mode: "popup" });
      return;
    }

    showOverlay(url);
  }

  // ---------------------------
  // Purchases watcher (fix primeira compra)
  // ---------------------------
  var watching = false;
  var openLockUntil = 0;
  var lastSeenByItemId = {}; // { [itemId]: purchase_ts_max }

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
    return Object.keys(map).map(function (k) {
      return safeNum(k, 0);
    }).filter(Boolean);
  }

  function openFromPurchase(itemId, purchaseItem) {
    var route = (config.routesByItemId || {})[String(itemId)];
    if (!route || !route.slug) return;

    var uid = getUid();
    var lang = getLang();

    log("✅ purchase detected => open", { itemId: itemId, route: route, uid: uid, lang: lang });

    emit("purchase", { itemId: itemId, purchaseItem: purchaseItem, route: route });

    open(route.slug, { skin: route.skin, uid: uid, lang: lang });
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
      throw new Error("Não achei função de 'purchased store items' na Smartico API.");
    }

    var itemIds = opts.itemIds && opts.itemIds.length ? opts.itemIds : getMappedItemIds();
    if (!itemIds.length) {
      warn("watchPurchases: nenhum itemId configurado em routesByItemId.");
    }

    // 1) Baseline inicial (para não ignorar a PRIMEIRA compra)
    try {
      var initial = await fn.call(api, {});
      if (Array.isArray(initial)) {
        itemIds.forEach(function (id) {
          lastSeenByItemId[id] = maxPurchaseTsForItem(initial, id) || 0;
        });
        log("baseline set from initial fetch:", JSON.parse(JSON.stringify(lastSeenByItemId)));
      } else {
        log("baseline: initial fetch did not return array (ok)");
      }
    } catch (e) {
      // Se falhar baseline, seguimos mesmo assim
      warn("baseline fetch failed (continuing):", e && e.message ? e.message : e);
    }

    // 2) Arma onUpdate
    function onUpdate(items) {
      if (!watching) return;

      var t = nowMs();
      if (t < openLockUntil) return;

      // Debug
      log("purchased update len:", (items || []).length);

      itemIds.forEach(function (itemId) {
        var prev = safeNum(lastSeenByItemId[itemId], 0);
        var maxTs = maxPurchaseTsForItem(items, itemId);

        if (maxTs && maxTs > prev) {
          // trava para não abrir N vezes (lista pode vir repetida)
          openLockUntil = nowMs() + safeNum(config.watcher.openCooldownMs, 2000);
          lastSeenByItemId[itemId] = maxTs;

          // pega o item mais recente desse itemId
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

    // Muitos endpoints registram watcher via opts.onUpdate
    try {
      var res = await fn.call(api, { onUpdate: onUpdate });
      // Alguns retornam array imediatamente
      if (Array.isArray(res)) onUpdate(res);
    } catch (e2) {
      watching = false;
      throw e2;
    }

    log("watchPurchases armed", { itemIds: itemIds });
    emit("watch", { itemIds: itemIds });
  }

  function stop() {
    watching = false;
    emit("stop", {});
    log("watchPurchases stopped (best-effort).");
    // Obs: Smartico pode não oferecer unsubscribe do onUpdate, então a gente só ignora updates via flag.
  }

  // ---------------------------
  // Public API
  // ---------------------------
  var API = {
    version: "1.0.0",

    setConfig: function (partial) {
      config = deepMerge(config, partial || {});
      log("config updated:", config);
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

    on: on,
    off: off,
  };

  // Expose
  window.SmarticoGames = API;

  log("ready", API.version, "config:", config);

  // AutoStart
  try {
    if (config.watcher && config.watcher.autoStart) {
      // Se Smartico ainda não estiver pronto, o watchPurchases espera
      API.watchPurchases().catch(function (e) {
        errLog("autoStart watchPurchases failed:", e && e.message ? e.message : e);
      });
    }
  } catch (e) {
    errLog("autoStart error:", e);
  }
})();