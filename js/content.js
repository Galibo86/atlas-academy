// Atlas Academy — educational content and texts (no game logic here)
window.CONTENT = {
  config: {
    repsToMaster: 3,        // perfect answers needed (at least one digit, one digit-clue, one word-clue)
    lessonLength: 8,        // words in a practice session
    reviewsPerLesson: 2,    // earlier numbers added to each lesson from stage 2
    bonusBones: 5,          // bones shared by the 3 words of a Bonus
    bonusBoxes: 10,         // boxes per word in a Bonus (more than any word needs)
    finalLength: 10,        // words in the Final stage
    finalBones: 5,          // bones shared by the whole Final stage
    hintMs: 2000,           // how long the word is shown after the 2nd reset
    livesFor: (n) => (n <= 4 ? 3 : n <= 7 ? 4 : 5),
    stages: [[1, 5], [6, 10], [11, 15], [16, 20]]
  },

  numbers: {
    en: ['one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'],
    es: ['uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte'],
    ca: ['u','dos','tres','quatre','cinc','sis','set','vuit','nou','deu','onze','dotze','tretze','catorze','quinze','setze','disset','divuit','dinou','vint']
  },

  keyboard: {
    en: { accents: [] },
    es: { accents: ['á','é','í','ó','ú','ü','ñ'] },
    ca: { accents: ['à','è','é','í','ï','ò','ó','ú','ü','ç','·'] },
    fr: { accents: ['é','è','ê','ë','à','â','ç','î','ï','ô','ù','û','œ'] }
  },

  // Clue questions. x/a/b are already formatted (digit or word).
  clues: {
    en: {
      before: (x) => `What number comes before ${x}?`,
      after: (x) => `What number comes after ${x}?`,
      between: (a, b) => `What number comes between ${a} and ${b}?`
    },
    es: {
      before: (x) => `¿Qué número va antes del ${x}?`,
      after: (x) => `¿Qué número va después del ${x}?`,
      between: (a, b) => `¿Qué número hay entre el ${a} y el ${b}?`
    },
    ca: {
      // "de l'u", "de l'onze" before a vowel; "del dos" otherwise
      before: (x, v) => `Quin nombre va abans ${v ? "de l'" : 'del '}${x}?`,
      after: (x, v) => `Quin nombre ve després ${v ? "de l'" : 'del '}${x}?`,
      between: (a, b, va, vb) => `Quin nombre hi ha entre ${va ? "l'" : 'el '}${a} i ${vb ? "l'" : 'el '}${b}?`
    }
  },

  ui: {
    fr: {
      langName: 'Français', write: 'Écris le mot', clue: 'Réponds', newNum: 'Nouveau mot', check: 'Vérifier',
      stage: 'Étape', paw: 'Patte', level: 'Niveau', numbers: 'Français', change: 'Changer', start: 'Commencer',
      starTodo: 'Termine le niveau pour gagner l’étoile', starDone: 'Étoile gagnée !',
      bonus: 'Bonus', bonusChip: 'Bonus · révision', bonusWon: 'Bonus réussi !', bonusWonSub: 'Bravo !', bonusLost: 'Pas cette fois !', bonusLostSub: 'La leçon compte quand même.',
      lessons: ['Découvre', 'Écris', 'Sans aide'], review: 'Révision', finalStage: 'Étape finale', finalSub: '10 mots · 5 os',
      lessonDesc: ['Choisis le bon mot', 'Écris le mot', 'Écris de mémoire'],
      reviewDesc: 'Révise les mots difficiles', finalDesc: '10 mots de toutes les étapes. Atlas a 5 os pour tout le défi.',
      idle: 'Tu peux le faire, Feli !', drag: 'Hmm… où va cette lettre ?', ready: 'Fini ? Appuie sur Vérifier !', lost1: 'Presque ! Corrige les rouges.',
      last: 'Attention, Feli… il reste un os.', intro: 'Un nouveau mot ! Copie-le avec moi.',
      resetTitle: 'Plus d’os — on recommence', resetSub: 'Atlas récupère tous ses os. Même question, nouveau départ.', tryAgain: 'Réessayer',
      finalOutTitle: 'Plus d’os !', finalOutSub: 'Pas grave — réessaie avec 10 nouveaux mots.', finalRetry: 'Réessayer',
      wellDone: 'Bravo, Feli !', perfect: 'Parfait du premier coup !', done: 'Fini !', next: 'Continuer',
      leaveTitle: 'Quitter la leçon ?', leaveSub: (p) => `Ta progression est enregistrée. La prochaine fois, tu reprendras à la patte ${p}.`, keep: 'Continuer à jouer', toMap: 'Aller à la carte',
      lessonDone: 'Leçon terminée !', exercises: 'Exercices', perfectN: 'Parfaits', boss: 'Mot du chef', mastery: 'Maîtrise de l’étape', backMap: 'Retour à la carte',
      stageDone: (s) => `Étape ${s} terminée !`, stageSub: 'Mots maîtrisés', unlocked: 'Débloqué', unlockedFinal: 'Étape finale',
      levelDone: 'Niveau terminé !', youWon: 'Tu as gagné l’étoile', canSpell: 'Mots que tu sais écrire', practise: 'S’entraîner', star: 'Tu es une star, Feli !',
      finalResult: (left) => `10 / 10 mots · ${left} os sur 5`, rotate: 'Tourne la tablette', bonesLeft: (l, m) => `${l} os sur ${m}`
    },
    en: {
      langName: 'English', write: 'Write the number', clue: 'Answer the clue', newNum: 'New number', check: 'Check',
      stage: 'Stage', paw: 'Paw', level: 'Level 1', numbers: 'Numbers 1 to 20', change: 'Change', start: 'Start',
      starTodo: 'Finish 1–20 to win the star', starDone: 'Level star won!',
      bonus: 'Bonus', bonusChip: 'Bonus · write the 3 numbers', bonusWon: 'Bonus complete!', bonusWonSub: 'Three numbers, all by yourself!', bonusLost: 'Not this time!', bonusLostSub: 'The lesson still counts. Next Bonus, you’ll get it!',
      lessons: ['Meet', 'Write', 'Think', 'Read & think'], review: 'Review', finalStage: 'Final stage', finalSub: '10 numbers · 5 bones',
      lessonDesc: ['New numbers: write them from the digit', 'Write the numbers from the digit', 'Clues with digits: “before 8?”', 'Clues with words: “between five and seven?”'],
      reviewDesc: 'Practise the numbers you still find tricky', finalDesc: '10 random numbers from 1 to 20. Atlas has 5 bones for the whole challenge.',
      idle: 'You can do it, Feli!', drag: 'Hmm… where does it go?', ready: 'All done? Press Check!', lost1: 'Almost! Fix the red ones.',
      last: 'Careful, Feli… one bone left.', intro: 'A new number! Copy it with me.',
      resetTitle: 'No bones left — let’s start again', resetSub: 'Atlas gets all his bones back. Same question, fresh start.', tryAgain: 'Try again',
      finalOutTitle: 'Out of bones!', finalOutSub: 'Don’t worry — try again with 10 new numbers.', finalRetry: 'Try again',
      wellDone: 'Well done, Feli!', perfect: 'Perfect — first try!', done: 'Done!', next: 'Continue',
      leaveTitle: 'Leave the lesson?', leaveSub: (p) => `Your progress is saved. Next time you’ll continue at Paw ${p}.`, keep: 'Keep playing', toMap: 'Go to map',
      lessonDone: 'Lesson complete!', exercises: 'Exercises', perfectN: 'Perfect', boss: 'Boss word', mastery: 'Mastery in this stage', backMap: 'Back to the map',
      stageDone: (s) => `Stage ${s} complete!`, stageSub: '5 numbers mastered', unlocked: 'Unlocked', unlockedFinal: 'Final stage',
      levelDone: 'Level 1 complete!', youWon: 'You won the Level 1 star', canSpell: 'Numbers you can spell', practise: 'Practise', star: 'You’re a star, Feli!',
      finalResult: (left) => `10 / 10 words · ${left} of 5 bones left`, rotate: 'Turn the tablet sideways', bonesLeft: (l, m) => `${l} of ${m} bones left`
    },
    es: {
      langName: 'Español', write: 'Escribe el número', clue: 'Resuelve la pista', newNum: 'Número nuevo', check: 'Comprobar',
      stage: 'Etapa', paw: 'Huella', level: 'Nivel 1', numbers: 'Números del 1 al 20', change: 'Cambiar', start: 'Empezar',
      starTodo: 'Termina del 1 al 20 para ganar la estrella', starDone: '¡Estrella del nivel conseguida!',
      bonus: 'Bonus', bonusChip: 'Bonus · escribe los 3 números', bonusWon: '¡Bonus conseguido!', bonusWonSub: '¡Tres números tú solo!', bonusLost: '¡Esta vez no!', bonusLostSub: 'La lección cuenta igual. ¡El próximo Bonus lo consigues!',
      lessons: ['Conoce', 'Escribe', 'Piensa', 'Lee y piensa'], review: 'Repaso', finalStage: 'Etapa final', finalSub: '10 números · 5 huesos',
      lessonDesc: ['Números nuevos: escríbelos a partir de la cifra', 'Escribe los números a partir de la cifra', 'Pistas con cifras: «¿antes del 8?»', 'Pistas con palabras: «¿entre el cinco y el siete?»'],
      reviewDesc: 'Practica los números que aún te cuestan', finalDesc: '10 números al azar del 1 al 20. Atlas tiene 5 huesos para todo el reto.',
      idle: '¡Tú puedes, Feli!', drag: 'Mmm… ¿dónde va?', ready: '¿Listo? ¡Pulsa Comprobar!', lost1: '¡Casi! Arregla las rojas.',
      last: 'Cuidado, Feli… queda un hueso.', intro: '¡Un número nuevo! Cópialo conmigo.',
      resetTitle: 'Sin huesos — empezamos otra vez', resetSub: 'Atlas recupera todos sus huesos. Misma pregunta.', tryAgain: 'Otra vez',
      finalOutTitle: '¡Sin huesos!', finalOutSub: 'Tranquilo: vuelve a intentarlo con 10 números nuevos.', finalRetry: 'Otra vez',
      wellDone: '¡Muy bien, Feli!', perfect: '¡Perfecto a la primera!', done: '¡Hecho!', next: 'Seguir',
      leaveTitle: '¿Salir de la lección?', leaveSub: (p) => `Tu progreso está guardado. La próxima vez seguirás en la huella ${p}.`, keep: 'Seguir jugando', toMap: 'Ir al mapa',
      lessonDone: '¡Lección completada!', exercises: 'Ejercicios', perfectN: 'Perfectas', boss: 'Palabra jefe', mastery: 'Dominio en esta etapa', backMap: 'Volver al mapa',
      stageDone: (s) => `¡Etapa ${s} completada!`, stageSub: '5 números dominados', unlocked: 'Desbloqueada', unlockedFinal: 'Etapa final',
      levelDone: '¡Nivel 1 completado!', youWon: 'Has ganado la estrella del nivel 1', canSpell: 'Números que sabes escribir', practise: 'Practicar', star: '¡Eres una estrella, Feli!',
      finalResult: (left) => `10 / 10 palabras · te quedaban ${left} de 5 huesos`, rotate: 'Gira la tableta', bonesLeft: (l, m) => `Quedan ${l} de ${m} huesos`
    },
    ca: {
      langName: 'Català', write: 'Escriu el nombre', clue: 'Resol la pista', newNum: 'Nombre nou', check: 'Comprova',
      stage: 'Etapa', paw: 'Petjada', level: 'Nivell 1', numbers: 'Nombres de l’1 al 20', change: 'Canvia', start: 'Comença',
      starTodo: 'Acaba de l’1 al 20 per guanyar l’estrella', starDone: 'Estrella del nivell aconseguida!',
      bonus: 'Bonus', bonusChip: 'Bonus · escriu els 3 nombres', bonusWon: 'Bonus aconseguit!', bonusWonSub: 'Tres nombres tu sol!', bonusLost: 'Aquesta vegada no!', bonusLostSub: 'La lliçó compta igual. El proper Bonus el tens!',
      lessons: ['Coneix', 'Escriu', 'Pensa', 'Llegeix i pensa'], review: 'Repàs', finalStage: 'Etapa final', finalSub: '10 nombres · 5 ossos',
      lessonDesc: ['Nombres nous: escriu-los a partir de la xifra', 'Escriu els nombres a partir de la xifra', 'Pistes amb xifres: «abans del 8?»', 'Pistes amb paraules: «entre el cinc i el set?»'],
      reviewDesc: 'Practica els nombres que encara et costen', finalDesc: '10 nombres a l’atzar de l’1 al 20. L’Atlas té 5 ossos per a tot el repte.',
      idle: 'Tu pots, Feli!', drag: 'Mmm… on va?', ready: 'Ja està? Prem Comprova!', lost1: 'Gairebé! Arregla les vermelles.',
      last: 'Compte, Feli… queda un os.', intro: 'Un nombre nou! Copia’l amb mi.',
      resetTitle: 'Sense ossos — tornem a començar', resetSub: 'L’Atlas recupera tots els ossos. Mateixa pregunta.', tryAgain: 'Torna-hi',
      finalOutTitle: 'Sense ossos!', finalOutSub: 'Tranquil: torna-hi amb 10 nombres nous.', finalRetry: 'Torna-hi',
      wellDone: 'Molt bé, Feli!', perfect: 'Perfecte a la primera!', done: 'Fet!', next: 'Continua',
      leaveTitle: 'Sortir de la lliçó?', leaveSub: (p) => `El teu progrés està desat. La propera vegada continuaràs a la petjada ${p}.`, keep: 'Continua jugant', toMap: 'Anar al mapa',
      lessonDone: 'Lliçó completada!', exercises: 'Exercicis', perfectN: 'Perfectes', boss: 'Paraula cap', mastery: 'Domini en aquesta etapa', backMap: 'Tornar al mapa',
      stageDone: (s) => `Etapa ${s} completada!`, stageSub: '5 nombres dominats', unlocked: 'Desbloquejada', unlockedFinal: 'Etapa final',
      levelDone: 'Nivell 1 completat!', youWon: 'Has guanyat l’estrella del nivell 1', canSpell: 'Nombres que saps escriure', practise: 'Practica', star: 'Ets una estrella, Feli!',
      finalResult: (left) => `10 / 10 paraules · et quedaven ${left} de 5 ossos`, rotate: 'Gira la tauleta', bonesLeft: (l, m) => `Queden ${l} de ${m} ossos`
    }
  }
};
