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

// layout (precisa bater com CSS)
const ITEM_W = 128;
const GAP = 10;
const STEP = ITEM_W + GAP;

// ---------- helpers ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const setPhase = (phase) => {
  // phase: 'intro' | 'roll'
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
  if (!game) { elAttemptsLabel.textContent = 'Tentativas'; elAttemptsValue.textContent = '—'; return; }

  if (game.saw_buyin_type === 'free') { elAttemptsLabel.textContent = ''; elAttemptsValue.textContent = 'Free'; return; }

  if (game.saw_buyin_type === 'spins') {
    if (ok) { elAttemptsLabel.textContent = 'Tentativas'; elAttemptsValue.textContent = String(game.spin_count ?? 0); }
    else { elAttemptsLabel.textContent = game.no_attempts_message || 'Sem tentativas'; elAttemptsValue.textContent = ''; }
    return;
  }

  if (game.saw_buyin_type === 'points') {
    if (ok) { elAttemptsLabel.textContent = 'Pontos'; elAttemptsValue.textContent = String(info?.ach_points_balance ?? 0); }
    else { elAttemptsLabel.textContent = game.no_attempts_message || 'Sem pontos'; elAttemptsValue.textContent = ''; }
    return;
  }

  elAttemptsLabel.textContent = 'Indisponível';
  elAttemptsValue.textContent = '';
};

const prizeLabel = (prize) => {
  if (!prize) return 'Resultado sem detalhes.';
  if (prize.prize_type === 'no-prize') return prize.aknowledge_message || 'Quase!';
  return `${prize.aknowledge_message ?? 'Parabéns! Você ganhou'} ${prize.name}`;
};

const openRules = () => {
  const backofficeRules = selectedGame?.description ? `\n\n(Regras do BackOffice)\n${selectedGame.description}` : '';
  rulesBody.textContent =
`🧰 Baú Giratório (estilo case)

Fluxo:
1) Você vê o baú e clica "Jogar"
2) Aparece a roleta e você clica "Abrir Baú"
3) A roleta para no prêmio sorteado pelo Smartico

Obs: os itens exibidos vêm de getMiniGames().prizes (quando disponível).` + backofficeRules;

  rulesBackdrop.classList.remove('is-hidden');
};
const closeRulesModal = () => rulesBackdrop.classList.add('is-hidden');

const openWin = (prize) => {
  winTitle.textContent = (prize?.prize_type === 'no-prize') ? 'Quase!' : 'Você ganhou!';
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
  try {
    const dp = selectedGame?.prizes?.[0]?.acknowledge_dp;
    if (window._smartico && dp) _smartico.dp(dp);
  } catch (e) {}
};

// fallback se prizes não vierem
const fallbackPool = () => ([
  { id: 'f1', name: 'Moedas', icon: null, prize_type: 'reward' },
  { id: 'f2', name: 'Ticket', icon: null, prize_type: 'reward' },
  { id: 'f3', name: 'XP Boost', icon: null, prize_type: 'reward' },
  { id: 'f4', name: 'Quase!', icon: null, prize_type: 'no-prize', aknowledge_message: 'Quase!' },
  { id: 'f5', name: 'Surpresa', icon: null, prize_type: 'reward' },
]);

const normalizePool = (game) => {
  const prizes = Array.isArray(game?.prizes) ? game.prizes : [];
  return prizes.length ? prizes : fallbackPool();
};

const renderItem = (p) => {
  const div = document.createElement('div');
  div.className = 'item';

  const img = document.createElement('img');
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
  const repeats = 10;
  strip = [];
  for (let r = 0; r < repeats; r++) {
    for (const p of poolIn) strip.push(p);
  }

  track.innerHTML = '';
  for (const p of strip) track.appendChild(renderItem(p));

  currentX = 0;
  track.style.transform = `translateX(${currentX}px)`;
};

const getViewportCenterX = () => {
  const viewport = track.parentElement; // .viewport
  const rect = viewport.getBoundingClientRect();
  return rect.width / 2;
};

const itemCenterAt = (index) => index * STEP + (ITEM_W / 2);

const animateTo = (toX, durationMs) => new Promise((resolve) => {
  const fromX = currentX;
  const start = performance.now();

  const tick = (now) => {
    const t = clamp((now - start) / durationMs, 0, 1);
    const e = easeOutCubic(t);
    currentX = fromX + (toX - fromX) * e;
    track.style.transform = `translateX(${currentX}px)`;

    if (t < 1) requestAnimationFrame(tick);
    else resolve();
  };

  requestAnimationFrame(tick);
});

// ---------- Smartico calls ----------
const refreshState = async () => {
  const games = await window._smartico.api.getMiniGames();
  const info = await window._smartico.getPublicProps();

  miniGames = games;
  playerInfo = info;

  const updated = games.find(g => g.id === selectedGame?.id);
  if (updated) selectedGame = updated;

  canPlay = SAWCanPlay(selectedGame, playerInfo?.ach_points_balance);
  setAttemptsUI(selectedGame, playerInfo, canPlay);

  // botões por fase
  playBtn.disabled = !canPlay || playing;
  openBtn.disabled = !canPlay || playing;
  backBtn.disabled = playing;
  elResetBtn.disabled = playing;
};

const spinAndReveal = async () => {
  if (playing) return;
  if (!canPlay) {
    chest.classList.add('shake');
    setTimeout(() => chest.classList.remove('shake'), 420);
    return;
  }

  playing = true;
  playBtn.disabled = true;
  openBtn.disabled = true;
  backBtn.disabled = true;
  elResetBtn.disabled = true;
  elRulesBtn.disabled = true;

  chest.classList.remove('open');
  elStatus.textContent = 'Abrindo…';

  try {
    // pega resultado primeiro (pra parar exatamente no prize)
    const result = await window._smartico.api.playMiniGame(selectedGame.id);

    if (result?.err_code !== 0) {
      console.error('playMiniGame error:', result);
      elStatus.textContent = 'Falha ao jogar. Tenta de novo.';
      chest.classList.add('shake');
      setTimeout(() => chest.classList.remove('shake'), 420);
      return;
    }

    const prizeId = result?.prize_id || null;
    const prize = prizeId ? (pool.find(p => p.id === prizeId) || null) : null;

    chest.classList.add('open');

    const viewportCenter = getViewportCenterX();
    const baseIndex = Math.floor(strip.length * 0.75);
    let targetIndex = baseIndex;

    if (prizeId) {
      for (let i = baseIndex; i < strip.length; i++) {
        if (strip[i]?.id === prizeId) { targetIndex = i; break; }
      }
    } else {
      targetIndex = baseIndex + Math.floor(Math.random() * pool.length);
    }

    const targetCenter = itemCenterAt(targetIndex);
    const toX = viewportCenter - targetCenter;

    await animateTo(currentX - (STEP * 6), 220);
    await animateTo(toX, 2400);

    elStatus.textContent = 'Resultado!';
    openWin(prize);
    await refreshState();
  } catch (e) {
    console.error(e);
    elStatus.textContent = 'Erro no playMiniGame. Veja o console.';
    chest.classList.add('shake');
    setTimeout(() => chest.classList.remove('shake'), 420);
  } finally {
    playing = false;
    elRulesBtn.disabled = false;
    playBtn.disabled = !canPlay;
    openBtn.disabled = !canPlay;
    backBtn.disabled = false;
    elResetBtn.disabled = false;
  }
};

const loadMiniGames = async (templateId) => {
  if (!window._smartico) {
    elTitle.textContent = 'Baú Giratório';
    elSubtitle.textContent = 'Smartico não carregou — modo visual apenas.';
    selectedGame = null;
    pool = fallbackPool();
    buildStrip(pool);
    canPlay = true;
    setAttemptsUI(null, null, true);
    playBtn.disabled = false;
    openBtn.disabled = false;
    return;
  }

  const games = await window._smartico.api.getMiniGames();
  const info = await window._smartico.getPublicProps();

  miniGames = games;
  playerInfo = info;

  selectedGame = miniGames.find(g => g.id === templateId) || null;

  if (!selectedGame) {
    elTitle.textContent = 'Jogo não encontrado';
    elSubtitle.textContent = `Não achei template_id=${templateId} em getMiniGames().`;
    playBtn.disabled = true;
    openBtn.disabled = true;
    canPlay = false;
    return;
  }

  elTitle.textContent = selectedGame.name || 'Baú Giratório';
  elSubtitle.textContent = selectedGame.promo_text || 'Abra o baú e acompanhe a roleta';

  pool = normalizePool(selectedGame);
  buildStrip(pool);

  canPlay = SAWCanPlay(selectedGame, playerInfo?.ach_points_balance);
  setAttemptsUI(selectedGame, playerInfo, canPlay);

  playBtn.disabled = !canPlay;
  openBtn.disabled = !canPlay;

  elStatus.textContent = canPlay ? 'Pronto. Clique em Jogar.' :
    (selectedGame.no_attempts_message ? `Indisponível: ${selectedGame.no_attempts_message}` : 'Indisponível.');
};

// ---------- Init ----------
function initializeGame(templateId) {
  winBackdrop.classList.add('is-hidden');
  rulesBackdrop.classList.add('is-hidden');

  setPhase('intro');

  elRulesBtn.addEventListener('click', openRules);
  rulesClose.addEventListener('click', closeRulesModal);
  rulesBackdrop.addEventListener('click', (e) => { if (e.target === rulesBackdrop) closeRulesModal(); });

  winClose.addEventListener('click', closeWinModal);
  winBackdrop.addEventListener('click', (e) => { if (e.target === winBackdrop) closeWinModal(); });

  playBtn.addEventListener('click', () => {
    if (!canPlay) return;
    setPhase('roll');
    // garantia de medir viewport corretamente depois de aparecer
    requestAnimationFrame(() => buildStrip(pool.length ? pool : fallbackPool()));
  });

  backBtn.addEventListener('click', () => {
    if (playing) return;
    setPhase('intro');
  });

  openBtn.addEventListener('click', () => spinAndReveal());

  elResetBtn.addEventListener('click', () => {
    if (playing) return;
    chest.classList.remove('open');
    elStatus.textContent = sceneRoll.classList.contains('is-hidden') ? 'Pronto. Clique em Jogar.' : 'Pronto para girar.';
    buildStrip(pool.length ? pool : fallbackPool());
  });

  loadMiniGames(templateId).catch((e) => {
    console.error(e);
    elTitle.textContent = 'Erro ao carregar';
    elSubtitle.textContent = 'Veja o console para detalhes.';
  });
}
