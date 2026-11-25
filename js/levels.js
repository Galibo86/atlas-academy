// Atlas Academy — topic levels (content + lesson plans). The numbers level lives in content.js / learning.js.
(function () {
  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const GAP = '<span class="gapw">_____</span>';

  // ---------------- English · comparatives & superlatives ----------------
  // [adjective, comparative, superlative, comparative sentence (___ than), superlative sentence (the ___)]
  const ADJ = [
    [['tall', 'taller', 'tallest', 'A giraffe is ___ than a horse.', 'The giraffe is the ___ animal.'],
     ['small', 'smaller', 'smallest', 'A mouse is ___ than a cat.', 'The ant is the ___ animal here.'],
     ['fast', 'faster', 'fastest', 'Atlas is ___ than a cat.', 'The cheetah is the ___ animal.'],
     ['long', 'longer', 'longest', 'A snake is ___ than a worm.', 'The snake is the ___ of all.'],
     ['old', 'older', 'oldest', 'Grandpa is ___ than Dad.', 'Grandma is the ___ in my family.']],
    [['large', 'larger', 'largest', 'A whale is ___ than a shark.', 'The whale is the ___ animal in the sea.'],
     ['nice', 'nicer', 'nicest', 'This cake is ___ than that one.', 'This is the ___ cake in the shop.'],
     ['safe', 'safer', 'safest', 'The park is ___ than the road.', 'Home is the ___ place.'],
     ['wide', 'wider', 'widest', 'The river is ___ than the road.', 'This is the ___ street in town.'],
     ['cute', 'cuter', 'cutest', 'The puppy is ___ than the cat.', 'Atlas is the ___ dog in the world.']],
    [['big', 'bigger', 'biggest', 'The forest is ___ than the ant.', 'The elephant is the ___ animal in the zoo.'],
     ['hot', 'hotter', 'hottest', 'Summer is ___ than spring.', 'August is the ___ month.'],
     ['sad', 'sadder', 'saddest', 'The rainy day is ___ than the sunny day.', 'That was the ___ film.'],
     ['thin', 'thinner', 'thinnest', 'A pencil is ___ than a book.', 'This is the ___ book on the shelf.'],
     ['wet', 'wetter', 'wettest', 'My boots are ___ than my coat.', 'Atlas is the ___ dog in the park.']],
    [['happy', 'happier', 'happiest', 'Atlas is ___ than the cat.', 'Feli is the ___ kid in the class.'],
     ['funny', 'funnier', 'funniest', 'The clown is ___ than the teacher.', 'This is the ___ joke.'],
     ['easy', 'easier', 'easiest', 'This game is ___ than that one.', 'This is the ___ game.'],
     ['heavy', 'heavier', 'heaviest', 'An elephant is ___ than a horse.', 'The elephant is the ___ animal.'],
     ['tiny', 'tinier', 'tiniest', 'An ant is ___ than a bee.', 'The ant is the ___ animal.']]
  ];
  // final stage: comparative + superlative of the same adjective in one sentence
  const DOUBLE = [
    ['tall', 'A horse is ___ than a dog, but the giraffe is the ___ of all.'],
    ['small', 'A cat is ___ than a dog, but the mouse is the ___ of all.'],
    ['fast', 'Atlas is ___ than the cat, but the cheetah is the ___ animal.'],
    ['long', 'A snake is ___ than a worm, but the train is the ___ of all.'],
    ['old', 'Dad is ___ than me, but Grandpa is the ___ in my family.'],
    ['large', 'A shark is ___ than a fish, but the whale is the ___ animal in the sea.'],
    ['nice', 'This cake is ___ than that one, but Grandma\'s cake is the ___ of all.'],
    ['safe', 'The park is ___ than the road, but home is the ___ place.'],
    ['wide', 'The street is ___ than the path, but the river is the ___ of all.'],
    ['cute', 'The kitten is ___ than the cat, but Atlas is the ___ dog in the world.'],
    ['big', 'A dog is ___ than a cat, but the elephant is the ___ animal in the zoo.'],
    ['hot', 'Spring is ___ than winter, but August is the ___ month.'],
    ['sad', 'This film is ___ than that one, but the last film is the ___ of all.'],
    ['thin', 'A pencil is ___ than a book, but a hair is the ___ of all.'],
    ['wet', 'My coat is ___ than my hat, but my boots are the ___ of all.'],
    ['happy', 'The cat is ___ than the fish, but Atlas is the ___ dog in the park.'],
    ['funny', 'Dad is ___ than Mum, but the clown is the ___ of all.'],
    ['easy', 'Maths is ___ than English today, but art is the ___ lesson.'],
    ['heavy', 'A horse is ___ than a dog, but the elephant is the ___ animal.'],
    ['tiny', 'A bee is ___ than a bird, but the ant is the ___ of all.']
  ];
  const RULES = ['tall → taller', 'nice → nicer', 'big → bigger', 'happy → happier'];
  function wrongForm(stage, a, sup) {        // a believable spelling mistake for each rule
    if (stage === 0) return (sup ? 'most ' : 'more ') + a;
    if (stage === 1) return a + (sup ? 'est' : 'er');
    if (stage === 2) return a + (sup ? 'est' : 'er');
    return a + (sup ? 'est' : 'er');
  }
  function sentence(s, mode) {               // mode: 'one' (write/choose one word) or 'two' (write the word + than / the + word)
    let html = esc(s);
    if (mode === 'two') html = html.replace('___ than', `${GAP} ${GAP}`).replace('the ___', `${GAP} ${GAP}`);
    else html = html.replace('___', GAP);
    return html;
  }
  function cmpExercise(stage, item, sup, kind) {
    const [a, c, su, sc, ss] = item; const ans = sup ? su : c; const s = sup ? ss : sc;
    const prompt = `<div class="tsent">${sentence(s, kind === 'write2' ? 'two' : 'one')}</div><div class="tadj">(${esc(a)})</div>`;
    if (kind === 'choice') return { kind: 'choice', id: a, prompt, options: shuffle([ans, sup ? c : su, wrongForm(stage, a, sup)]), answer: ans,
      explain: `${a} → ${c} → the ${su}` };
    const answer = kind === 'write2' ? (sup ? `the ${su}` : `${c} than`) : ans;
    return { kind: 'write', id: a, prompt, answer, explain: `${a} → ${c} → the ${su}` };
  }
  const COMPARE = {
    id: 'compare', lang: 'en', title: 'Comparatives & superlatives', sub: 'bigger · the biggest', color: '#2F6FED',
    stages: ADJ.map((items, i) => ({ label: RULES[i], items })),
    lessons: ['Choose: comparative', 'Choose: superlative', 'Write the word', 'Write two words'],
    lessonDesc: ['Pick the right word for “… than …”', 'Pick the right word for “the …”', 'Write the missing word', 'Write the word and “than” or “the”'],
    chip: ['Choose the word', 'Choose the word', 'Write the word', 'Write the two words'],
    plan(stage, lesson) {
      const items = shuffle(ADJ[stage]);
      if (lesson === 0) return items.map((it) => cmpExercise(stage, it, false, 'choice'));
      if (lesson === 1) return items.map((it) => cmpExercise(stage, it, true, 'choice'));
      if (lesson === 2) return items.map((it) => cmpExercise(stage, it, Math.random() < 0.5, 'write'));
      return items.map((it) => cmpExercise(stage, it, Math.random() < 0.5, 'write2'));
    },
    // Final stage: one sentence with both forms, he writes "… than" and "the …" (two rows of boxes)
    final() { return shuffle(DOUBLE).slice(0, 10).map(([a, s]) => { const [, c, su] = ADJ.flat().find((x) => x[0] === a);
      let k = 0; const html = esc(s).replace(/___ than|the ___/g, () => `<span class="nw"><span class="gapn">${++k}</span>${GAP} ${GAP}</span>`);
      return { kind: 'write', id: a, prompt: `<div class="tsent">${html}</div><div class="tadj">(${esc(a)})</div>`, answer: `${c} than|the ${su}`,
        explain: `${a} → ${c} → the ${su}`, chip: 'Write both' }; }); },
    finalDesc: '10 sentences with both forms: “… than” and “the …”. Atlas has 5 bones for the whole challenge.'
  };

  // ---------------- Castellano · hiato o diptongo ----------------
  // [palabra, sílabas correctas, separación incorrecta, par de vocales, 'D' | 'H']
  const HD = [
    [['aire', 'ai-re', 'a-i-re', 'ai', 'D'], ['agua', 'a-gua', 'a-gu-a', 'ua', 'D'], ['nieve', 'nie-ve', 'ni-e-ve', 'ie', 'D'], ['cielo', 'cie-lo', 'ci-e-lo', 'ie', 'D'], ['piano', 'pia-no', 'pi-a-no', 'ia', 'D'],
     ['león', 'le-ón', 'león', 'eó', 'H'], ['río', 'rí-o', 'río', 'ío', 'H'], ['día', 'dí-a', 'día', 'ía', 'H'], ['tía', 'tí-a', 'tía', 'ía', 'H'], ['frío', 'frí-o', 'frío', 'ío', 'H']],
    [['ciudad', 'ciu-dad', 'ci-u-dad', 'iu', 'D'], ['cuerpo', 'cuer-po', 'cu-er-po', 'ue', 'D'], ['causa', 'cau-sa', 'ca-u-sa', 'au', 'D'], ['peine', 'pei-ne', 'pe-i-ne', 'ei', 'D'], ['huevo', 'hue-vo', 'hu-e-vo', 'ue', 'D'],
     ['país', 'pa-ís', 'país', 'aí', 'H'], ['maíz', 'ma-íz', 'maíz', 'aí', 'H'], ['poeta', 'po-e-ta', 'poe-ta', 'oe', 'H'], ['teatro', 'te-a-tro', 'tea-tro', 'ea', 'H'], ['búho', 'bú-ho', 'búho', 'úo', 'H']],
    [['bueno', 'bue-no', 'bu-e-no', 'ue', 'D'], ['reina', 'rei-na', 're-i-na', 'ei', 'D'], ['jaula', 'jau-la', 'ja-u-la', 'au', 'D'], ['fuego', 'fue-go', 'fu-e-go', 'ue', 'D'], ['puerta', 'puer-ta', 'pu-er-ta', 'ue', 'D'],
     ['leer', 'le-er', 'leer', 'ee', 'H'], ['cacao', 'ca-ca-o', 'ca-cao', 'ao', 'H'], ['canoa', 'ca-no-a', 'ca-noa', 'oa', 'H'], ['océano', 'o-cé-a-no', 'o-céa-no', 'éa', 'H'], ['héroe', 'hé-ro-e', 'hé-roe', 'oe', 'H']]
  ];
  function markPair(w, pair) {               // highlight the two vowels (also across a silent h: bú-h-o)
    const i = w.indexOf(pair); if (i >= 0) return esc(w.slice(0, i)) + `<b class="vp">${esc(pair)}</b>` + esc(w.slice(i + pair.length));
    const m = w.match(new RegExp(pair[0] + 'h' + pair[1]));
    if (m) { const j = m.index; return esc(w.slice(0, j)) + `<b class="vp">${esc(pair[0])}</b>h<b class="vp">${esc(pair[1])}</b>` + esc(w.slice(j + 3)); }
    return esc(w);
  }
  const whyOf = (syl, t) => (t === 'D' ? `${syl}: las dos vocales van en la misma sílaba → diptongo` : `${syl}: las vocales van en sílabas distintas → hiato`);
  const typeOf = (t) => (t === 'D' ? 'Diptongo' : 'Hiato');
  function cutsOf(syl) {                       // 'pa-ís' → [1]: a cut after letter 1
    const c = []; let k = 0; Array.from(syl).forEach((ch) => { if (ch === '-') c.push(k - 1); else k++; }); return c;
  }
  function hdHelp(item) {                      // lesson 1: vowel pair in colour, choose
    const [w, syl, , pair, t] = item;
    return { kind: 'choice', id: w, prompt: `<div class="tword">${markPair(w, pair)}</div><div class="tadj">Diptongo: misma sílaba · Hiato: sílabas distintas</div>`,
      options: ['Diptongo', 'Hiato'], answer: typeOf(t), explain: whyOf(syl, t) };
  }
  function hdSplit(item, decide) {             // lessons 2 and 3: tap between letters to cut; lesson 3 then decides
    const [w, syl, , , t] = item;
    return { kind: 'split', id: w, word: w, cuts: cutsOf(syl), decide, options: decide ? ['Diptongo', 'Hiato'] : null,
      answer: decide ? typeOf(t) : syl, answerText: decide ? `${syl} · ${typeOf(t)}` : syl,
      prompt: `<div class="tadj big">${decide ? 'Primero corta la palabra en sílabas. Después: ¿hiato o diptongo?' : 'Toca entre las letras para cortar la palabra en sílabas'}</div>`,
      explain: whyOf(syl, t) };
  }
  function hdSort(items) {                     // final stage: put each word in its basket
    return { kind: 'sort', id: 'sort', words: shuffle(items.map(([w, syl, , , t]) => ({ w, syl, bin: t === 'D' ? 1 : 2 }))), bins: ['Diptongo', 'Hiato'],
      prompt: '<div class="tadj big">Toca una palabra y después su cesta</div>', explain: 'Diptongo: vocales en la misma sílaba · Hiato: en sílabas distintas' };
  }
  const HIATO = {
    id: 'hiato', lang: 'es', title: '¿Hiato o diptongo?', sub: 'ca-mión · le-ón', color: '#E5484D',
    stages: HD.map((items, i) => ({ label: ['aire, río…', 'ciudad, país…', 'bueno, leer…'][i], items })),
    lessons: ['Con pista', 'Corta la palabra', 'Corta y decide'],
    lessonDesc: ['Las dos vocales vienen marcadas en color', 'Toca entre las letras para separar las sílabas', 'Corta la palabra y di si es hiato o diptongo'],
    chip: ['¿Hiato o diptongo?', 'Separa en sílabas', 'Separa y decide'],
    plan(stage, lesson) { const items = shuffle(HD[stage]); return lesson === 0 ? items.map(hdHelp) : items.map((it) => hdSplit(it, lesson === 2)); },
    final() { const all = HD.flat(); return [hdSort(shuffle(all.filter((x) => x[4] === 'D')).slice(0, 5).concat(shuffle(all.filter((x) => x[4] === 'H')).slice(0, 5)))]; },
    finalDesc: 'Clasifica 10 palabras en dos cestas: Diptongo e Hiato. Atlas tiene 5 huesos para todo el reto.'
  };

  window.LEVELS = { en: [COMPARE], es: [HIATO], ca: [] };
})();
