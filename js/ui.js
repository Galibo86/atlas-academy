// Atlas Academy — screens and game interaction
(function () {
  const C = window.CONTENT, CFG = C.config, LE = window.LEARN;
  const $ = (id) => document.getElementById(id);
  const stage = $('stage'), view = $('view');
  const IMG = { happy: 'assets/atlas-happy.png', curious: 'assets/atlas-curious.png', worried: 'assets/atlas-worried.png', sad: 'assets/atlas-sad.png',
    verysad: 'assets/atlas-verysad.png', celebrate: 'assets/atlas-celebrate.png', sitting: 'assets/atlas-sitting.png', bone: 'assets/atlas-bone.png',
    restStart: 'assets/atlas-rest-start.jpg', restEnd: 'assets/atlas-rest-end.jpg', celebStart: 'assets/atlas-celebrate-start.jpg', sadStart: 'assets/atlas-sad-start.jpg' };
  // stills cut from the first/last frame of each clip, so photo <-> video swaps don't jump (value = shown width)
  const FRAME = { restStart: 340, restEnd: 340, celebStart: 300, sadStart: 340 };
  Object.values(IMG).forEach((s) => { const i = new Image(); i.src = s; });
  const ALPHA = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const BONE = (cls) => `<svg class="${cls || ''}" viewBox="-1 -1 26 18" aria-hidden="true"><path d="M5 2a3 3 0 0 1 3 2.5h8A3 3 0 1 1 19 9a3 3 0 1 1-3 2.5H8A3 3 0 1 1 5 9a3 3 0 1 1 0-7z" fill="#FF9F1C" stroke="#D97A00" stroke-width="1"/></svg>`;
  const PAW = (c) => `<svg viewBox="0 0 22 22" aria-hidden="true"><g fill="${c}"><ellipse cx="11" cy="14.5" rx="5.6" ry="5"/><circle cx="4.3" cy="8.3" r="2.5"/><circle cx="8.8" cy="4.2" r="2.5"/><circle cx="13.2" cy="4.2" r="2.5"/><circle cx="17.7" cy="8.3" r="2.5"/></g></svg>`;
  const BACK = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1B2A4A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  // keep short endings together: no lonely "…" or last word on its own line
  const tidy = (s) => String(s).replace(/ (…|»|”|\?|!)/g, '\u00A0$1').replace(/ (\S{1,8})$/, '\u00A0$1');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // the player's name replaces "Feli" in every text
  const NAME = () => (LE.player() ? LE.player().name : '');
  const swapName = (v) => (typeof v === 'string' ? v.replace(/Feli/g, NAME()).replace(/, !/g, '!').replace(/ !/g, '!')
    : typeof v === 'function' ? (...a) => swapName(v(...a)) : Array.isArray(v) ? v.map(swapName) : v);
  const T = (lang) => new Proxy(C.ui[lang], { get: (o, k) => swapName(o[k]) });

  function fit() {
    const s = Math.min(window.innerWidth / 1280, window.innerHeight / 800);
    stage.style.transform = `translate(-50%,-50%) scale(${s})`;
  }

  // ---------- overlay ----------
  function overlay(o) {
    const el = document.createElement('div'); el.className = 'overlay' + (o.side ? ' side' : '');
    el.innerHTML = `<div class="card" role="dialog" aria-modal="true"><div class="ovtitle">${esc(o.title)}</div>${o.sub ? `<div class="ovsub">${esc(o.sub)}</div>` : ''}
      <button class="btn primary${o.green ? ' green' : ''}" data-a="p">${esc(o.primary)}</button>${o.secondary ? `<button class="btn secondary" data-a="s">${esc(o.secondary)}</button>` : ''}</div>`;
    el.addEventListener('click', (e) => { const a = e.target.closest('[data-a]'); if (!a) return; el.remove(); (a.dataset.a === 'p' ? o.onPrimary : o.onSecondary)(); });
    stage.appendChild(el);
  }

  // ---------- 1 · welcome ----------
  function welcome() {
    document.documentElement.lang = 'en';
    view.innerHTML = `<section class="screen welcome">
      <div class="blob b1"></div><div class="blob b2"></div><div class="hill h1"></div><div class="hill h2"></div>
      <div class="wtext"><div class="eyebrow">${PAW('#2F6FED')}<span>NUMBERS · 1 TO 20</span></div>
        <h1>Atlas<br><span>Academy</span></h1><p>Learn to spell your numbers in English, Català and Español — with Atlas by your side.</p>
        <button class="bigbtn orange" id="play">Let’s play!</button></div>
      <img class="whero" src="${IMG.sitting}" alt="Atlas, a black and white border collie" draggable="false">
      <div class="wbubble">${LE.player() ? `Hi ${esc(NAME())}! Ready?` : 'Hi! Ready?'}</div>
      ${LE.players.list.length ? `<button class="pill whopill" id="who">${LE.player() ? `Not ${esc(NAME())}? ` : ''}Change player</button>` : ''}</section>`;
    $('play').onclick = () => (!LE.players.list.length ? askName(true) : !LE.player() || LE.players.list.length > 1 ? who() : start());   // several players: always ask who is playing
    if ($('who')) $('who').onclick = who;
  }
  const start = () => { LE.db.lastLang ? levels(LE.db.lastLang) : language(); };

  // ---------- 1b · who is playing / what's your name ----------
  const PCOL = ['#2F6FED', '#22A86B', '#FF9F1C', '#E5484D', '#8B5CF6', '#0EA5B7'];
  function who() {
    document.documentElement.lang = 'en';
    const list = LE.players.list;
    view.innerHTML = `<section class="screen lang who">
      <div class="head"><button class="back" id="back" aria-label="Back">${BACK}</button><h1>Who is playing?</h1></div>
      <div class="cards">${list.map((x, i) => `<div class="pwrap"><button class="lcard pcard" data-id="${x.id}"><span class="pav" style="background:${PCOL[i % PCOL.length]}">${esc(x.name.slice(0, 1).toUpperCase())}</span><span class="lname">${esc(x.name)}</span></button>
</div>`).join('')}
        ${list.length < 6 ? `<button class="lcard pcard padd" id="add"><span class="pav plus">+</span><span class="lname">New player</span></button>` : ''}</div></section>`;
    $('back').onclick = welcome;
    // tap = play; hold 1.5 s = delete (hidden on purpose so a child can't wipe a profile by accident)
    view.querySelectorAll('.pcard[data-id]').forEach((b) => { let t = null, held = false;
      b.addEventListener('pointerdown', () => { held = false; t = setTimeout(() => { held = true; askDel(b.dataset.id); }, 1500); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, () => clearTimeout(t)));
      b.onclick = () => { if (held) return; LE.usePlayer(b.dataset.id); start(); }; });
    const askDel = (id) => { const x = list.find((p) => p.id === id);
      overlay({ title: `Delete ${x.name}?`, sub: `All of ${x.name}’s progress on this tablet will be deleted.`, primary: 'Keep', secondary: 'Delete',
        onPrimary: () => {}, onSecondary: () => { LE.removePlayer(x.id); LE.players.list.length ? who() : welcome(); } }); };
    if ($('add')) $('add').onclick = () => askName(false);
  }
  function askName(first) {
    document.documentElement.lang = 'en';
    view.innerHTML = `<section class="screen lang askname">
      <div class="head">${first ? '' : `<button class="back" id="back" aria-label="Back">${BACK}</button>`}<h1>What’s your name?</h1></div>
      <p class="sub">Atlas wants to know who he’s playing with.</p>
      <div class="namerow"><input id="pname" maxlength="12" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="Your name" aria-label="Your name">
        <button class="bigbtn green" id="ok" disabled>Let’s go!</button></div>
      <p class="sub small" id="nmsg"></p>
      <img class="askdog" src="${IMG.curious}" alt="" draggable="false"></section>`;
    if ($('back')) $('back').onclick = who;
    const inp = $('pname'), ok = $('ok');
    const clean = () => inp.value.trim().replace(/\s+/g, ' ');
    const taken = (n) => LE.players.list.some((x) => x.name.toLowerCase() === n.toLowerCase());
    inp.oninput = () => { const n = clean(); ok.disabled = !n || taken(n); $('nmsg').textContent = n && taken(n) ? 'That name is already here — tap it on the list.' : ''; };
    const go = () => { const n = clean(); if (!n || taken(n)) return; LE.addPlayer(n.charAt(0).toUpperCase() + n.slice(1)); inp.blur(); start(); };
    ok.onclick = go; inp.onkeydown = (e) => { if (e.key === 'Enter') go(); };
    setTimeout(() => inp.focus(), 50);
  }

  // ---------- 2 · language ----------
  function progressOf(st) { return st.finalDone ? 1 : (st.stagesDone * 4 + Math.min(st.lesson, 4)) / 17; }
  function language() {
    document.documentElement.lang = 'en';
    const fresh = LE.LANGS.every((l) => progressOf(LE.L(l)) === 0 && !LE.L(l).current);
    const colors = { en: '#2F6FED', ca: '#E2A400', es: '#E5484D' };
    const order = ['en', 'ca', 'es'];
    view.innerHTML = `<section class="screen lang">
      <div class="head"><button class="back" id="back" aria-label="Back">${BACK}</button><h1>Which language today?</h1></div>
      <p class="sub">Each language has its own map and progress.</p>
      <div class="cards">${order.map((l) => { const st = LE.L(l), p = progressOf(st);
        const meta = st.finalDone ? '★ Level 1' : p === 0 && !st.current ? 'Not started yet' : st.stagesDone >= 4 ? T(l).finalStage : `${T(l).stage} ${st.stagesDone + 1} · ${st.lesson >= 4 ? T(l).review : T(l).lessons[st.lesson]}`;
        return `<button class="lcard${fresh && l === 'en' ? ' starthere' : ''}" data-l="${l}">${fresh && l === 'en' ? '<span class="ribbon">Start here</span>' : ''}
          <span class="code" style="background:${colors[l]}">${l.toUpperCase()}</span><span class="lname">${T(l).langName}</span><span class="meta">${esc(meta)}</span>
          <span class="bar"><span style="width:${Math.round(p * 100)}%;background:${colors[l]}"></span></span></button>`; }).join('')}</div>
      <button class="parent" id="reset">Reset progress</button>
      <img class="corner" src="${IMG.curious}" alt="Atlas lying down, curious" draggable="false"></section>`;
    $('back').onclick = welcome;
    view.querySelectorAll('.lcard').forEach((b) => (b.onclick = () => { LE.db.lastLang = b.dataset.l; LE.save(); levels(b.dataset.l); }));
    $('reset').onclick = () => overlay({ title: 'Reset all progress?', sub: `This deletes ${NAME() || 'the'}${NAME() ? '’s' : ''} progress in the three languages.`, primary: 'Keep progress', secondary: 'Delete progress',
      onPrimary: () => {}, onSecondary: () => { LE.resetAll(); language(); } });
  }

  // ---------- 3 · map ----------
  const MAP_PTS = (() => { const p = []; for (let i = 0; i < 8; i++) p.push({ x: 130 + i * 136, y: 250 + (i % 2 ? 40 : 0) });
    for (let i = 0; i < 8; i++) p.push({ x: 1082 - i * 124, y: 590 + (i % 2 ? -40 : 0) }); p.push({ x: 110, y: 390 }); return p; })();
  function starSvg(q) { // q = quarters filled 0..4
    const h = 20 * (q / 4);
    return `<svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true"><defs><clipPath id="sq"><rect x="0" y="${22 - h}" width="24" height="${h}"/></clipPath></defs>
      <path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.2 6.1 20.4l1.3-6.5L2.5 9.3l6.6-.8z" fill="#FFC83D" clip-path="url(#sq)"/>
      <path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.2 6.1 20.4l1.3-6.5L2.5 9.3l6.6-.8z" fill="none" stroke="#E2A400" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  }
  function map(lang) {
    document.documentElement.lang = lang;
    const t = T(lang), st = LE.L(lang);
    const curIdx = st.stagesDone >= 4 ? (st.finalDone ? -1 : 16) : st.stagesDone * 4 + Math.min(st.lesson, 3);
    const nodes = MAP_PTS.map((p, i) => {
      const fin = i === 16;
      const status = fin ? (st.finalDone ? 'done' : curIdx === 16 ? 'cur' : 'lock') : i < curIdx || curIdx === -1 ? 'done' : i === curIdx ? 'cur' : 'lock';
      const size = status === 'cur' || fin ? 96 : 76;
      const cls = `node ${status}${fin ? ' fin' : ''}`;
      const inner = fin ? `<span>${starSvg(st.finalDone ? 4 : 0)}</span>` : PAW(status === 'lock' ? '#A9B8D0' : '#fff');
      const label = fin ? t.finalStage : `${t.stage} ${Math.floor(i / 4) + 1} · ${t.lessons[i % 4]}`;
      return `<button class="${cls}" style="left:${p.x}px;top:${p.y}px;width:${size}px;height:${size}px;margin:-${size / 2}px 0 0 -${size / 2}px" ${status === 'cur' ? 'data-toggle="1"' : 'disabled'} aria-label="${esc(label)}">${inner}</button>`;
    }).join('');
    let paws = '';
    for (let i = 0; i < 16; i++) { const a = MAP_PTS[i], b = MAP_PTS[i + 1];
      [0.36, 0.64].forEach((k) => { paws += `<span class="mpaw" style="left:${a.x + (b.x - a.x) * k - 11}px;top:${a.y + (b.y - a.y) * k - 11}px;opacity:${i < curIdx || curIdx === -1 ? 1 : 0.4}">${PAW('#7FBF8C')}</span>`; }); }
    const stages = [0, 1, 2, 3].map((s) => { const pos = [[96, 150], [650, 150], [830, 662], [330, 662]][s]; const [a, b] = CFG.stages[s];
      const cls = s < st.stagesDone ? 'done' : s === st.stagesDone ? 'cur' : 'lock';
      return `<span class="stg ${cls}" style="left:${pos[0]}px;top:${pos[1]}px">${t.stage} ${s + 1} · ${a}–${b}${s < st.stagesDone ? ' ✓' : ''}</span>`; }).join('');
    // current lesson card
    let card = '';
    if (curIdx < 0) {
      card = `<div class="lcardmap" id="mcard" style="left:200px;top:334px"><button class="mclose" aria-label="Close">×</button><div class="eb">★ ${esc(t.starDone)}</div><div class="tt">${esc(t.practise)}</div><div class="ds">${esc(tidy(t.reviewDesc))}</div>
        <button class="bigbtn blue sm" data-practice="1">${esc(t.practise)}</button></div>`;
    } else {
      const p = MAP_PTS[curIdx]; const isFinal = curIdx === 16; const isRev = !isFinal && st.lesson >= 4;
      const title = isFinal ? t.finalStage : isRev ? t.review : t.lessons[st.lesson];
      const desc = isFinal ? t.finalDesc : isRev ? t.reviewDesc : t.lessonDesc[st.lesson];
      const left = Math.max(200, Math.min(1010, p.x - 115)); const top = 334;
      const eyebrow = isFinal ? t.finalSub : `${t.stage} ${st.stagesDone + 1}${isRev ? '' : ` · ${st.lesson + 1}/4`}`;
      const resume = st.current && st.current.idx > 0 ? `<div class="rs">${esc(t.paw)} ${st.current.idx + 1} / ${st.current.plan.length}</div>` : '';
      card = `<div class="lcardmap" id="mcard" style="left:${left}px;top:${top}px"><button class="mclose" aria-label="Close">×</button><div class="eb">${esc(eyebrow)}</div><div class="tt">${esc(title)}</div><div class="ds">${esc(tidy(desc))}</div>${resume}
        <button class="bigbtn blue sm" data-go="1">${esc(t.start)}</button></div>`;
    }
    view.innerHTML = `<section class="screen map">
      <div class="topbar"><button class="back" id="back" aria-label="Back">${BACK}</button>
        <div class="mtitle"><div>${esc(t.level)}</div><small>${esc(t.numbers)}</small></div>
        <button class="pill" id="change"><span class="lc">${lang.toUpperCase()}</span>${esc(t.change)}</button>
        <div class="pill star" role="img" aria-label="${esc(st.finalDone ? t.starDone : t.starTodo)}">${starSvg(st.finalDone ? 4 : st.stagesDone)}<span>${esc(st.finalDone ? t.starDone : t.starTodo)}</span></div></div>
      ${paws}${stages}${nodes}
      <span class="stg final" style="left:46px;top:450px">${esc(t.finalStage)}</span>
      ${card}
      <img class="corner left" src="${IMG.curious}" alt="Atlas lying down" draggable="false"></section>`;
    $('back').onclick = () => levels(lang); $('change').onclick = language;
    view.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => game(lang)));
    const mcard = $('mcard');
    if (mcard) {
      const setOpen = (o) => mcard.classList.toggle('closed', !o);
      mcard.querySelector('.mclose').onclick = (e) => { e.stopPropagation(); setOpen(false); };
      view.querySelectorAll('[data-toggle]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); setOpen(mcard.classList.contains('closed')); }));
      view.querySelector('.screen.map').addEventListener('click', (e) => { if (!e.target.closest('#mcard, [data-toggle], .topbar')) setOpen(false); });
    } else view.querySelectorAll('[data-toggle]').forEach((b) => (b.onclick = () => game(lang)));
    view.querySelectorAll('[data-practice]').forEach((b) => (b.onclick = () => game(lang, 'practice')));
  }

  // ---------- 4–10 · game ----------
  let G = null, drag = null, floating = null;
  function game(lang, kind) {
    document.documentElement.lang = lang;
    const cur = LE.startCurrent(lang, kind);
    G = { lang, cur, t: T(lang) };
    view.innerHTML = gameMarkup();
    buildKeyboard();
    $('btnCheck').onclick = check; $('btnCheckB').onclick = check;
    $('btnClose').onclick = () => overlay({ title: G.t.leaveTitle, sub: G.cur.kind === 'final' ? '' : G.t.leaveSub(G.cur.idx + 1), primary: G.t.keep, secondary: G.t.toMap,
      onPrimary: () => {}, onSecondary: () => { if (G.cur.kind === 'final') LE.abandonFinal(lang); map(lang); } });
    loadExercise();
  }
  function gameMarkup() { return `<section class="screen game">
      <header class="topbar"><button id="btnClose" class="iconbtn" aria-label="Leave lesson"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8FA3C7" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        <div id="progress" class="progress"></div></header>
      <section class="prompt"><span id="chip" class="chip"></span><div id="question" class="question"></div></section>
      <section class="row"><div id="slots" class="slots"></div><button id="btnCheck" class="check" disabled></button></section>
      <section id="bonus" class="bonus" hidden><span class="chip bonuschip" id="bchip"></span><div class="bwrap"><div id="brows" class="brows"></div><button id="btnCheckB" class="check" disabled></button></div></section>
      <section id="keyboard" class="keyboard"></section>
      <section id="choices" class="choices" hidden></section>
      <section id="tool" class="tool" hidden></section>
      <aside class="atlas"><div id="bubble" class="bubble"></div><div id="lives" class="lives" role="img"></div><img id="atlasImg" alt="Atlas" draggable="false"><video id="atlasVid" muted playsinline preload="auto" aria-hidden="true" hidden></video></aside>
      <div id="hint" class="hint" hidden></div></section>`; }
  function buildKeyboard() {
    const kb = $('keyboard'); const acc = C.keyboard[G.lang].accents;
    const row = (chars, accent) => `<div class="krow${accent ? ' accents' : ''}">${chars.map((ch) => `<button class="key${accent ? ' accent' : ''}" data-ch="${esc(ch)}" aria-label="Letter ${esc(ch)}">${esc(ch)}</button>`).join('')}</div>`;
    kb.innerHTML = row(ALPHA.slice(0, 9)) + row(ALPHA.slice(9, 18)) + row(ALPHA.slice(18)) + (acc.length ? row(acc, true) : '');
    kb.querySelectorAll('.key').forEach((k) => k.addEventListener('pointerdown', (e) => startDrag(e, { ch: k.dataset.ch, from: 'key' })));
  }
  function loadExercise() {
    const ex = G.cur.plan[G.cur.idx];
    if (ex.type === 'BONUS') {
      const BX = CFG.bonusBoxes; const rows = ex.nums.map((n) => Array.from(LE.word(G.lang, n)));
      Object.assign(G, { ex, isBonus: true, rows, letters: rows.flat(), max: CFG.bonusBones, lives: CFG.bonusBones,
        typed: Array(BX * 3).fill(null), locked: Array(BX * 3).fill(false), bad: [], rowBad: [], resets: 0, failed: false, hinted: false, ghost: false, cursor: 0, done: false, phase: 'play' });
      return render();
    }
    G.isBonus = false;
    const letters = Array.from(LE.word(G.lang, ex.n));
    const max = G.cur.kind === 'final' ? CFG.finalBones : CFG.livesFor(letters.length);
    Object.assign(G, { ex, letters, max, lives: G.cur.kind === 'final' ? G.cur.bonesLeft : max, typed: letters.map(() => null), locked: letters.map(() => false), bad: [],
      resets: 0, failed: false, hinted: false, ghost: ex.type === 'A', cursor: null, done: false, phase: 'play' });
    render();
  }
  function render() {
    if (G.topic) return tRender();
    const t = G.t, ex = G.ex, cur = G.cur;
    $('bonus').hidden = !G.isBonus; document.querySelector('.game .prompt').hidden = !!G.isBonus; document.querySelector('.game .row').hidden = !!G.isBonus;
    if (G.isBonus) return renderBonus();
    $('progress').innerHTML = cur.kind === 'final' ? `${esc(t.finalStage)} · <b>${cur.idx + 1} / ${cur.plan.length}</b>` : cur.kind === 'practice' ? `${esc(t.practise)} · <b>${t.paw} ${cur.idx + 1}</b>`
      : `${esc(t.stage)} ${cur.stage + 1} · <b>${esc(t.paw)} ${cur.idx + 1}</b>`;
    $('chip').textContent = ex.type === 'A' ? t.newNum : ex.text ? t.clue : t.write;
    $('chip').classList.toggle('new', ex.type === 'A');
    const q = $('question');
    if (ex.text) { q.className = 'question'; q.textContent = ex.text; }
    else { q.className = 'question digit'; q.innerHTML = `${ex.n}${ex.type === 'A' ? `<span class="eq"> = ${esc(G.letters.join(''))}</span>` : ''}`; }
    const n = G.letters.length; const size = n <= 5 ? [88, 12, 60] : n <= 7 ? [76, 10, 52] : [64, 8, 44];
    const slots = $('slots'); slots.style.gap = size[1] + 'px';
    slots.innerHTML = G.letters.map((c, i) => { const has = G.typed[i] != null;
      const cls = 'slot' + (G.locked[i] ? ' ok' : G.bad.includes(i) ? ' bad' : has ? ' filled' : '') + (!has && G.ghost ? ' ghost' : '') + (G.cursor === i && !has ? ' target' : '');
      return `<div class="${cls}" data-i="${i}" style="width:${size[0]}px;font-size:${size[2]}px" aria-label="Box ${i + 1}">${esc(has ? G.typed[i] : G.ghost ? c : '')}</div>`; }).join('');
    slots.querySelectorAll('.slot').forEach((d) => d.addEventListener('pointerdown', (e) => onSlotDown(e, Number(d.dataset.i))));
    const full = G.typed.every((x) => x != null);
    atlasFor(full);
    const btn = $('btnCheck'); btn.textContent = t.check; btn.disabled = !full || G.bad.length > 0 || G.done;
  }
  function renderBonus() {
    const t = G.t, BX = CFG.bonusBoxes;
    $('progress').innerHTML = `${esc(t.stage)} ${G.cur.stage + 1} · <b>★ ${esc(t.bonus)}</b>`;
    $('bchip').textContent = t.bonusChip;
    $('brows').innerHTML = G.rows.map((w, r) => `<div class="brow${G.rowBad.includes(r) ? ' rowbad' : ''}"><span class="bnum">${G.ex.nums[r]}</span>${Array.from({ length: BX }, (_, c) => {
      const i = r * BX + c, has = G.typed[i] != null;
      const cls = 'slot bs' + (G.locked[i] ? ' ok' : G.bad.includes(i) ? ' bad' : has ? ' filled' : '') + (G.cursor === i && !has ? ' target' : '');
      return `<div class="${cls}" data-i="${i}" aria-label="Number ${r + 1}, box ${c + 1}">${esc(has ? G.typed[i] : '')}</div>`; }).join('')}</div>`).join('');
    $('brows').querySelectorAll('.slot').forEach((d) => d.addEventListener('pointerdown', (e) => onSlotDown(e, Number(d.dataset.i))));
    const full = G.rows.every((w, r) => G.typed.slice(r * BX, r * BX + BX).some((x) => x != null));
    const btn = $('btnCheckB'); btn.textContent = t.check; btn.disabled = !full || G.bad.length > 0 || G.done;
    atlasFor(full);
  }
  function atlasFor(full) {
    const t = G.t, ex = G.ex;
    $('lives').innerHTML = Array.from({ length: G.max }, (_, i) => BONE(i >= G.lives ? 'lost' : '')).join('');
    $('lives').setAttribute('aria-label', t.bonesLeft(G.lives, G.max));
    let mood = 'happy', say = t.idle, warn = false;
    if (G.done) { mood = 'celebrate'; say = t.wellDone; }
    else if (G.phase === 'reset') { mood = 'verysad'; say = t.resetTitle; warn = true; }
    else if (drag && drag.moved) { mood = 'curious'; say = t.drag; }
    else if (G.lives === 1 && G.max > 1) { mood = 'sad'; say = t.last; warn = true; }
    else if (G.lives < G.max) { mood = 'worried'; say = t.lost1; warn = true; }
    else if (full) { mood = 'curious'; say = t.ready; }
    else if (ex.type === 'A') { mood = 'sitting'; say = t.intro; }
    setAtlas(mood, say, warn);
  }
  // Animated clips (from the Gemini video). Each clip plays once and stays on its last frame.
  // Before it starts we show its own first frame, so there is no jump between photo and video.
  // The calm clip plays only once per session (not on every word), then Atlas keeps resting.
  const VID = { happy: { src: 'assets/video/atlas-rest.mp4', w: 340, still: 'restStart', end: 'restEnd', perSession: true },
    celebrate: { src: 'assets/video/atlas-celebrate.mp4', w: 300, still: 'celebStart' },
    verysad: { src: 'assets/video/atlas-sad.mp4', w: 340, still: 'sadStart' } };
  const ATLAS_H = 290;                         // bubble and bones stay at a fixed height: no jumping around
  Object.values(VID).forEach((v) => { try { fetch(v.src).catch(() => {}); } catch (e) {} });
  let atlasGen = 0;                            // every change bumps this; old timers check it and do nothing
  function showImage(key) {
    const img = $('atlasImg'), vid = $('atlasVid'); atlasGen++;
    if (!img.src.endsWith(IMG[key])) img.src = IMG[key];
    img.className = FRAME[key] ? 'vframe' : key === 'celebrate' ? 'celebrate' : key === 'sitting' ? 'sitting' : '';
    img.style.width = FRAME[key] ? FRAME[key] + 'px' : '';
    img.hidden = false; img.style.opacity = 1; vid.hidden = true; vid.pause();
  }
  function setAtlas(mood, say, warn) {
    const img = $('atlasImg'), vid = $('atlasVid');
    const b = $('bubble'); b.textContent = say; b.classList.toggle('warn', !!warn);
    $('lives').style.bottom = ATLAS_H + 40 + 'px'; b.style.bottom = ATLAS_H + 40 + 64 + 'px';
    const v = VID[mood];
    const key = v && v.perSession ? mood : mood + ':' + G.ex.n + ':' + G.cur.idx + ':' + G.resets;
    if (v && G.clipKey === key) return;                       // this clip is running or resting on its last frame
    const done = (G.clipsDone = G.clipsDone || new Set());
    if (G.clipKey && G.clipKey !== key && VID[G.clipKey] && VID[G.clipKey].perSession) done.add(G.clipKey);   // calm clip interrupted: don't replay it this session
    if (v && !done.has(key)) {
      showImage(v.still); const gen = atlasGen;               // its first frame, until the video really plays
      G.clipKey = key;
      vid.style.width = v.w + 'px'; vid.loop = false; vid.style.opacity = 1; vid.src = v.src;
      const fallback = () => { if (gen === atlasGen) { vid.pause(); vid.hidden = true; img.hidden = false; done.add(key); } };
      vid.onplaying = () => { if (gen !== atlasGen) return; vid.hidden = false; img.hidden = true; };
      vid.onended = () => { if (gen !== atlasGen) return; done.add(key); };
      vid.onerror = fallback;
      const pr = vid.play(); if (pr && pr.catch) pr.catch(fallback);
      setTimeout(() => { if (gen === atlasGen && vid.paused && vid.currentTime === 0) fallback(); }, 2500);
      return;
    }
    G.clipKey = null;
    showImage(v && v.end ? v.end : mood);                     // after the calm clip, keep its resting frame
  }

  // drag & tap
  function toStage(e) { const r = stage.getBoundingClientRect(), s = r.width / 1280; return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s }; }
  function slotAt(e) { if (floating) floating.style.display = 'none'; const el = document.elementFromPoint(e.clientX, e.clientY); if (floating) floating.style.display = '';
    const s = el && el.closest('.slot'); return s ? Number(s.dataset.i) : -1; }
  function onSlotDown(e, i) {
    if (G.done || G.locked[i] || G.phase !== 'play') return;
    startDrag(e, G.typed[i] != null ? { ch: G.typed[i], from: 'slot', idx: i } : { ch: null, from: 'empty', idx: i });
  }
  function startDrag(e, info) {
    if (!G || G.done || G.phase !== 'play' || drag) return;
    e.preventDefault(); const p = toStage(e);
    drag = Object.assign({ id: e.pointerId, x0: p.x, y0: p.y, moved: false, target: -1 }, info);
    window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onCancel);
  }
  function onMove(e) {
    if (!drag || e.pointerId !== drag.id) return; const p = toStage(e);
    if (!drag.moved) {
      if (!drag.ch || Math.hypot(p.x - drag.x0, p.y - drag.y0) < 10) return;
      drag.moved = true; floating = document.createElement('div'); floating.className = 'floating'; floating.textContent = drag.ch; stage.appendChild(floating);
      if (drag.from === 'slot') G.typed[drag.idx] = null;
      render();
    }
    floating.style.left = p.x + 'px'; floating.style.top = p.y + 'px';
    const ti = slotAt(e);
    if (ti !== drag.target) { document.querySelectorAll('.slot.target').forEach((s) => s.classList.remove('target'));
      if (ti >= 0 && !G.locked[ti]) document.querySelector(`.slot[data-i="${ti}"]`).classList.add('target'); drag.target = ti; }
  }
  function onUp(e) {
    if (!drag || e.pointerId !== drag.id) return; const d = drag; endDrag();
    if (d.moved) { const ti = slotAt(e); if (ti >= 0 && !G.locked[ti]) { G.typed[ti] = d.ch; G.cursor = null; } }
    else if (d.from === 'key' && G.isBonus) {                      // Bonus: type at the cursor and move right along the same word
      const BX = CFG.bonusBoxes; let i = G.cursor;
      if (i != null) { const end = Math.floor(i / BX) * BX + BX; while (i < end && (G.typed[i] != null || G.locked[i])) i++;
        if (i < end) { G.typed[i] = d.ch; G.cursor = i + 1 < end ? i + 1 : null; } }
    }
    else if (d.from === 'empty' && G.isBonus) G.cursor = d.idx;
    else if (d.from === 'key') {                                   // tap a key: it goes to the chosen box, or the first empty one
      const c = G.cursor;
      const i = c != null && G.typed[c] == null && !G.locked[c] ? c : G.typed.findIndex((x, k) => x == null && !G.locked[k]);
      if (i >= 0) { G.typed[i] = d.ch; G.cursor = null; }
    }
    else if (d.from === 'empty') G.cursor = G.cursor === d.idx ? null : d.idx;   // tap an empty box: next letter goes there
    else if (d.from === 'slot') { G.typed[d.idx] = null; G.cursor = d.idx; }      // tap a filled box: remove the letter
    render();
  }
  function onCancel() { if (drag && drag.from === 'slot' && drag.moved) G.typed[drag.idx] = drag.ch; endDrag(); render(); }
  function endDrag() { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onCancel);
    if (floating) floating.remove(); floating = null; drag = null; }

  // check
  function check() {
    if (G.topic) return tCheckWrite();
    if (G.done) return;
    if (G.isBonus) return checkBonus();
    const bad = [];
    G.letters.forEach((c, i) => { if (G.locked[i]) return; if (G.typed[i] === c) G.locked[i] = true; else bad.push(i); });
    if (!bad.length) return complete();
    G.failed = true; G.lives -= 1; G.bad = bad;
    if (G.cur.kind === 'final') { G.cur.bonesLeft = G.lives; LE.save(); }
    render();
    setTimeout(() => { bad.forEach((i) => { G.typed[i] = null; }); G.bad = [];
      if (G.lives <= 0) { G.phase = 'reset'; render(); outOfBones(); } else render(); }, 750);
  }
  function checkBonus() {
    const BX = CFG.bonusBoxes; const bad = [], rowBad = [];
    G.rows.forEach((w, r) => {
      const t = G.typed.slice(r * BX, r * BX + BX);
      const right = w.every((c, i) => t[i] === c) && t.slice(w.length).every((x) => x == null);
      t.forEach((x, i) => { if (x == null) return; if (i < w.length && x === w[i]) G.locked[r * BX + i] = true; else bad.push(r * BX + i); });
      if (!right) rowBad.push(r);
    });
    if (!rowBad.length) {
      G.done = true; render(); LE.record(G.lang, G.ex, true);
      return setTimeout(() => overlay({ side: true, title: G.t.bonusWon, sub: G.t.bonusWonSub, primary: G.t.next, green: true, onPrimary: () => sessionEnd(LE.finishSession(G.lang)) }), 900);
    }
    G.failed = true; G.lives -= 1; G.bad = bad; G.rowBad = rowBad; render();
    setTimeout(() => {
      bad.forEach((i) => { G.typed[i] = null; }); G.bad = []; G.rowBad = [];
      const r0 = rowBad[0]; let c = r0 * BX; while (G.locked[c] || G.typed[c] != null) c++; G.cursor = c;
      if (G.lives <= 0) {
        G.phase = 'reset'; render(); LE.record(G.lang, G.ex, false);
        overlay({ side: true, title: G.t.bonusLost, sub: G.t.bonusLostSub, primary: G.t.next, onPrimary: () => sessionEnd(LE.finishSession(G.lang)) });
      } else render();
    }, 750);
  }
  function outOfBones() {
    const t = G.t;
    if (G.cur.kind === 'final') {
      return overlay({ side: true, title: t.finalOutTitle, sub: t.finalOutSub, primary: t.finalRetry, onPrimary: () => { LE.abandonFinal(G.lang); game(G.lang, 'final'); } });
    }
    overlay({ side: true, title: t.resetTitle, sub: t.resetSub, primary: t.tryAgain, onPrimary: () => {
      G.resets += 1; G.typed = G.letters.map(() => null); G.locked = G.letters.map(() => false); G.lives = G.max; G.phase = 'play';
      if (G.resets >= 3) G.ghost = true;                       // 3rd reset: step back to the model
      render();
      if (G.resets === 2) { G.hinted = true; const h = $('hint'); h.textContent = G.letters.join(''); h.hidden = false; setTimeout(() => { h.hidden = true; }, CFG.hintMs); }
    } });
  }
  function complete() {
    G.done = true; render();
    const perfect = !G.failed && G.resets === 0 && !G.hinted && (G.ex.type === 'A' || !G.ghost);
    LE.record(G.lang, G.ex, perfect);
    const t = G.t; const last = G.cur.idx >= G.cur.plan.length;
    setTimeout(() => overlay({ side: true, title: t.wellDone, sub: G.ex.type === 'A' ? `${G.ex.n} = ${G.letters.join('')}` : perfect ? t.perfect : t.done, primary: t.next, green: true,
      onPrimary: () => { if (!last) loadExercise(); else sessionEnd(LE.finishSession(G.lang)); } }), 900);
  }
  function sessionEnd(res) {
    if (res.levelCompleted) return levelDone(G.lang, res);
    lessonDone(G.lang, res);
  }

  // ---------- 10b · lesson complete ----------
  function dots(p) { const k = Math.min(3, p.B + p.C1 + p.C2); return '●'.repeat(k) + `<span class="off">${'●'.repeat(3 - k)}</span>`; }
  function lessonDone(lang, res) {
    const t = T(lang), st = LE.L(lang); const s = Math.min(res.stage, 3);
    const title = res.kind === 'practice' ? t.practise : res.lesson >= 4 ? t.review : t.lessons[res.lesson];
    view.innerHTML = `<section class="screen lend">
      <div class="disc"></div><img class="bone" src="${IMG.bone}" alt="Atlas with his bone" draggable="false">
      <div class="col"><div class="eb">${res.kind === 'practice' ? '' : `${esc(t.stage)} ${s + 1} · `}${esc(title)}</div><h1>${esc(t.lessonDone)}</h1>
        <div class="tiles"><div class="tile"><span class="lbl">${esc(t.exercises)}</span><span class="big">${res.total}/${res.total}</span></div>
          <div class="tile"><span class="lbl">${esc(t.perfectN)}</span><span class="big green">${res.perfect}</span></div></div>
        ${res.bonus ? `<div class="tile bossrow"><span class="tag">★ ${esc(t.bonus)}</span><span class="bw">${res.bonus === 'won' ? '✓ ' + esc(t.bonusWon) : esc(t.bonusLost)}</span></div>` : ''}
        ${res.kind === 'practice' ? '' : `<div class="lbl">${esc(t.mastery)}</div><div class="nums">${LE.stageNums(s).map((n) => `<div class="num"><b>${esc(LE.word(lang, n))}</b><span class="dots">${dots(st.perf[n])}</span></div>`).join('')}</div>`}
        <button class="bigbtn green" id="go">${esc(res.stageCompleted ? t.next : t.backMap)}</button></div></section>`;
    $('go').onclick = () => (res.stageCompleted ? stageDone(lang, res) : map(lang));
  }

  // ---------- 11 · stage complete ----------
  function stageDone(lang, res) {
    const t = T(lang); const s = res.stage; const next = s + 1;
    const confetti = Array.from({ length: 24 }, (_, i) => `<i style="left:${(i * 173) % 1240 + 10}px;top:${(i * 97) % 150 + (i % 3 ? 10 : 640)}px;width:${14 + (i % 3) * 6}px;background:${['#2F6FED', '#FF9F1C', '#22A86B', '#E5484D', '#FFC83D'][i % 5]};transform:rotate(${(i * 37) % 90 - 45}deg)"></i>`).join('');
    view.innerHTML = `<section class="screen sdone"><div class="confetti">${confetti}</div>
      <div class="col"><div class="eb">${esc(t.level)}</div><h1>${esc(t.stageDone(s + 1))}</h1><div class="badge">${PAW('#fff')}</div>
        <div class="sub">${esc(t.stageSub)}</div>
        <div class="chips">${LE.stageNums(s).map((n) => `<span class="chip2"><span class="ok">✓</span>${esc(LE.word(lang, n))}</span>`).join('')}</div>
        <div class="unlock">${PAW('#fff')}<div><small>${esc(t.unlocked)}</small><b>${next < 4 ? `${esc(t.stage)} ${next + 1} · ${CFG.stages[next][0]}–${CFG.stages[next][1]}` : esc(t.unlockedFinal)}</b></div></div>
        <button class="bigbtn orange" id="go">${esc(t.next)}</button></div>
      <img class="hero" src="${IMG.celebrate}" alt="Atlas celebrating" draggable="false"></section>`;
    $('go').onclick = () => map(lang);
  }

  // ---------- 12 · level complete ----------
  function levelDone(lang, res) {
    const t = T(lang), st = LE.L(lang);
    const weak = Array.from({ length: 20 }, (_, i) => i + 1).filter((n) => st.perf[n].fails > 0).sort((a, b) => st.perf[b].fails - st.perf[a].fails).slice(0, 3);
    const confetti = Array.from({ length: 30 }, (_, i) => `<i style="left:${(i * 211) % 1260}px;top:${(i * 131) % 780}px;width:${12 + (i % 3) * 6}px;background:${['#FFC83D', '#FF9F1C', '#22A86B', '#E5484D', '#7FA8FF'][i % 5]};transform:rotate(${(i * 41) % 90 - 45}deg)"></i>`).join('');
    view.innerHTML = `<section class="screen ldone"><div class="confetti">${confetti}</div>
      <div class="col"><div class="head">${starSvg(4).replace('width="34" height="34"', 'width="110" height="110"')}<div><div class="eb">${esc(t.numbers)}</div><h1>${esc(t.levelDone)}</h1></div></div>
        <div class="tiles"><div class="tile"><span class="lbl">${esc(t.finalStage)}</span><span class="big">${esc(t.finalResult(res.bonesLeft))}</span></div>
          <div class="tile"><span class="big gold">★ ${esc(t.youWon)}</span></div></div>
        <div class="lbl">${esc(t.canSpell)}</div>
        <div class="grid">${Array.from({ length: 20 }, (_, i) => i + 1).map((n) => `<div class="cell${weak.includes(n) ? ' weak' : ''}"><b>${esc(LE.word(lang, n))}</b><span>${n}</span></div>`).join('')}</div>
        <div class="btns"><button class="bigbtn white" id="prac">${esc(t.practise)}</button><button class="bigbtn orange" id="go">${esc(t.backMap)}</button></div></div>
      <img class="hero" src="${IMG.sitting}" alt="Atlas sitting proudly" draggable="false"><div class="lbubble">${esc(t.star)}</div></section>`;
    $('go').onclick = () => map(lang); $('prac').onclick = () => game(lang, 'practice');
  }

  // =====================================================================
  // Topic levels (comparatives, hiato/diptongo…): levels menu, map, game
  // =====================================================================
  const LX = {
    en: { choose: 'Choose a level', newTag: 'New', soon: 'More levels coming soon', lvl: 'Level', stageDone: (n) => `Stage ${n} complete!`, levelDone: 'Level complete!', star: 'You won the star!', allStages: 'All stages', finalTitle: 'Final stage', rightAnswer: 'Right answer', notThat: 'Not that one — try another!', missCut: 'A cut is missing!', nowDecide: 'Now: which one is it?' },
    es: { choose: 'Elige un nivel', newTag: 'Nuevo', soon: 'Pronto habrá más niveles', lvl: 'Nivel', stageDone: (n) => `¡Etapa ${n} completada!`, levelDone: '¡Nivel completado!', star: '¡Has ganado la estrella!', allStages: 'Todas las etapas', finalTitle: 'Etapa final', rightAnswer: 'Respuesta correcta', notThat: '¡Esa no! Prueba otra.', missCut: '¡Falta algún corte!', nowDecide: 'Ahora: ¿hiato o diptongo?' },
    ca: { choose: 'Tria un nivell', newTag: 'Nou', soon: 'Aviat hi haurà més nivells', lvl: 'Nivell', stageDone: (n) => `Etapa ${n} completada!`, levelDone: 'Nivell completat!', star: 'Has guanyat l’estrella!', allStages: 'Totes les etapes', finalTitle: 'Etapa final', rightAnswer: 'Resposta correcta', notThat: 'Aquesta no! Prova’n una altra.', missCut: 'Falta algun tall!', nowDecide: 'Ara: quin és?' }
  };
  const getLevel = (lang, id) => (window.LEVELS[lang] || []).find((l) => l.id === id);
  function tState(lang, id) {
    const db = LE.db; db.topics = db.topics || {}; db.topics[lang] = db.topics[lang] || {};
    if (!db.topics[lang][id]) db.topics[lang][id] = { stage: 0, lesson: 0, finalDone: false, current: null };
    return db.topics[lang][id];
  }
  function tProgress(lv, st) { const total = lv.stages.length * lv.lessons.length + 1; return st.finalDone ? 1 : (st.stage * lv.lessons.length + st.lesson) / total; }

  // ---------- levels menu ----------
  function levels(lang) {
    document.documentElement.lang = lang;
    const t = T(lang), x = LX[lang], num = LE.L(lang);
    const numP = num.finalDone ? 1 : (num.stagesDone * 4 + Math.min(num.lesson, 4)) / 17;
    const cards = [`<button class="lcard lv" data-id="numbers"><span class="code" style="background:#22A86B">1–20</span><span class="lname">${esc(t.level)}</span><span class="meta">${esc(t.numbers)}</span><span class="bar"><span style="width:${Math.round(numP * 100)}%;background:#22A86B"></span></span></button>`]
      .concat((window.LEVELS[lang] || []).map((lv, i) => { const st = tState(lang, lv.id), p = tProgress(lv, st);
        return `<button class="lcard lv" data-id="${lv.id}">${p === 0 ? `<span class="ribbon">${esc(x.newTag)}</span>` : ''}<span class="code" style="background:${lv.color}">${i + 2}</span><span class="lname sm">${esc(lv.title)}</span><span class="meta">${esc(lv.sub)}</span><span class="bar"><span style="width:${Math.round(p * 100)}%;background:${lv.color}"></span></span></button>`; }));
    view.innerHTML = `<section class="screen lang">
      <div class="head"><button class="back" id="back" aria-label="Back">${BACK}</button><h1>${esc(x.choose)}</h1></div>
      <p class="sub">${esc(t.langName)}</p>
      <div class="cards">${cards.join('')}</div>
      <p class="sub soon">${esc(x.soon)}</p>
      <img class="corner" src="${IMG.curious}" alt="Atlas lying down, curious" draggable="false"></section>`;
    $('back').onclick = language;
    view.querySelectorAll('.lv').forEach((b) => (b.onclick = () => (b.dataset.id === 'numbers' ? map(lang) : tmap(lang, b.dataset.id))));
  }

  // ---------- topic map ----------
  function snakePts(n) {           // n lesson nodes along two rows, then the final node
    const top = Math.ceil(n / 2), bot = n - top, p = [];
    for (let i = 0; i < top; i++) p.push({ x: top > 1 ? 130 + i * (952 / (top - 1)) : 600, y: 250 + (i % 2 ? 40 : 0) });
    for (let i = 0; i < bot; i++) p.push({ x: bot > 1 ? 1082 - i * (868 / (bot - 1)) : 600, y: 590 + (i % 2 ? -40 : 0) });
    p.push({ x: 110, y: 390 }); return p;
  }
  function tmap(lang, id) {
    const lv = getLevel(lang, id), st = tState(lang, id), t = T(lang), x = LX[lang];
    const L = lv.lessons.length, n = lv.stages.length * L, pts = snakePts(n);
    const curIdx = st.finalDone ? -1 : st.stage >= lv.stages.length ? n : st.stage * L + st.lesson;
    const nodes = pts.map((p, i) => { const fin = i === n;
      const status = curIdx === -1 || i < curIdx ? 'done' : i === curIdx ? 'cur' : 'lock';
      const size = status === 'cur' || fin ? 96 : 76;
      const inner = fin ? `<span>${starSvg(st.finalDone ? 4 : Math.round((Math.min(st.stage, lv.stages.length) / lv.stages.length) * 4))}</span>` : PAW(status === 'lock' ? '#A9B8D0' : '#fff');
      return `<button class="node ${status}${fin ? ' fin' : ''}" style="left:${p.x}px;top:${p.y}px;width:${size}px;height:${size}px;margin:-${size / 2}px 0 0 -${size / 2}px" ${status === 'cur' ? 'data-toggle="1"' : 'disabled'} aria-label="${esc(fin ? x.finalTitle : lv.lessons[i % L])}">${inner}</button>`; }).join('');
    let paws = '';
    for (let i = 0; i < n; i++) { const a = pts[i], b = pts[i + 1]; [0.36, 0.64].forEach((k) => { paws += `<span class="mpaw" style="left:${a.x + (b.x - a.x) * k - 11}px;top:${a.y + (b.y - a.y) * k - 11}px;opacity:${curIdx === -1 || i < curIdx ? 1 : 0.4}">${PAW('#7FBF8C')}</span>`; }); }
    const stages = lv.stages.map((sg, s) => { const p = pts[s * L]; const cls = s < st.stage || curIdx === -1 ? 'done' : s === st.stage ? 'cur' : 'lock';
      return `<span class="stg ${cls}" style="left:${Math.max(20, Math.min(980, p.x - 40))}px;top:${p.y < 400 ? 150 : 662}px">${esc(t.stage)} ${s + 1} · ${esc(sg.label)}</span>`; }).join('');
    let card = '';
    if (curIdx >= 0) { const p = pts[curIdx], fin = curIdx === n;
      const title = fin ? x.finalTitle : lv.lessons[st.lesson], desc = fin ? lv.finalDesc : lv.lessonDesc[st.lesson];
      const eyebrow = fin ? x.allStages : `${t.stage} ${st.stage + 1} · ${st.lesson + 1}/${L}`;
      const resume = st.current && st.current.idx > 0 ? `<div class="rs">${esc(t.paw)} ${st.current.idx + 1} / ${st.current.plan.length}</div>` : '';
      card = `<div class="lcardmap" id="mcard" style="left:${Math.max(200, Math.min(1010, p.x - 115))}px;top:334px"><button class="mclose" aria-label="Close">×</button><div class="eb">${esc(eyebrow)}</div><div class="tt">${esc(title)}</div><div class="ds">${esc(tidy(desc))}</div>${resume}<button class="bigbtn blue sm" data-go="1">${esc(t.start)}</button></div>`; }
    view.innerHTML = `<section class="screen map">
      <div class="topbar"><button class="back" id="back" aria-label="Back">${BACK}</button>
        <div class="mtitle"><div>${esc(lv.title)}</div><small>${esc(lv.sub)}</small></div>
        <button class="pill" id="change"><span class="lc">${lang.toUpperCase()}</span>${esc(t.change)}</button>
        <div class="pill star" role="img">${starSvg(st.finalDone ? 4 : 0)}<span>${esc(st.finalDone ? x.star : x.finalTitle)}</span></div></div>
      ${paws}${stages}${nodes}<span class="stg final" style="left:46px;top:450px">${esc(x.finalTitle)}</span>${card}
      <img class="corner left" src="${IMG.curious}" alt="Atlas lying down" draggable="false"></section>`;
    $('back').onclick = () => levels(lang); $('change').onclick = language;
    view.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => tgame(lang, id)));
    const mcard = $('mcard');
    if (mcard) { const setOpen = (o) => mcard.classList.toggle('closed', !o);
      mcard.querySelector('.mclose').onclick = (e) => { e.stopPropagation(); setOpen(false); };
      view.querySelectorAll('[data-toggle]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); setOpen(mcard.classList.contains('closed')); }));
      view.querySelector('.screen.map').addEventListener('click', (e) => { if (!e.target.closest('#mcard, [data-toggle], .topbar')) setOpen(false); }); }
  }

  // ---------- topic game ----------
  function tgame(lang, id, fresh) {
    document.documentElement.lang = lang;
    const lv = getLevel(lang, id), st = tState(lang, id);
    if (!st.current || fresh) {
      const final = st.stage >= lv.stages.length;
      st.current = { final, stage: st.stage, lesson: st.lesson, plan: final ? lv.final() : lv.plan(st.stage, st.lesson), idx: 0, perfect: 0, bonesLeft: CFG.finalBones };
      LE.save();
    }
    G = { lang, id, lv, st, cur: st.current, t: T(lang), topic: true };
    view.innerHTML = gameMarkup();
    $('btnCheck').onclick = check;
    $('btnClose').onclick = () => overlay({ title: G.t.leaveTitle, sub: G.cur.final ? '' : G.t.leaveSub(G.cur.idx + 1), primary: G.t.keep, secondary: G.t.toMap,
      onPrimary: () => {}, onSecondary: () => { if (G.cur.final) { st.current = null; LE.save(); } tmap(lang, id); } });
    tLoad();
  }
  function tLoad() {
    const ex = G.cur.plan[G.cur.idx], fin = G.cur.final;
    const letters = ex.kind === 'write' ? Array.from(ex.answer) : [];
    const fixed = (c) => c === ' ' || c === '|';                 // spaces and row breaks are not typed
    const max = fin ? CFG.finalBones : ex.kind === 'write' ? CFG.livesFor(letters.filter((c) => !fixed(c)).length) : 3;
    Object.assign(G, { ex, letters, max, lives: fin ? G.cur.bonesLeft : max, typed: letters.map((c) => (fixed(c) ? c : null)), locked: letters.map(fixed),
      bad: [], wrongOpts: [], resets: 0, failed: false, hinted: false, ghost: false, cursor: null, done: false, phase: 'play', isBonus: false,
      cuts: new Set(), cutsOk: new Set(), cutsBad: [], miss: false, splitDone: false, place: {}, sel: null, sortOk: new Set(), sortBad: [] });
    $('keyboard').innerHTML = ''; if (ex.kind === 'write') buildKeyboard();
    render();
  }
  function tRender() {
    const t = G.t, ex = G.ex, lv = G.lv, cur = G.cur;
    $('progress').innerHTML = cur.final && ex.kind === 'sort' ? `${esc(LX[G.lang].finalTitle)} · <b>${ex.words.filter((x) => G.place[x.w]).length} / ${ex.words.length}</b>`
      : cur.final ? `${esc(LX[G.lang].finalTitle)} · <b>${cur.idx + 1} / ${cur.plan.length}</b>` : `${esc(t.stage)} ${cur.stage + 1} · <b>${esc(t.paw)} ${cur.idx + 1}</b>`;
    $('chip').textContent = ex.chip || lv.chip[cur.lesson] || ''; $('chip').classList.remove('new');
    const q = $('question'); q.className = 'question topic'; q.innerHTML = ex.prompt.replace(/Feli/g, esc(NAME()));
    const write = ex.kind === 'write', split = ex.kind === 'split', sort = ex.kind === 'sort';
    const showChoices = ex.kind === 'choice' || (split && G.splitDone && ex.decide);
    document.querySelector('.game .row').hidden = !write; $('keyboard').hidden = !write; $('choices').hidden = !showChoices; $('bonus').hidden = true;
    $('choices').classList.toggle('low', split); $('tool').hidden = !(split || sort); $('tool').className = 'tool' + (split ? ' split' + (ex.decide ? ' decide' : '') : sort ? ' sort' : '');
    let full = false;
    if (split) full = renderSplit();
    if (sort) full = renderSort();
    if (write) {
      const rows = G.letters.join('').split('|'), n = Math.max(...rows.map((r) => r.length)), size = rows.length > 1 ? [42, 4, 32] : n <= 7 ? [76, 10, 52] : n <= 10 ? [60, 7, 42] : [50, 5, 36];
      const slots = $('slots'); slots.style.gap = size[1] + 'px'; slots.classList.toggle('two', rows.length > 1);
      let row = 1; const tag = () => (rows.length > 1 ? `<span class="gapn">${row}</span>` : '');
      slots.innerHTML = tag() + G.letters.map((c, i) => { if (c === '|') { row++; return `<div class="brk"></div>${tag()}`; } if (c === ' ') return `<div class="slot gap" style="width:${Math.round(size[0] / 2)}px"></div>`;
        const has = G.typed[i] != null;
        const cls = 'slot' + (G.locked[i] ? ' ok' : G.bad.includes(i) ? ' bad' : has ? ' filled' : '') + (G.cursor === i && !has ? ' target' : '');
        return `<div class="${cls}" data-i="${i}" style="width:${size[0]}px;font-size:${size[2]}px">${esc(has ? G.typed[i] : '')}</div>`; }).join('');
      slots.querySelectorAll('.slot:not(.gap)').forEach((d) => d.addEventListener('pointerdown', (e) => onSlotDown(e, Number(d.dataset.i))));
      full = G.typed.every((x) => x != null);
      const btn = $('btnCheck'); btn.textContent = t.check; btn.disabled = !full || G.bad.length > 0 || G.done;
    }
    if (showChoices) {
      const c = $('choices');
      c.innerHTML = ex.options.map((o, i) => { const cls = G.done && o === ex.answer ? ' right' : G.wrongOpts.includes(o) ? ' wrong' : '';
        return `<button class="opt${cls}" data-o="${i}" ${G.done || G.wrongOpts.includes(o) ? 'disabled' : ''}>${esc(o)}</button>`; }).join('');
      c.querySelectorAll('.opt').forEach((b) => (b.onclick = () => tChoose(ex.options[Number(b.dataset.o)])));
    }
    $('lives').innerHTML = Array.from({ length: G.max }, (_, i) => BONE(i >= G.lives ? 'lost' : '')).join('');
    $('lives').setAttribute('aria-label', t.bonesLeft(G.lives, G.max));
    let mood = 'happy', say = t.idle, warn = false;
    if (G.done) { mood = 'celebrate'; say = t.wellDone; }
    else if (G.phase === 'reset') { mood = 'verysad'; say = t.resetTitle; warn = true; }
    else if (drag && drag.moved) { mood = 'curious'; say = t.drag; }
    else if (G.lives === 1 && G.max > 1) { mood = 'sad'; say = t.last; warn = true; }
    else if (split && G.splitDone && !G.wrongOpts.length) { mood = 'curious'; say = LX[G.lang].nowDecide; }
    else if (G.lives < G.max) { mood = 'worried'; say = G.miss ? LX[G.lang].missCut : write || sort || (split && !G.splitDone) ? t.lost1 : LX[G.lang].notThat; warn = true; }
    else if (full) { mood = 'curious'; say = t.ready; }
    setAtlas(mood, say, warn);
  }
  // ---- cut the word into syllables: tap the gaps between letters ----
  function renderSplit() {
    const ex = G.ex, L = Array.from(ex.word), lock = G.splitDone || G.done || G.cutsBad.length > 0;
    let h = '<div class="sword">';
    L.forEach((ch, i) => {
      h += `<span class="sl">${esc(ch)}</span>`;
      if (i < L.length - 1) { const cls = (G.cuts.has(i) ? ' on' : '') + (G.cutsOk.has(i) ? ' ok' : '') + (G.cutsBad.includes(i) ? ' bad' : '');
        h += `<button class="sg${cls}" data-g="${i}" aria-label="Cortar después de ${esc(ch)}" ${lock ? 'disabled' : ''}><i></i></button>`; }
    });
    h += '</div>';
    if (!G.splitDone) h += `<button id="btnSplit" class="check" ${G.cuts.size && !lock ? '' : 'disabled'}>${esc(G.t.check)}</button>`;
    $('tool').innerHTML = h;
    $('tool').querySelectorAll('.sg').forEach((b) => (b.onclick = () => { const i = Number(b.dataset.g); if (G.cutsOk.has(i)) return;
      G.miss = false; if (G.cuts.has(i)) G.cuts.delete(i); else G.cuts.add(i); render(); }));
    const bs = $('btnSplit'); if (bs) bs.onclick = checkSplit;
    return G.cuts.size > 0 && !G.splitDone;
  }
  function checkSplit() {
    if (G.done || G.splitDone) return;
    const right = new Set(G.ex.cuts), bad = [...G.cuts].filter((i) => !right.has(i)), missing = G.ex.cuts.filter((i) => !G.cuts.has(i));
    [...G.cuts].filter((i) => right.has(i)).forEach((i) => G.cutsOk.add(i));
    if (!bad.length && !missing.length) { G.splitDone = true; return G.ex.decide ? render() : tComplete(); }
    G.cutsBad = bad; G.miss = !bad.length; const out = tLoseBone(); render();
    setTimeout(() => { bad.forEach((i) => G.cuts.delete(i)); G.cutsBad = []; if (out) { G.phase = 'reset'; render(); tOut(); } else render(); }, 750);
  }
  // ---- baskets: tap a word, then its basket ----
  function renderSort() {
    const ex = G.ex, lock = G.done || G.sortBad.length > 0;
    const chip = (x) => `<button class="sw${G.sel === x.w ? ' sel' : ''}${G.sortOk.has(x.w) ? ' ok' : ''}${G.sortBad.includes(x.w) ? ' bad' : ''}" data-w="${esc(x.w)}" ${lock ? 'disabled' : ''}>${esc(x.w)}</button>`;
    const pool = ex.words.filter((x) => !G.place[x.w]);
    $('tool').innerHTML = `<div class="spool">${pool.map(chip).join('')}</div>
      <div class="bins">${ex.bins.map((b, k) => `<div class="bin${G.sel ? ' ready' : ''}" data-b="${k + 1}"><div class="bt">${esc(b)}</div><div class="bw">${ex.words.filter((x) => G.place[x.w] === k + 1).map(chip).join('')}</div></div>`).join('')}</div>
      <button id="btnSort" class="check" ${pool.length || lock ? 'disabled' : ''}>${esc(G.t.check)}</button>`;
    $('tool').querySelectorAll('.sw').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); const w = b.dataset.w; if (G.sortOk.has(w)) return;
      const inBin = G.place[w];
      if (inBin && G.sel && G.sel !== w) { G.place[G.sel] = inBin; G.sel = null; }   // a word is picked: tapping inside a basket drops it there
      else if (inBin) { G.place[w] = 0; G.sel = null; }                               // nothing picked: send this word back up
      else G.sel = G.sel === w ? null : w;
      render(); }));
    $('tool').querySelectorAll('.bin').forEach((b) => (b.onclick = () => { if (!G.sel || lock) return; G.place[G.sel] = Number(b.dataset.b); G.sel = null; render(); }));
    $('btnSort').onclick = checkSort;
    return !pool.length;
  }
  function checkSort() {
    if (G.done) return;
    const bad = [];
    G.ex.words.forEach((x) => { if (G.sortOk.has(x.w)) return; if (G.place[x.w] === x.bin) G.sortOk.add(x.w); else bad.push(x.w); });
    if (!bad.length) return tComplete();
    G.sortBad = bad; const out = tLoseBone(); render();
    setTimeout(() => { bad.forEach((w) => { G.place[w] = 0; }); G.sortBad = []; if (out) { G.phase = 'reset'; render(); tOut(); } else render(); }, 900);
  }
  function tLoseBone() {
    G.failed = true; G.lives -= 1; if (G.cur.final) { G.cur.bonesLeft = G.lives; LE.save(); }
    return G.lives <= 0;
  }
  function tChoose(o) {
    if (G.done) return;
    if (o === G.ex.answer) return tComplete();
    G.wrongOpts.push(o); const out = tLoseBone(); render();
    if (out) tOut();
  }
  function tCheckWrite() {
    if (G.done) return; const bad = [];
    G.letters.forEach((c, i) => { if (G.locked[i]) return; if (G.typed[i] === c) G.locked[i] = true; else bad.push(i); });
    if (!bad.length) return tComplete();
    G.bad = bad; const out = tLoseBone(); render();
    setTimeout(() => { bad.forEach((i) => { G.typed[i] = null; }); G.bad = []; if (out) { G.phase = 'reset'; render(); tOut(); } else render(); }, 750);
  }
  function tOut() {
    const t = G.t;
    if (G.cur.final) return overlay({ side: true, title: t.finalOutTitle, sub: t.finalOutSub, primary: t.finalRetry, onPrimary: () => tgame(G.lang, G.id, true) });
    overlay({ side: true, title: t.resetTitle, sub: `${LX[G.lang].rightAnswer}: ${(G.ex.answerText || G.ex.answer).replace('|', ' … ')}`, primary: t.tryAgain, onPrimary: () => {
      G.resets += 1; G.typed = G.letters.map((c) => (c === ' ' || c === '|' ? c : null)); G.locked = G.letters.map((c) => c === ' ' || c === '|');
      Object.assign(G, { cuts: new Set(), cutsOk: new Set(), cutsBad: [], miss: false, splitDone: false, place: {}, sel: null, sortOk: new Set(), sortBad: [] });
      G.wrongOpts = []; G.lives = G.max; G.phase = 'play'; render(); } });
  }
  function tComplete() {
    G.done = true; render();
    const perfect = !G.failed && G.resets === 0;
    if (perfect) G.cur.perfect += 1; G.cur.idx += 1; LE.save();
    const last = G.cur.idx >= G.cur.plan.length, t = G.t;
    setTimeout(() => overlay({ side: true, title: t.wellDone, sub: `${perfect ? t.perfect : t.done} · ${G.ex.explain}`, primary: t.next, green: true,
      onPrimary: () => (last ? tFinish() : tLoad()) }), 700);
  }
  function tFinish() {
    const { st, lv, cur, lang, id } = G; const res = { perfect: cur.perfect, total: cur.plan.length, stage: cur.stage, lesson: cur.lesson, final: cur.final, bonesLeft: cur.bonesLeft };
    st.current = null;
    if (cur.final) st.finalDone = true;
    else { st.lesson += 1; if (st.lesson >= lv.lessons.length) { st.stage += 1; st.lesson = 0; res.stageCompleted = true; } }
    LE.save(); tEnd(lang, id, res);
  }
  function tEnd(lang, id, res) {
    const t = T(lang), x = LX[lang], lv = getLevel(lang, id);
    const big = res.final || res.stageCompleted;
    const title = res.final ? x.levelDone : res.stageCompleted ? x.stageDone(res.stage + 1) : t.lessonDone;
    const eyebrow = res.final ? lv.title : `${t.stage} ${res.stage + 1} · ${lv.lessons[res.lesson]}`;
    const confetti = big ? Array.from({ length: 24 }, (_, i) => `<i style="left:${(i * 173) % 1240 + 10}px;top:${(i * 97) % 150 + (i % 3 ? 10 : 640)}px;width:${14 + (i % 3) * 6}px;background:${['#2F6FED', '#FF9F1C', '#22A86B', '#E5484D', '#FFC83D'][i % 5]};transform:rotate(${(i * 37) % 90 - 45}deg)"></i>`).join('') : '';
    view.innerHTML = `<section class="screen ${big ? 'sdone' : 'lend'}"><div class="confetti">${confetti}</div>${big ? '' : '<div class="disc"></div>'}
      <img class="${big ? 'hero' : 'bone'}" src="${big ? IMG.celebrate : IMG.bone}" alt="Atlas" draggable="false">
      <div class="col tcol"><div class="eb">${esc(eyebrow)}</div><h1>${esc(title)}</h1>
        <div class="tiles"><div class="tile"><span class="lbl">${esc(t.exercises)}</span><span class="big">${res.total}/${res.total}</span></div>
          <div class="tile"><span class="lbl">${esc(t.perfectN)}</span><span class="big green">${res.perfect}</span></div></div>
        ${res.final ? `<div class="tile bossrow"><span class="big gold">★ ${esc(x.star)}</span></div>` : ''}
        <button class="bigbtn ${big ? 'orange' : 'green'}" id="go">${esc(t.backMap)}</button></div></section>`;
    $('go').onclick = () => tmap(lang, id);
  }


  // =====================================================================
  // Test mode (only on the staging site, or with #dev / ?dev in the address):
  // jump to any language, level, stage and lesson; skip exercises.
  // =====================================================================
  const DEV = /^staging--/.test(location.hostname) || /[?&]dev\b/.test(location.search) || location.hash === '#dev';
  function devPanel() {
    const langs = LE.LANGS; const old = document.getElementById('devpanel'); if (old) { old.remove(); return; }
    const el = document.createElement('div'); el.id = 'devpanel'; el.className = 'devpanel';
    const levelsOf = (l) => [{ id: 'numbers', title: 'Nivel 1 · Números', stages: 4, lessons: 4 }].concat((window.LEVELS[l] || []).map((lv) => ({ id: lv.id, title: lv.title, stages: lv.stages.length, lessons: lv.lessons.length })));
    el.innerHTML = `<div class="devcard"><b>Modo prueba</b>
      <label>Idioma <select id="dvL">${langs.map((l) => `<option value="${l}">${({ en: 'English', es: 'Español', ca: 'Català' })[l]}</option>`).join('')}</select></label>
      <label>Nivel <select id="dvV"></select></label>
      <label>Etapa <select id="dvS"></select></label>
      <label>Lección <select id="dvN"></select></label>
      <div class="devrow"><button id="dvGo" class="dvb main">Ir al mapa</button><button id="dvPlay" class="dvb">Jugar ya</button></div>
      <div class="devrow"><button id="dvSkip" class="dvb">Saltar ejercicio</button><button id="dvReset" class="dvb warn">Borrar progreso</button></div>
      <button id="dvClose" class="dvb">Cerrar</button></div>`;
    stage.appendChild(el);
    // changing one menu keeps what was already picked in the others whenever it still exists
    const keep = (id, v) => { const o = $(id).querySelector(`option[value="${v}"]`); if (o) $(id).value = v; };
    const fill = () => { const l = $('dvL').value, lv = levelsOf(l), prev = $('dvV').value;
      $('dvV').innerHTML = lv.map((v) => `<option value="${v.id}">${esc(v.title)}</option>`).join(''); if (prev) keep('dvV', prev); fillS(); };
    const fillS = () => { const v = levelsOf($('dvL').value).find((x) => x.id === $('dvV').value);
      const ps = $('dvS').value, pn = $('dvN').value;
      $('dvS').innerHTML = Array.from({ length: v.stages }, (_, i) => `<option value="${i}">Etapa ${i + 1}</option>`).join('') + `<option value="${v.stages}">Etapa final</option>`;
      $('dvN').innerHTML = Array.from({ length: v.lessons }, (_, i) => `<option value="${i}">Lección ${i + 1}</option>`).join('') + (v.id === 'numbers' ? '<option value="4">Repaso</option>' : '');
      if (ps) keep('dvS', ps); if (pn) keep('dvN', pn); };
    $('dvL').onchange = fill; $('dvV').onchange = fillS;
    // start from where you are now (language and level on screen), not always English
    const here = document.documentElement.lang; $('dvL').value = LE.LANGS.includes(here) ? here : (LE.db.lastLang || 'en');
    fill(); if (G && G.id && G.lang === $('dvL').value) keep('dvV', G.id); fillS();
    const jump = () => { const l = $('dvL').value, id = $('dvV').value, s = Number($('dvS').value), n = Number($('dvN').value);
      LE.db.lastLang = l;
      if (id === 'numbers') { const st = LE.L(l); st.stagesDone = s; st.lesson = s >= 4 ? 0 : n; st.finalDone = false; st.current = null; }
      else { const st = tState(l, id); st.stage = s; st.lesson = n; st.finalDone = false; st.current = null; }
      LE.save(); el.remove(); document.querySelectorAll('.overlay').forEach((o) => o.remove()); return { l, id }; };
    $('dvGo').onclick = () => { const { l, id } = jump(); id === 'numbers' ? map(l) : tmap(l, id); };
    $('dvPlay').onclick = () => { const { l, id } = jump(); id === 'numbers' ? game(l) : tgame(l, id); };
    $('dvSkip').onclick = () => { el.remove(); devSkip(); };
    $('dvReset').onclick = () => { LE.resetAll(); el.remove(); welcome(); };
    $('dvClose').onclick = () => el.remove();
  }
  function devSkip() {                 // answer the current exercise correctly
    if (!G || !document.querySelector('.screen.game')) return;
    if (G.topic && G.ex.kind === 'choice') return tChoose(G.ex.answer);
    if (G.topic && G.ex.kind === 'split') { if (!G.splitDone) { G.cuts = new Set(G.ex.cuts); checkSplit(); } if (G.ex.decide && !G.done) tChoose(G.ex.answer); return; }
    if (G.topic && G.ex.kind === 'sort') { G.ex.words.forEach((x) => { G.place[x.w] = x.bin; }); return checkSort(); }
    if (G.isBonus) { G.rows.forEach((w, r) => w.forEach((c, i) => { G.typed[r * CFG.bonusBoxes + i] = c; })); return check(); }
    G.typed = G.letters.slice(); check();
  }
  if (DEV) {
    const b = document.createElement('button'); b.className = 'devbtn'; b.textContent = 'PRUEBA'; b.setAttribute('aria-label', 'Modo prueba');
    b.onclick = devPanel; document.body.appendChild(b);
  }

  // ---------- boot ----------
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('resize', fit);
  LE.loadPlayers(); LE.load(); fit(); welcome();
  window.__atlas = { get G() { return G; }, map, language, welcome, game, levels, tmap, tgame, LE };   // used by automated tests
})();
