// Atlas Academy — French (Français): four vocabulary levels. Uses the same topic engine as
// comparatives and hiato. The clue is the word in Spanish (and English underneath).
(function () {
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const PER_LESSON = 8;                       // a lesson never has more than 8 words
  const BONUS = 2;                            // from stage 2: 2 words from earlier stages at the end

  // [french, spanish, english, extra] — extra: 'n' = show a digit, '#hex' = show a colour
  const GREET = [
    [['bonjour', 'hola · buenos días', 'hello'], ['salut', '¡hola! (con amigos)', 'hi'], ['au revoir', 'adiós', 'goodbye'], ['merci', 'gracias', 'thank you'], ['s’il te plaît', 'por favor', 'please']],
    [['comment ça va ?', '¿qué tal?', 'how are you?'], ['ça va bien', 'estoy bien', 'I’m fine'], ['bonsoir', 'buenas tardes · buenas noches', 'good evening'], ['à bientôt', 'hasta pronto', 'see you soon'], ['bonne nuit', 'buenas noches (al dormir)', 'good night']],
    [['je m’appelle', 'me llamo', 'my name is'], ['comment tu t’appelles ?', '¿cómo te llamas?', 'what’s your name?'], ['j’ai huit ans', 'tengo ocho años', 'I’m eight'], ['quel âge as-tu ?', '¿cuántos años tienes?', 'how old are you?'], ['enchanté', 'encantado', 'nice to meet you']]
  ];
  const NUMW = { 0: 'zéro', 1: 'un', 2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq', 6: 'six', 7: 'sept', 8: 'huit', 9: 'neuf', 10: 'dix', 11: 'onze', 12: 'douze', 13: 'treize', 14: 'quatorze', 15: 'quinze', 16: 'seize', 17: 'dix-sept', 18: 'dix-huit', 19: 'dix-neuf', 20: 'vingt', 30: 'trente', 40: 'quarante', 50: 'cinquante' };
  const numFr = (n) => NUMW[n] || (() => { const t = Math.floor(n / 10) * 10, u = n % 10; return NUMW[t] + (u === 1 ? ' et un' : '-' + NUMW[u]); })();
  const nums = (list) => list.map((n) => [numFr(n), String(n), String(n), 'n']);
  const NUMCOL = [
    nums([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    nums([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]),
    nums([21, 22, 23, 24, 25, 26, 27, 28, 29, 30]),
    nums([31, 32, 35, 38, 40, 41, 44, 47, 49, 50]),
    [['rouge', 'rojo', 'red', '#E5484D'], ['bleu', 'azul', 'blue', '#2F6FED'], ['vert', 'verde', 'green', '#22A86B'], ['jaune', 'amarillo', 'yellow', '#FFC83D'], ['noir', 'negro', 'black', '#1B2A4A'],
     ['blanc', 'blanco', 'white', '#FFFFFF'], ['rose', 'rosa', 'pink', '#F472B6'], ['orange', 'naranja', 'orange', '#FF9F1C'], ['gris', 'gris', 'grey', '#9CA3AF'], ['marron', 'marrón', 'brown', '#8B5A2B']]
  ];
  const AROUND = [
    [['la mère', 'la madre', 'mother'], ['le père', 'el padre', 'father'], ['le frère', 'el hermano', 'brother'], ['la sœur', 'la hermana', 'sister'], ['le bébé', 'el bebé', 'baby'], ['la grand-mère', 'la abuela', 'grandmother'], ['le grand-père', 'el abuelo', 'grandfather']],
    [['le chien', 'el perro', 'dog'], ['le chat', 'el gato', 'cat'], ['l’oiseau', 'el pájaro', 'bird'], ['le poisson', 'el pez', 'fish'], ['le lapin', 'el conejo', 'rabbit'], ['le cheval', 'el caballo', 'horse'], ['la souris', 'el ratón', 'mouse'], ['la vache', 'la vaca', 'cow']],
    [['l’école', 'el colegio', 'school'], ['le crayon', 'el lápiz', 'pencil'], ['le stylo', 'el bolígrafo', 'pen'], ['la gomme', 'la goma', 'rubber'], ['la règle', 'la regla', 'ruler'], ['le livre', 'el libro', 'book'], ['le cahier', 'el cuaderno', 'exercise book'], ['la trousse', 'el estuche', 'pencil case']],
    [['le pantalon', 'el pantalón', 'trousers'], ['la robe', 'el vestido', 'dress'], ['la jupe', 'la falda', 'skirt'], ['le pull', 'el jersey', 'jumper'], ['la chemise', 'la camisa', 'shirt'], ['les chaussures', 'los zapatos', 'shoes'], ['le chapeau', 'el sombrero', 'hat'], ['les chaussettes', 'los calcetines', 'socks']]
  ];
  const TIME = [
    [['lundi', 'lunes', 'Monday'], ['mardi', 'martes', 'Tuesday'], ['mercredi', 'miércoles', 'Wednesday'], ['jeudi', 'jueves', 'Thursday'], ['vendredi', 'viernes', 'Friday'], ['samedi', 'sábado', 'Saturday'], ['dimanche', 'domingo', 'Sunday']],
    [['janvier', 'enero', 'January'], ['février', 'febrero', 'February'], ['mars', 'marzo', 'March'], ['avril', 'abril', 'April'], ['mai', 'mayo', 'May'], ['juin', 'junio', 'June'],
     ['juillet', 'julio', 'July'], ['août', 'agosto', 'August'], ['septembre', 'septiembre', 'September'], ['octobre', 'octubre', 'October'], ['novembre', 'noviembre', 'November'], ['décembre', 'diciembre', 'December']],
    [['le printemps', 'la primavera', 'spring'], ['l’été', 'el verano', 'summer'], ['l’automne', 'el otoño', 'autumn'], ['l’hiver', 'el invierno', 'winter'], ['il fait beau', 'hace buen tiempo', 'it’s sunny'], ['il pleut', 'llueve', 'it’s raining'], ['il neige', 'nieva', 'it’s snowing'], ['il fait froid', 'hace frío', 'it’s cold']],
    [['je me lève', 'me levanto', 'I get up'], ['je mange', 'como', 'I eat'], ['je bois', 'bebo', 'I drink'], ['je joue', 'juego', 'I play'], ['je lis', 'leo', 'I read'], ['je dors', 'duermo', 'I sleep'], ['je vais à l’école', 'voy al cole', 'I go to school'], ['je me lave', 'me lavo', 'I wash']]
  ];

  // the clue shown above the boxes
  function clue(it) {
    const [, es, en, x] = it;
    if (x === 'n') return `<div class="tword">${esc(es)}</div>`;
    if (x && x[0] === '#') return `<div class="swatch big" style="background:${x}" role="img" aria-label="${esc(en)}"></div>`;   // colours: only the colour, no words
    return `<div class="tword sm">${esc(es)}</div><div class="tadj">${esc(en)}</div>`;
  }
  // long answers go on two rows, split at the space nearest the middle
  function rows(w) {
    if (w.length <= 13 || !w.includes(' ')) return w;
    const mid = w.length / 2; let best = -1;
    for (let i = 0; i < w.length; i++) if (w[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    return w.slice(0, best) + '|' + w.slice(best + 1);
  }
  const write = (it, chip) => ({ kind: 'write', id: it[0], prompt: clue(it), answer: rows(it[0]), answerText: it[0], explain: `${it[1]} → ${it[0]}`, chip });
  // 3 options in stage 1; 4 from stage 2, so with 3 bones he can't get it right just by ruling out
  function choose(it, pool, n) {
    const others = shuffle(pool.filter((x) => x[0] !== it[0])).slice(0, n - 1).map((x) => x[0]);
    return { kind: 'choice', id: it[0], prompt: clue(it), options: shuffle([it[0], ...others]), answer: it[0], explain: `${it[1]} → ${it[0]}` };
  }

  // Same order as the numbers: meet (choose) → write → write without help, and a Bonus from stage 2
  function make(id, title, sub, color, labels, data) {
    return {
      id, lang: 'fr', title, sub, color,
      stages: data.map((items, i) => ({ label: labels[i], items })),
      lessons: ['Découvre', 'Écris', 'Sans aide'],
      lessonDesc: ['Choisis le bon mot en français', 'Écris le mot en français', 'Écris de mémoire, mélangé avec les étapes d’avant'],
      chip: ['Choisis le mot', 'Écris le mot', 'Écris de mémoire'],
      plan(stage, lesson) {
        const items = shuffle(data[stage]).slice(0, PER_LESSON);
        let ex = lesson === 0 ? items.map((it) => choose(it, data[stage], stage === 0 ? 3 : 4)) : items.map((it) => write(it));
        if (lesson === 2 && stage > 0) ex = shuffle(ex.slice(0, PER_LESSON - 2).concat(shuffle(data.slice(0, stage).flat()).slice(0, 2).map((it) => write(it))));
        if (stage > 0) ex = ex.concat(shuffle(data.slice(0, stage).flat()).slice(0, BONUS).map((it) => write(it, 'Bonus · révision')));
        return ex;
      },
      final() { return shuffle(data.flat()).slice(0, 10).map((it) => write(it, 'Étape finale')); },
      finalDesc: '10 mots de toutes les étapes. Atlas a 5 os pour tout le défi.'
    };
  }

  window.LEVELS.fr = [
    make('fr-greet', 'Bonjour ! Salutations', 'bonjour · je m’appelle', '#2F6FED', ['bonjour, merci…', 'comment ça va ?', 'je m’appelle…'], GREET),
    make('fr-numcol', 'Nombres 0–50 et couleurs', 'un, deux… rouge', '#22A86B', ['0 – 10', '11 – 20', '21 – 30', '31 – 50', 'couleurs'], NUMCOL),
    make('fr-around', 'Ma famille et mon école', 'la mère · le chien · le crayon', '#FF9F1C', ['la famille', 'les animaux', 'l’école', 'les vêtements'], AROUND),
    make('fr-time', 'Le temps et ma journée', 'lundi · l’été · je mange', '#8B5CF6', ['les jours', 'les mois', 'saisons et météo', 'ma journée'], TIME)
  ];
})();
