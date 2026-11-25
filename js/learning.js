// Atlas Academy — learning logic: lesson plans, clues, mastery and saved progress.
window.LEARN = (function () {
  const C = window.CONTENT;
  const CFG = C.config;
  // Each player has their own saved progress on this tablet. No email, no server.
  const OLDKEY = 'atlas-academy-v1', PKEY = 'atlas-academy-players';
  let KEY = OLDKEY, players = null;
  const keyFor = (id) => OLDKEY + ':' + id;
  function savePlayers() { try { localStorage.setItem(PKEY, JSON.stringify(players)); } catch (e) {} }
  function loadPlayers() {
    try { players = JSON.parse(localStorage.getItem(PKEY)); } catch (e) { players = null; }
    if (!players || !Array.isArray(players.list)) {
      players = { active: null, list: [] };
      let old = null; try { old = localStorage.getItem(OLDKEY); } catch (e) {}
      if (old) {                                   // progress from before players existed belongs to Feli
        players.list.push({ id: 'p1', name: 'Feli', locked: true }); players.active = 'p1';
        try { localStorage.setItem(keyFor('p1'), old); } catch (e) {}
      }
      savePlayers();
    }
    players.list.forEach((x) => { if (x.id === 'p1' || x.name.toLowerCase() === 'feli') x.locked = true; });   // Feli's profile can only be deleted in admin mode
    if (players.active && !players.list.some((x) => x.id === players.active)) players.active = null;
    KEY = players.active ? keyFor(players.active) : OLDKEY + ':none';
    return players;
  }
  function usePlayer(id) { players.active = id; savePlayers(); KEY = keyFor(id); load(); }
  function addPlayer(name) { const id = 'p' + Date.now().toString(36); players.list.push({ id, name, locked: name.toLowerCase() === 'feli' || undefined }); usePlayer(id); return id; }
  function removePlayer(id) {
    players.list = players.list.filter((x) => x.id !== id); try { localStorage.removeItem(keyFor(id)); } catch (e) {}
    if (players.active === id) players.active = null; savePlayers(); loadPlayers(); load();
  }
  function backup() {
    const out = { app: 'atlas-academy', when: new Date().toISOString(), players, data: {} };
    players.list.forEach((x) => { try { out.data[x.id] = JSON.parse(localStorage.getItem(keyFor(x.id))); } catch (e) {} });
    return out;
  }
  function restore(b) {
    if (!b || b.app !== 'atlas-academy' || !b.players || !Array.isArray(b.players.list)) throw new Error('not a backup');
    Object.entries(b.data || {}).forEach(([id, d]) => { if (d) localStorage.setItem(keyFor(id), JSON.stringify(d)); });
    players = b.players; savePlayers(); loadPlayers(); load();
  }
  function setPin(id, pin) { const x = players.list.find((p) => p.id === id); if (!x) return; if (pin) x.pin = pin; else delete x.pin; savePlayers(); }
  const player = () => (players && players.list.find((x) => x.id === players.active)) || null;
  const LANGS = ['en', 'es', 'ca'];

  // ---------- storage ----------
  function blankLang() {
    const perf = {};
    for (let n = 1; n <= 20; n++) perf[n] = { B: 0, C1: 0, C2: 0, fails: 0 };
    return { stagesDone: 0, lesson: 0, finalDone: false, perf, current: null };
  }
  let db = null;
  function load() {
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
    if (!db || !db.langs) db = { lastLang: null, langs: {} };
    LANGS.forEach((l) => { if (!db.langs[l]) db.langs[l] = blankLang(); });
    return db;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* storage unavailable: play on */ } }
  function resetAll() { try { localStorage.removeItem(KEY); } catch (e) {} load(); }
  const L = (lang) => db.langs[lang];

  // ---------- helpers ----------
  const word = (lang, n) => C.numbers[lang][n - 1].normalize('NFC');
  const stageNums = (s) => { const [a, b] = CFG.stages[s]; const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function mastered(p) { return p.B + p.C1 + p.C2 >= CFG.repsToMaster && p.B > 0 && p.C1 > 0 && p.C2 > 0; }
  function weight(p) { return 1 + p.fails * 2 + (mastered(p) ? 0 : 1); }
  function weightedPick(nums, perf, avoid) {
    const pool = nums.filter((n) => n !== avoid);
    const list = pool.length ? pool : nums;
    let total = 0; list.forEach((n) => { total += weight(perf[n]); });
    let r = Math.random() * total;
    for (const n of list) { r -= weight(perf[n]); if (r <= 0) return n; }
    return list[list.length - 1];
  }

  // ---------- clue questions ----------
  function clue(lang, n, useWords, maxKnown) {
    const limit = useWords ? maxKnown : 20;
    const opts = [];
    if (n + 1 <= limit) opts.push('before');
    if (n - 1 >= 1) opts.push('after');
    if (n - 1 >= 1 && n + 1 <= limit) opts.push('between');
    if (!opts.length) return null;
    const kind = rand(opts);
    const fmt = (r) => (useWords ? word(lang, r) : String(r));
    const vowel = (r) => /^[aeiouàèéíòóú]/i.test(word(lang, r));
    const Q = C.clues[lang];
    if (kind === 'before') return Q.before(fmt(n + 1), vowel(n + 1));
    if (kind === 'after') return Q.after(fmt(n - 1), vowel(n - 1));
    return Q.between(fmt(n - 1), fmt(n + 1), vowel(n - 1), vowel(n + 1));
  }
  function withClue(lang, ex, maxKnown) {
    if (ex.type === 'C1' || ex.type === 'C2') {
      const text = clue(lang, ex.n, ex.type === 'C2', maxKnown);
      if (!text) return { n: ex.n, type: 'B' };     // no valid clue: fall back to the digit
      return Object.assign({}, ex, { text });
    }
    return ex;
  }

  // Order: never the same number twice in a row
  function finishPlan(lang, items, maxKnown) {
    const plan = items.map((e) => withClue(lang, e, maxKnown));
    const ok = (p) => p.every((e, i) => i === 0 || e.n !== p[i - 1].n);
    for (let tries = 0; tries < 300 && !ok(plan); tries++) {
      const i = plan.findIndex((e, k) => k > 0 && e.n === plan[k - 1].n);
      const k = Math.floor(Math.random() * plan.length);
      if (k !== i && plan[k].type !== 'A' && plan[i].type !== 'A') [plan[i], plan[k]] = [plan[k], plan[i]];
    }
    return plan;
  }

  // Each lesson visits the 5 numbers of the stage once (no repeats); from stage 2 on, +2 earlier numbers and a final Bonus
  function planLesson(lang) {
    const st = L(lang); const s = st.stagesDone; const N = stageNums(s); const perf = st.perf;
    const maxKnown = (s + 1) * 5; const prev = []; for (let i = 1; i <= s * 5; i++) prev.push(i);
    const reviews = (type) => shuffle(prev).sort((a, b) => weight(perf[b]) - weight(perf[a])).slice(0, CFG.reviewsPerLesson).map((n) => ({ n, type }));
    let items;
    if (st.lesson === 4) {                                     // review lesson: only what is still missing
      items = [];
      N.forEach((n) => { const p = perf[n]; if (!mastered(p)) { ['B', 'C1', 'C2'].forEach((ty) => { if (!p[ty]) items.push({ n, type: ty }); }); if (p.B + p.C1 + p.C2 < CFG.repsToMaster && p.B && p.C1 && p.C2) items.push({ n, type: rand(['B', 'C1', 'C2']) }); } });
      if (!items.length) items = N.map((n) => ({ n, type: rand(['B', 'C1', 'C2']) }));
    } else {
      const type = ['B', 'B', 'C1', 'C2'][st.lesson];
      items = N.filter((n) => !(s === 0 && st.lesson === 0 && n === 1)).map((n) => ({ n, type }));
      if (s > 0) items = items.concat(reviews(st.lesson <= 1 ? 'B' : rand(['B', type])));
    }
    let plan = finishPlan(lang, shuffle(items), maxKnown);
    if (s === 0 && st.lesson === 0) plan = [{ n: 1, type: 'A' }].concat(plan);   // the only copy-it model of the game
    if (s > 0) {                                                                   // Bonus: 3 numbers, extra boxes, shared bones
      const pool = shuffle(Array.from({ length: maxKnown }, (_, i) => i + 1)).slice(0, 3);
      plan.push({ type: 'BONUS', nums: pool, n: pool[0] });
    }
    return plan;
  }

  function planFinal(lang) {
    const nums = shuffle(Array.from({ length: 20 }, (_, i) => i + 1)).slice(0, CFG.finalLength);
    return finishPlan(lang, nums.map((n) => ({ n, type: rand(['B', 'C1', 'C2']) })), 20);
  }
  function planPractice(lang) {
    const perf = L(lang).perf;
    const nums = Array.from({ length: 20 }, (_, i) => i + 1).sort((a, b) => perf[b].fails - perf[a].fails || Math.random() - 0.5).slice(0, CFG.lessonLength);
    return finishPlan(lang, shuffle(nums).map((n) => ({ n, type: rand(['B', 'C2']) })), 20);
  }

  // ---------- session ----------
  function startCurrent(lang, kind) {
    const st = L(lang);
    if (st.current && (!kind || st.current.kind === kind)) return st.current;
    const k = kind || (st.stagesDone >= 4 && !st.finalDone ? 'final' : 'lesson');
    const plan = k === 'final' ? planFinal(lang) : k === 'practice' ? planPractice(lang) : planLesson(lang);
    st.current = { kind: k, stage: st.stagesDone, lesson: st.lesson, plan, idx: 0, perfect: 0, bonesLeft: CFG.finalBones };
    save(); return st.current;
  }
  function record(lang, ex, perfect) {
    const st = L(lang); const p = st.perf[ex.n];
    if (ex.type === 'BONUS') { if (st.current) st.current.bonus = perfect ? 'won' : 'lost'; }
    else if (ex.type !== 'A') { if (perfect) p[ex.type] += 1; else p.fails += 1; }
    if (perfect && ex.type !== 'A' && ex.type !== 'BONUS' && st.current) st.current.perfect += 1;
    if (st.current) st.current.idx += 1;
    save();
  }
  // Called when the session's last exercise is done. Returns what happened.
  function finishSession(lang) {
    const st = L(lang); const cur = st.current; st.current = null;
    const out = { kind: cur.kind, stage: cur.stage, lesson: cur.lesson, perfect: cur.perfect, total: cur.plan.filter((e) => e.type !== 'BONUS').length, bonus: cur.bonus || null, stageCompleted: false, bonesLeft: cur.bonesLeft };
    if (cur.kind === 'final') { st.finalDone = true; out.levelCompleted = true; }
    else if (cur.kind === 'lesson') {
      if (st.lesson < 3) st.lesson += 1;
      else if (stageNums(st.stagesDone).every((n) => mastered(st.perf[n]))) { st.stagesDone += 1; st.lesson = 0; out.stageCompleted = true; }
      else st.lesson = 4;
    }
    save(); return out;
  }
  function abandonFinal(lang) { L(lang).current = null; save(); }

  return { setPin, backup, restore, loadPlayers, usePlayer, addPlayer, removePlayer, player, get players() { return players; },
    load, save, resetAll, L, word, stageNums, mastered, startCurrent, record, finishSession, abandonFinal, LANGS,
    get db() { return db; } };
})();
