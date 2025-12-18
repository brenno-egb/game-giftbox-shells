// ---------- DOM ----------
const elTitle = document.getElementById('game-title');
const elSubtitle = document.getElementById('game-subtitle');
const elHint = document.getElementById('hint');
const elStatus = document.getElementById('status');

const elAttemptsLabel = document.getElementById('attempts-label');
const elAttemptsValue = document.getElementById('attempts-value');

const elRulesBtn = document.getElementById('rules-btn');
const elResetBtn = document.getElementById('reset-btn');

const sceneIntro = document.getElementById('scene-intro');
const sceneRoll = document.getElementById('scene-roll');

const playBtn = document.getElementById('play-btn');
const backBtn = document.getElementById('back-btn');

const track = document.getElementById('track');

const chest = document.getElementById('chest');
const openBtn = document.getElementById('open-btn');

const rulesBackdrop = document.getElementById('rules-backdrop');
const rulesBody = document.getElementById('rules-body');
const rulesClose = document.getElementById('rules-close');

const winBackdrop = document.getElementById('win-backdrop');
const winTitle = document.getElementById('win-title');
const winText = document.getElementById('win-text');
const winIcon = document.getElementById('win-icon');
const winClose = document.getElementById('win-close');

// ---------- Smartico state ----------
let miniGames = [];
let selectedGame = null;
let playerInfo = null;
let canPlay = false;

// ---------- Game state ----------
let pool = [];        // prizes para mostrar
let strip = [];       // sequência repetida na roleta
let playing = false;
let currentX = 0;

let phase = 'intro';         // 'intro' | 'roll'
let lastStopIndex = null;    // índice exato onde parou (no strip)
let lastPrize = null;        // prêmio da última jogada (pra dp correto)
let pendingRealign = false;

let initialized = false;
let ro = null;

// ---------- helpers ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const strId = (v) => (v === null || v === undefined ? '' : String(v));

const setPhase = (next) => {
  phase = next;
  if (phase === 'intro') {
    sceneIntro.classList.remove('is-hidden');
    sceneRoll.classList.add('is-hidden');
    elStatus.textContent = 'Pronto. Clique em Jogar.';
    chest.classList.remove('open');
  } else {
    sceneIntro.classList.add('is-hidden');
    sceneRoll.classList.remove('is-hidden');
    elStatus.textContent = 'Pronto para girar.';
  }
  updateButtons();
};

const updateButtons = () => {
  const hasGame = !!selectedGame;
  const ok = !!canPlay;

  // Botões gerais
  elRulesBtn.disabled = !hasGame || playing;
  elResetBtn.disabled = playing || phase !== 'roll';

  // Fase intro
  playBtn.disabled = playing || phase !== 'intro' || !hasGame || !ok;

  // Fase roll
  openBtn.disabled = playing || phase !== 'roll' || !hasGame || !ok;
  backBtn.disabled = playing || phase !== 'roll';
};

const SAWCanPlay = (game, pointsBalance) => {
  if (!game) return false;
  switch (game.saw_buyin_type) {
    case 'free': return true;
    case 'spins': return game.spin_count != null && game.spin_count > 0;
    case 'points': return (game.buyin_cost_points || 0) <= (pointsBalance || 0);
    default:
      console.warn('Unknown saw_buyin_type:', game.saw_buyin_type);
      return true;
  }
};

const setAttemptsUI = (game, info, ok) => {
  if (!game) {
    elAttemptsLabel.textContent = 'Tentativas';
    elAttemptsValue.textContent = '—';
    return;
  }

  if (game.saw_buyin_type === 'free') {
    elAttemptsLabel.textContent = '';
    elAttemptsValue.textContent = 'Free';
    return;
  }

  if (game.saw_buyin_type === 'spins') {
    if (ok) {
      elAttemptsLabel.textContent = 'Tentativas';
      elAttemptsValue.textContent = String(game.spin_count ?? 0);
    } else {
      elAttemptsLabel.textContent = game.no_attempts_message || 'Sem tentativas';
      elAttemptsValue.textContent = '';
    }
    return;
  }

  if (game.saw_buyin_type === 'points') {
    if (ok) {
      elAttemptsLabel.textContent = 'Pontos';
      elAttemptsValue.textContent = String(info?.ach_points_balance ?? 0);
    } else {
      elAttemptsLabel.textContent = game.no_attempts_message || 'Sem pontos';
      elAttemptsValue.textContent = '';
    }
    return;
  }

  elAttemptsLabel.textContent = 'Indisponível';
  elAttemptsValue.textContent = '';
};

const prizeLabel = (prize) => {
  if (!prize) return 'Jogada concluída.';
  if (prize.prize_type === 'no-prize') return prize.aknowledge_message || 'Quase!';
  return `${prize.aknowledge_message ?? 'Parabéns! Você ganhou'} ${prize.name}`;
};

const openRules = () => {
  const backofficeRules = selectedGame?.description
    ? `\n\n(Regras do BackOffice)\n${selectedGame.description}`
    : '';

  rulesBody.textContent =
`🧰 Baú Giratório

Fluxo:
1) Você clica "Jogar"
2) Abre a roleta e clica "Abrir Baú"
3) O Smartico decide o prêmio (playMiniGame) e a roleta para exatamente nele.` + backofficeRules;

  rulesBackdrop.classList.remove('is-hidden');
};
const closeRulesModal = () => rulesBackdrop.classList.add('is-hidden');

const openWin = (prize) => {
  lastPrize = prize || null;

  const isNoPrize = prize?.prize_type === 'no-prize';
  winTitle.textContent = isNoPrize ? 'Quase!' : (prize ? 'Você ganhou!' : 'Resultado');

  winText.textContent = prizeLabel(prize);

  if (prize?.icon) {
    winIcon.src = prize.icon;
    winIcon.style.display = '';
  } else {
    winIcon.removeAttribute('src');
    winIcon.style.display = 'none';
  }

  winBackdrop.classList.remove('is-hidden');
};

const closeWinModal = () => {
  winBackdrop.classList.add('is-hidden');

  // ✅ ack/track do prêmio certo (quando existir)
  try {
    const dp = lastPrize?.acknowledge_dp;
    if (window._smartico && typeof _smartico?.dp === 'function' && dp) {
      _smartico.dp(dp);
    }
  } catch (e) {
    // silencioso
  } finally {
    lastPrize = null;
  }
};

// ---------- UI: roleta ----------
const normalizePool = (game) => {
  const prizes = Array.isArray(game?.prizes) ? game.prizes : [];
  return prizes;
};

const renderItem = (p) => {
  const div = document.createElement('div');
  div.className = 'item';

  const img = document.createElement('img');
  img.decoding = 'async';

  if (p?.icon) {
    img.src = p.icon;
  } else {
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
        <defs>
          <radialGradient id="g" cx="30%" cy="30%" r="70%">
            <stop offset="0" stop-color="rgba(255,255,255,.75)"/>
            <stop offset="1" stop-color="rgba(18,194,233,.25)"/>
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="22" fill="url(#g)"/>
        <circle cx="32" cy="32" r="10" fill="rgba(196,113,237,.25)"/>
      </svg>`;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  const name = document.createElement('div');
  name.className = 'name';
  name.textContent = p?.name || 'Item';

  div.appendChild(img);
  div.appendChild(name);
  return div;
};

const buildStrip = (poolIn) => {
  // sempre zera “parada anterior”, porque o DOM vai ser reconstruído
  lastStopIndex = null;

  const repeats = 12;
  strip = [];

  for (let r = 0; r < repeats; r++) {
    for (const p of poolIn) strip.push(p);
  }

  track.innerHTML = '';
  for (const p of strip) track.appendChild(renderItem(p));

  currentX = 0;
  track.style.transform = `translate3d(${currentX}px,0,0)`;
};

// distância entre itens (usando DOM real, não CSS hardcoded)
const getStepPx = () => {
  const a = track.children[0];
  const b = track.children[1];
  if (a && b) return b.offsetLeft - a.offsetLeft;
  if (a) return a.offsetWidth + 10;
  return 140;
};

const getToXForIndex = (index) => {
  const viewport = track.parentElement; // .viewport
  const item = track.children[index];

  if (!viewport || !item) return currentX;

  const viewportCenter = viewport.clientWidth / 2;
  const itemCenter = item.offsetLeft + item.offsetWidth / 2;

  return Math.round(viewportCenter - itemCenter);
};

const animateTo = (toX, durationMs) => new Promise((resolve) => {
  const fromX = currentX;
  const start = performance.now();

  const tick = (now) => {
    const t = clamp((now - start) / durationMs, 0, 1);
    const e = easeOutCubic(t);
    currentX = fromX + (toX - fromX) * e;
    track.style.transform = `translate3d(${currentX}px,0,0)`;

    if (t < 1) requestAnimationFrame(tick);
    else resolve();
  };

  requestAnimationFrame(tick);
});

const realignToStop = async (animate = false) => {
  if (lastStopIndex == null) return;

  const toX = getToXForIndex(lastStopIndex);

  if (!animate) {
    currentX = toX;
    track.style.transform = `translate3d(${currentX}px,0,0)`;
    return;
  }

  await animateTo(toX, 140);
};

// ---------- Smartico calls ----------
const refreshState = async () => {
  const games = await window._smartico.api.getMiniGames();
  const info = await window._smartico.getPublicProps();

  miniGames = games;
  playerInfo = info;

  // mantém selectedGame atualizado (spin_count etc.)
  const updated = games.find(g => strId(g.id) === strId(selectedGame?.id));
  if (updated) selectedGame = updated;

  canPlay = SAWCanPlay(selectedGame, playerInfo?.ach_points_balance);
  setAttemptsUI(selectedGame, playerInfo, canPlay);

  updateButtons();
};

const spinAndReveal = async () => {
  if (playing) return;
  if (!selectedGame) return;

  // cheque local (sem fallback)
  if (!canPlay) {
    chest.classList.add('shake');
    setTimeout(() => chest.classList.remove('shake'), 420);
    return;
  }

  playing = true;
  pendingRealign = false;
  updateButtons();

  elStatus.textContent = 'Abrindo…';
  chest.classList.remove('open');

  try {
    // 1) resultado vem do Smartico
    const result = await window._smartico.api.playMiniGame(selectedGame.id);

    if (result?.err_code !== 0) {
      console.error('playMiniGame error:', result);
      elStatus.textContent = 'Falha ao jogar. Tenta de novo.';
      chest.classList.add('shake');
      setTimeout(() => chest.classList.remove('shake'), 420);
      return;
    }

    const prizeId = result?.prize_id != null ? strId(result.prize_id) : '';
    const prize = prizeId
      ? (pool.find(p => strId(p.id) === prizeId) || null)
      : null;

    chest.classList.add('open');

    // 2) escolher um índice FUTURO no strip que corresponda ao prizeId
    const startIndex = Math.max(0, Math.floor(strip.length * 0.65));
    let targetIndex = startIndex;

    if (prizeId) {
      for (let i = startIndex; i < strip.length; i++) {
        if (strId(strip[i]?.id) === prizeId) { targetIndex = i; break; }
      }
    } else {
      // jogo sem prize_id: só para em algum lugar “bonito”
      targetIndex = startIndex + Math.floor(Math.random() * Math.max(1, pool.length));
    }

    lastStopIndex = targetIndex;

    // 3) anima “kick” + stop DOM-preciso
    const kick = getStepPx() * 6;
    await animateTo(currentX - kick, 220);

    const toX = getToXForIndex(targetIndex);
    await animateTo(toX, 2400);

    // garante que mesmo com drift subpixel ficou cravado
    await realignToStop(false);

    elStatus.textContent = 'Resultado!';
    openWin(prize);

    // 4) atualiza tentativas/saldo no HUD
    await refreshState();

  } catch (e) {
    console.error(e);
    elStatus.textContent = 'Erro no playMiniGame. Veja o console.';
    chest.classList.add('shake');
    setTimeout(() => chest.classList.remove('shake'), 420);
  } finally {
    playing = false;

    // se redimensionou durante o giro, reancora no final com uma assentada suave
    if (pendingRealign) {
      pendingRealign = false;
      await realignToStop(true);
    }

    updateButtons();
  }
};

const loadMiniGames = async (templateId) => {
  // ✅ sem fallback: se Smartico não carregou, trava tudo
  if (!window._smartico) {
    elTitle.textContent = 'Baú Giratório';
    elSubtitle.textContent = 'Smartico não carregou (smartico.js).';
    elStatus.textContent = 'Indisponível.';
    selectedGame = null;
    pool = [];
    strip = [];
    canPlay = false;
    setAttemptsUI(null, null, false);
    updateButtons();
    return;
  }

  const games = await window._smartico.api.getMiniGames();
  const info = await window._smartico.getPublicProps();

  miniGames = games;
  playerInfo = info;

  selectedGame = miniGames.find(g => strId(g.id) === strId(templateId)) || null;

  if (!selectedGame) {
    elTitle.textContent = 'Jogo não encontrado';
    elSubtitle.textContent = `Não achei template_id=${templateId} em getMiniGames().`;
    elStatus.textContent = 'Indisponível.';
    pool = [];
    strip = [];
    canPlay = false;
    setAttemptsUI(null, null, false);
    updateButtons();
    return;
  }

  elTitle.textContent = selectedGame.name || 'Baú Giratório';
  elSubtitle.textContent = selectedGame.promo_text || 'Abra o baú e acompanhe a roleta';

  pool = normalizePool(selectedGame);
  buildStrip(pool);

  canPlay = SAWCanPlay(selectedGame, playerInfo?.ach_points_balance);
  setAttemptsUI(selectedGame, playerInfo, canPlay);

  elStatus.textContent = canPlay
    ? 'Pronto. Clique em Jogar.'
    : (selectedGame.no_attempts_message ? `Indisponível: ${selectedGame.no_attempts_message}` : 'Indisponível.');

  updateButtons();
};

// ---------- Resize “à prova de prêmio errado” ----------
const installResizeHandlers = () => {
  const viewportEl = track.parentElement;
  if (!viewportEl) return;

  const onResize = () => {
    if (phase !== 'roll') return;
    if (lastStopIndex == null) return;

    if (playing) {
      pendingRealign = true;
      return;
    }
    // reancora instantâneo (não precisa animar)
    realignToStop(false);
  };

  // ResizeObserver é o mais confiável (pega mudanças de layout/zoom)
  try {
    ro = new ResizeObserver(onResize);
    ro.observe(viewportEl);
  } catch (e) {
    // ok — fica só com window resize
  }

  window.addEventListener('resize', onResize);
};

// ---------- Init ----------
function initializeGame(templateId) {
  if (!initialized) {
    initialized = true;

    winBackdrop.classList.add('is-hidden');
    rulesBackdrop.classList.add('is-hidden');

    setPhase('intro');

    elRulesBtn.addEventListener('click', openRules);
    rulesClose.addEventListener('click', closeRulesModal);
    rulesBackdrop.addEventListener('click', (e) => { if (e.target === rulesBackdrop) closeRulesModal(); });

    winClose.addEventListener('click', closeWinModal);
    winBackdrop.addEventListener('click', (e) => { if (e.target === winBackdrop) closeWinModal(); });

    playBtn.addEventListener('click', () => {
      if (!canPlay || !selectedGame) return;
      setPhase('roll');

      // reconstrói strip quando a roleta estiver visível (offsetLeft correto)
      requestAnimationFrame(() => {
        buildStrip(pool);
        realignToStop(false);
      });
    });

    backBtn.addEventListener('click', () => {
      if (playing) return;
      setPhase('intro');
    });

    openBtn.addEventListener('click', () => spinAndReveal());

    elResetBtn.addEventListener('click', () => {
      if (playing) return;
      chest.classList.remove('open');
      elStatus.textContent = (phase === 'intro') ? 'Pronto. Clique em Jogar.' : 'Pronto para girar.';
      lastStopIndex = null;
      lastPrize = null;
      buildStrip(pool);
    });

    installResizeHandlers();
  }

  // sempre recarrega para o templateId atual
  loadMiniGames(templateId).catch((e) => {
    console.error(e);
    elTitle.textContent = 'Erro ao carregar';
    elSubtitle.textContent = 'Veja o console para detalhes.';
    elStatus.textContent = 'Indisponível.';
    selectedGame = null;
    canPlay = false;
    updateButtons();
  });
}
x