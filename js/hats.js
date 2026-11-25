// Atlas Academy — hats for Atlas: list, how they are won, and where they sit on his head.
// Positions are for the sitting Atlas (assets/atlas-sitting.png): x/y = centre of the hat's base,
// in % of the picture; w = hat width in % of the picture; r = tilt in degrees.
window.HATS = (function () {
  const LIST = [
    // won one per completed stage, in this order
    { id: 'cap', name: { en: 'Cap', es: 'Gorra', ca: 'Gorra' }, x: 56, y: 17.5, w: 56, r: 12 },
    { id: 'party', name: { en: 'Party hat', es: 'Gorro de fiesta', ca: 'Barret de festa' }, x: 58, y: 14.5, w: 30, r: 14 },
    { id: 'chef', name: { en: 'Chef’s hat', es: 'Gorro de chef', ca: 'Barret de xef' }, x: 56, y: 17.5, w: 48, r: 12 },
    { id: 'pirate', name: { en: 'Pirate hat', es: 'Sombrero pirata', ca: 'Barret pirata' }, x: 55, y: 16, w: 70, r: 12 },
    { id: 'viking', name: { en: 'Viking helmet', es: 'Casco vikingo', ca: 'Casc víking' }, x: 55, y: 18, w: 62, r: 12 },
    { id: 'tophat', name: { en: 'Top hat', es: 'Chistera', ca: 'Barret de copa' }, x: 56, y: 15.5, w: 48, r: 12 },
    { id: 'crown', name: { en: 'Crown', es: 'Corona', ca: 'Corona' }, x: 56, y: 16, w: 46, r: 12 },
    { id: 'astro', name: { en: 'Space helmet', es: 'Casco de astronauta', ca: 'Casc d’astronauta' }, x: 51, y: 45, w: 98, r: 6 },
    // seasonal gifts: given on the date, kept forever
    { id: 'santa', season: 'christmas', name: { en: 'Santa hat', es: 'Gorro de Papá Noel', ca: 'Barret de Pare Noel' }, x: 55, y: 17.5, w: 64, r: 12 },
    { id: 'reyes', season: 'reyes', img: null, name: { en: 'Three Kings crown', es: 'Corona de Reyes', ca: 'Corona de Reis' }, x: 56, y: 15, w: 44, r: 12 }
  ];
  const ORDER = LIST.filter((h) => !h.season).map((h) => h.id);
  const get = (id) => LIST.find((h) => h.id === id);
  const src = (h) => (h.img === null ? null : `assets/hats/${h.img || h.id}.png`);
  const available = (h) => !!src(h);                      // Reyes needs its picture before it can be given

  // Which seasonal gifts are due on this date (month is 1-12).
  function seasonDue(d) {
    const m = d.getMonth() + 1, day = d.getDate(), due = [];
    if (m === 12 || (m === 1 && day <= 5)) due.push('santa');
    if (m === 1 && day >= 6) due.push('santa', 'reyes');   // a player who missed December still gets both
    return due;
  }

  // Per-player state lives in the player's saved data: db.hats
  function state(db) {
    db.hats = db.hats || { owned: [], worn: null, earned: 0, pending: [] };
    return db.hats;
  }
  function give(db, id, wear) {
    const s = state(db); if (s.owned.includes(id)) return false;
    s.owned.push(id); s.pending.push(id); if (wear) s.worn = id; return true;
  }
  // Call when a stage is completed: gives the next hat in the order.
  function stageCompleted(db) {
    const s = state(db); s.earned += 1;
    const next = ORDER.find((id) => !s.owned.includes(id));
    return next ? give(db, next, false) && next : null;
  }
  // Call when the player starts playing: seasonal gifts; they are put on Atlas straight away.
  function checkSeason(db, now) {
    const got = [];
    seasonDue(now || new Date()).forEach((id) => { const h = get(id); if (h && available(h) && give(db, id, true)) got.push(id); });
    return got;
  }
  function wear(db, id) { const s = state(db); s.worn = id && s.owned.includes(id) ? id : null; }
  function takePending(db) { const s = state(db); const p = s.pending.slice(); s.pending = []; return p; }

  // HTML: the sitting Atlas with a hat on (or none). cls sizes it.
  function dog(id, cls, alt) {
    const h = id && get(id); const hs = h && src(h);
    return `<div class="hatdog ${cls || ''}"><img class="hd-dog" src="assets/atlas-sitting.png" alt="${alt || 'Atlas'}" draggable="false">${hs ? `<img class="hd-hat" src="${hs}" alt="" draggable="false" style="left:${h.x}%;top:${h.y}%;width:${h.w}%;transform:translate(-50%,-75%) rotate(${h.r}deg)">` : ''}</div>`;
  }
  return { LIST, ORDER, get, src, available, seasonDue, state, give, stageCompleted, checkSeason, wear, takePending, dog };
})();
