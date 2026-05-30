// ============================================================
// interpreter.js — The Oracle's Interpretation Engine
// Weaves card meaning + position + user profile + daily energy
// into personalized, multilingual readings
// ============================================================

const Interpreter = {

  // ── Generate Full Reading Interpretation ───────────────────
  interpretReading(reading, userProfile, dailyEnergy) {
    const lang = I18N.currentLang;
    const results = [];

    for (const dealt of reading.cards) {
      results.push(this.interpretCard(dealt, reading.spread, userProfile, dailyEnergy, lang));
    }

    return {
      spread: reading.spread,
      cards: results,
      summary: this.generateSummary(results, reading.spread, userProfile, dailyEnergy, lang),
      dailyContext: this.getDailyContext(dailyEnergy, userProfile, lang)
    };
  },

  // ── Interpret a Single Card in Position ───────────────────
  interpretCard(dealt, spread, userProfile, dailyEnergy, lang) {
    const { card, position, isReversed } = dealt;
    const baseMeaning = isReversed ? card.reversed[lang] : card.upright[lang];
    const keywords = card.keywords[lang];
    const cardName = card.name[lang];
    const positionName = I18N.t(position.key);

    // Build personalization layers
    const layers = [];

    if (userProfile && userProfile.zodiac) {
      const harmony = Celestial.getElementalHarmony(card.element, userProfile.zodiac.element);
      if (harmony === 'amplified' || harmony === 'challenging') {
        layers.push(this._elementalLayer(harmony, card.element, userProfile.zodiac.element, lang));
      }
    }

    if (dailyEnergy && dailyEnergy.elementOfDay.primary === card.element) {
      layers.push(this._dailyAlignmentLayer(dailyEnergy, lang));
    }

    if (dailyEnergy && dailyEnergy.moonInfluence && card.suit && dailyEnergy.moonInfluence.favoredSuits.includes(card.suit)) {
      layers.push(this._moonLayer(dailyEnergy.moonPhase, lang));
    }

    const personalizedNote = layers.length > 0 ? layers.join(' ') : '';

    return {
      cardName,
      cardId: card.id,
      cardImage: card.image,
      positionName,
      positionKey: position.key,
      isReversed,
      keywords,
      baseMeaning,
      personalizedNote,
      element: card.element,
      suit: card.suit || null,
      isMajor: !card.suit,
      fullInterpretation: baseMeaning + (personalizedNote ? '\n\n' + personalizedNote : '')
    };
  },

  // ── Elemental Layer ───────────────────────────────────────
  _elementalLayer(harmony, cardElement, userElement, lang) {
    const ce = I18N.t(cardElement);
    const ue = I18N.t(userElement);
    if (harmony === 'amplified') {
      return { en: `This card's ${cardElement} energy mirrors your own nature, amplifying its message powerfully.`, fr: `L'énergie de ${ce} de cette carte reflète votre propre nature, amplifiant puissamment son message.`, es: `La energía de ${ce} de esta carta refleja tu propia naturaleza, amplificando poderosamente su mensaje.` }[lang];
    }
    return { en: `This card's ${cardElement} energy challenges your ${userElement} nature — growth often comes through this friction.`, fr: `L'énergie de ${ce} de cette carte défie votre nature de ${ue} — la croissance vient souvent de cette friction.`, es: `La energía de ${ce} de esta carta desafía tu naturaleza de ${ue} — el crecimiento a menudo viene de esta fricción.` }[lang];
  },

  _dailyAlignmentLayer(dailyEnergy, lang) {
    const el = I18N.t(dailyEnergy.elementOfDay.primary);
    return { en: `This card resonates with today's ${el} energy, making its message especially potent right now.`, fr: `Cette carte résonne avec l'énergie de ${el} d'aujourd'hui, rendant son message particulièrement puissant.`, es: `Esta carta resuena con la energía de ${el} de hoy, haciendo su mensaje especialmente potente.` }[lang];
  },

  _moonLayer(moonPhase, lang) {
    const mn = I18N.t(moonPhase.name);
    return { en: `The ${mn} ${moonPhase.emoji} amplifies this card's energy tonight.`, fr: `La ${mn} ${moonPhase.emoji} amplifie l'énergie de cette carte ce soir.`, es: `La ${mn} ${moonPhase.emoji} amplifica la energía de esta carta esta noche.` }[lang];
  },

  // ════════════════════════════════════════════════════════════
  // SPREAD-AWARE NARRATIVE SYNTHESIS
  // Each spread type gets its own storytelling logic that
  // connects positions to create a cohesive oracle message
  // ════════════════════════════════════════════════════════════

  generateSummary(cards, spread, userProfile, dailyEnergy, lang) {
    const parts = [];

    // 1. Spread-specific narrative — the heart of the reading
    const narrative = this._spreadNarrative(cards, spread, lang);
    if (narrative) parts.push(narrative);

    // 2. Elemental analysis insight (only when meaningful)
    const elemental = this._elementalInsight(cards, lang);
    if (elemental) parts.push(elemental);

    // 3. Major Arcana weight
    const majorInsight = this._majorArcanaInsight(cards, lang);
    if (majorInsight) parts.push(majorInsight);

    // 4. Personal cosmic context
    if (userProfile && userProfile.zodiac && dailyEnergy) {
      const cosmic = this._cosmicContext(cards, userProfile, dailyEnergy, lang);
      if (cosmic) parts.push(cosmic);
    }

    // 5. Oracle's final counsel
    const counsel = this._oracleCounsel(cards, spread, dailyEnergy, lang);
    if (counsel) parts.push(counsel);

    return parts.join('\n\n');
  },

  // ── Spread-Specific Narrative ─────────────────────────────
  _spreadNarrative(cards, spread, lang) {
    const c = cards; // shorthand
    const get = (i) => c[i]; // get card by index

    switch (spread.id) {

      case 'single': {
        const card = get(0);
        const dir = card.isReversed;
        return {
          en: `The Oracle draws a single card for you: ${card.cardName}${dir ? ', appearing reversed' : ''}. This is not random — of 78 cards in the deck, this one found you. ${dir ? 'In its reversed position, it asks you to turn inward and examine what may be blocked or unacknowledged.' : 'Upright, it affirms a current flowing in your favor.'} Its ${card.element} energy speaks to the ${this._elementTheme(card.element, 'en')} dimension of your life right now. Sit with this card today — its message will unfold as the hours pass.`,
          fr: `L'Oracle tire une seule carte pour vous : ${card.cardName}${dir ? ', apparaissant inversée' : ''}. Ce n'est pas un hasard — parmi 78 cartes du jeu, celle-ci vous a trouvé. ${dir ? 'Dans sa position inversée, elle vous demande de vous tourner vers l\'intérieur et d\'examiner ce qui est peut-être bloqué ou non reconnu.' : 'Droite, elle confirme un courant qui coule en votre faveur.'} Son énergie de ${I18N.t(card.element)} parle de la dimension ${this._elementTheme(card.element, 'fr')} de votre vie en ce moment. Restez avec cette carte aujourd'hui — son message se dévoilera au fil des heures.`,
          es: `El Oráculo extrae una sola carta para ti: ${card.cardName}${dir ? ', apareciendo invertida' : ''}. Esto no es aleatorio — de 78 cartas en el mazo, esta te encontró. ${dir ? 'En su posición invertida, te pide que mires hacia adentro y examines lo que puede estar bloqueado o no reconocido.' : 'Derecha, afirma una corriente que fluye a tu favor.'} Su energía de ${I18N.t(card.element)} habla de la dimensión ${this._elementTheme(card.element, 'es')} de tu vida ahora mismo. Quédate con esta carta hoy — su mensaje se desplegará con las horas.`
        }[lang];
      }

      case 'threeCard': {
        const past = get(0), present = get(1), future = get(2);
        return {
          en: `Your story unfolds across three chapters. In your past, ${past.cardName}${past.isReversed ? ' (reversed)' : ''} reveals the foundation — the energies, choices, and patterns that have shaped where you stand now. This ${past.element} energy has been ${past.isReversed ? 'a struggle you\'ve carried' : 'a force that built your path'}.\n\nIn your present, ${present.cardName}${present.isReversed ? ' (reversed)' : ''} illuminates what is alive right now. ${present.isReversed ? 'There is something here you may be resisting or not fully seeing — this card asks for honest self-examination.' : 'This card affirms the energy currently at work in your life — lean into it.'} The shift from ${past.element} to ${present.element} energy ${past.element === present.element ? 'shows a consistent theme running through your experience' : 'marks a change in the nature of your journey'}.\n\nLooking ahead, ${future.cardName}${future.isReversed ? ' (reversed)' : ''} shows where this current is carrying you. ${future.isReversed ? 'This outcome is not fixed — the reversal suggests you have the power to redirect this energy if you act consciously now.' : 'The future card carries momentum — the seeds you plant in the present will bloom in the direction this card points.'} The arc from ${past.cardName} through ${present.cardName} to ${future.cardName} tells a clear story: ${this._arcNarrative(past, present, future, 'en')}.`,
          fr: `Votre histoire se déroule en trois chapitres. Dans votre passé, ${past.cardName}${past.isReversed ? ' (inversée)' : ''} révèle la fondation — les énergies, choix et schémas qui ont façonné votre position actuelle. Cette énergie de ${I18N.t(past.element)} a été ${past.isReversed ? 'une lutte que vous avez portée' : 'une force qui a construit votre chemin'}.\n\nDans votre présent, ${present.cardName}${present.isReversed ? ' (inversée)' : ''} illumine ce qui est vivant maintenant. ${present.isReversed ? 'Il y a quelque chose ici que vous résistez peut-être ou ne voyez pas pleinement — cette carte demande un examen honnête de soi.' : 'Cette carte confirme l\'énergie actuellement à l\'œuvre dans votre vie — appuyez-vous dessus.'} Le passage de l'énergie de ${I18N.t(past.element)} à celle de ${I18N.t(present.element)} ${past.element === present.element ? 'montre un thème constant dans votre expérience' : 'marque un changement dans la nature de votre voyage'}.\n\nEn regardant vers l'avenir, ${future.cardName}${future.isReversed ? ' (inversée)' : ''} montre où ce courant vous emporte. ${future.isReversed ? 'Ce résultat n\'est pas fixe — l\'inversion suggère que vous avez le pouvoir de rediriger cette énergie si vous agissez consciemment maintenant.' : 'La carte du futur porte un élan — les graines que vous plantez dans le présent fleuriront dans la direction que cette carte indique.'}`,
          es: `Tu historia se despliega en tres capítulos. En tu pasado, ${past.cardName}${past.isReversed ? ' (invertida)' : ''} revela la base — las energías, decisiones y patrones que han dado forma a donde estás ahora. Esta energía de ${I18N.t(past.element)} ha sido ${past.isReversed ? 'una lucha que has cargado' : 'una fuerza que construyó tu camino'}.\n\nEn tu presente, ${present.cardName}${present.isReversed ? ' (invertida)' : ''} ilumina lo que está vivo ahora mismo. ${present.isReversed ? 'Hay algo aquí que quizás estés resistiendo o no viendo completamente — esta carta pide un autoexamen honesto.' : 'Esta carta afirma la energía actualmente en acción en tu vida — apóyate en ella.'} El cambio de energía de ${I18N.t(past.element)} a ${I18N.t(present.element)} ${past.element === present.element ? 'muestra un tema constante en tu experiencia' : 'marca un cambio en la naturaleza de tu viaje'}.\n\nMirando hacia adelante, ${future.cardName}${future.isReversed ? ' (invertida)' : ''} muestra hacia dónde te lleva esta corriente. ${future.isReversed ? 'Este resultado no es fijo — la inversión sugiere que tienes el poder de redirigir esta energía si actúas conscientemente ahora.' : 'La carta del futuro lleva impulso — las semillas que plantas en el presente florecerán en la dirección que señala esta carta.'}`
        }[lang];
      }

      case 'celticCross': {
        const situation = get(0), challenge = get(1), conscious = get(2);
        const subconscious = get(3), recentPast = get(4), nearFuture = get(5);
        const self = get(6), environment = get(7), hopes = get(8), outcome = get(9);
        return {
          en: `The Celtic Cross reveals a complete map of your situation.\n\nAt the heart lies ${situation.cardName}${situation.isReversed ? ' (reversed)' : ''} — this is the core energy defining your current reality. Crossing it is ${challenge.cardName}${challenge.isReversed ? ' (reversed)' : ''}, the primary obstacle or tension you must navigate. These two cards together reveal the central dynamic: ${this._pairDynamic(situation, challenge, 'en')}.\n\nAbove you, ${conscious.cardName} represents what you're consciously aware of — your goals and known desires. Below, ${subconscious.cardName} reveals what operates beneath the surface — ${subconscious.isReversed ? 'hidden fears or suppressed truths that influence you more than you realize' : 'deeper motivations and intuitions guiding you from within'}.\n\nYour recent past shows ${recentPast.cardName} — ${recentPast.isReversed ? 'an energy you\'re still processing and releasing' : 'a force that has shaped your current stance'}. Moving into the near future, ${nearFuture.cardName} indicates ${nearFuture.isReversed ? 'a coming challenge that will test your resolve' : 'an approaching energy that will soon become relevant'}.\n\nThe staff on the right reveals the fuller picture: ${self.cardName} in the position of Self shows how you see yourself in this situation. ${environment.cardName} reflects the energies around you — the people, circumstances, and forces in your environment. ${hopes.cardName} in Hopes and Fears is telling — ${hopes.isReversed ? 'what you fear may actually be what you need to face' : 'what you hope for is within reach, but requires courage'}.\n\nThe final outcome, ${outcome.cardName}${outcome.isReversed ? ' (reversed)' : ''}, is where all these threads converge. ${outcome.isReversed ? 'This is not a fixed destiny — the reversal suggests the outcome depends heavily on the choices you make now, especially regarding ' + challenge.cardName + '.' : 'This outcome carries the momentum of all the preceding cards. The path from ' + situation.cardName + ' through ' + challenge.cardName + ' leads here — ' + this._outcomeNarrative(outcome, situation, challenge, 'en')}.`,

          fr: `La Croix Celtique révèle une carte complète de votre situation.\n\nAu cœur se trouve ${situation.cardName}${situation.isReversed ? ' (inversée)' : ''} — c'est l'énergie centrale qui définit votre réalité actuelle. La croisant, ${challenge.cardName}${challenge.isReversed ? ' (inversée)' : ''} est l'obstacle ou la tension principale que vous devez naviguer. Ces deux cartes ensemble révèlent la dynamique centrale: ${this._pairDynamic(situation, challenge, 'fr')}.\n\nAu-dessus de vous, ${conscious.cardName} représente ce dont vous êtes consciemment aware — vos objectifs et désirs connus. En dessous, ${subconscious.cardName} révèle ce qui opère sous la surface — ${subconscious.isReversed ? 'des peurs cachées ou des vérités refoulées qui vous influencent plus que vous ne le réalisez' : 'des motivations profondes et des intuitions qui vous guident de l\'intérieur'}.\n\nVotre passé récent montre ${recentPast.cardName} — ${recentPast.isReversed ? 'une énergie que vous êtes encore en train de traiter' : 'une force qui a façonné votre position actuelle'}. Dans le futur proche, ${nearFuture.cardName} indique ${nearFuture.isReversed ? 'un défi à venir qui testera votre détermination' : 'une énergie qui deviendra bientôt pertinente'}.\n\nLe bâton à droite révèle l'image complète: ${self.cardName} en position du Soi montre comment vous vous voyez dans cette situation. ${environment.cardName} reflète les énergies autour de vous. ${hopes.cardName} en Espoirs et Craintes est révélateur — ${hopes.isReversed ? 'ce que vous craignez est peut-être exactement ce que vous devez affronter' : 'ce que vous espérez est à portée, mais demande du courage'}.\n\nLe résultat final, ${outcome.cardName}${outcome.isReversed ? ' (inversée)' : ''}, est où tous ces fils convergent. ${outcome.isReversed ? 'Ce n\'est pas un destin fixe — l\'inversion suggère que le résultat dépend fortement de vos choix actuels.' : 'Ce résultat porte l\'élan de toutes les cartes précédentes.'}`,

          es: `La Cruz Celta revela un mapa completo de tu situación.\n\nEn el centro yace ${situation.cardName}${situation.isReversed ? ' (invertida)' : ''} — esta es la energía central que define tu realidad actual. Cruzándola, ${challenge.cardName}${challenge.isReversed ? ' (invertida)' : ''} es el obstáculo o tensión principal que debes navegar. Estas dos cartas juntas revelan la dinámica central: ${this._pairDynamic(situation, challenge, 'es')}.\n\nEncima de ti, ${conscious.cardName} representa lo que conscientemente percibes — tus metas y deseos conocidos. Debajo, ${subconscious.cardName} revela lo que opera bajo la superficie — ${subconscious.isReversed ? 'miedos ocultos o verdades suprimidas que te influyen más de lo que crees' : 'motivaciones profundas e intuiciones que te guían desde dentro'}.\n\nTu pasado reciente muestra ${recentPast.cardName} — ${recentPast.isReversed ? 'una energía que aún estás procesando' : 'una fuerza que ha moldeado tu posición actual'}. En el futuro cercano, ${nearFuture.cardName} indica ${nearFuture.isReversed ? 'un desafío venidero que pondrá a prueba tu determinación' : 'una energía que pronto será relevante'}.\n\nEl bastón a la derecha revela la imagen completa: ${self.cardName} en la posición del Yo muestra cómo te ves en esta situación. ${environment.cardName} refleja las energías a tu alrededor. ${hopes.cardName} en Esperanzas y Temores es revelador — ${hopes.isReversed ? 'lo que temes puede ser exactamente lo que necesitas enfrentar' : 'lo que esperas está al alcance, pero requiere valentía'}.\n\nEl resultado final, ${outcome.cardName}${outcome.isReversed ? ' (invertida)' : ''}, es donde todos estos hilos convergen. ${outcome.isReversed ? 'Este no es un destino fijo — la inversión sugiere que el resultado depende mucho de las decisiones que tomes ahora.' : 'Este resultado lleva el impulso de todas las cartas anteriores.'}`
        }[lang];
      }

      case 'relationship': {
        const you = get(0), partner = get(1), connection = get(2);
        const strength = get(3), challengeR = get(4), futureR = get(5);
        return {
          en: `The Relationship spread reveals the invisible architecture between two souls.\n\n${you.cardName}${you.isReversed ? ' (reversed)' : ''} represents your energy in this connection — ${you.isReversed ? 'there may be parts of yourself you\'re holding back or not fully expressing' : 'this is how you show up, the energy you bring to the table'}. Across from you, ${partner.cardName}${partner.isReversed ? ' (reversed)' : ''} represents your partner's energy — ${partner.isReversed ? 'they may be dealing with their own internal struggles that affect how they connect with you' : 'this is the energy they carry into the relationship'}.\n\nThe connection between you is defined by ${connection.cardName} — ${connection.element === you.element || connection.element === partner.element ? 'there is elemental resonance here, a natural flow' : 'this card introduces a different energy than either of you carry alone, something the relationship itself creates'}. Your greatest strength as a pair is ${strength.cardName} — ${strength.isReversed ? 'a gift you have but may not be fully utilizing' : 'lean into this energy, it\'s where your bond is most powerful'}.\n\nThe challenge you face, ${challengeR.cardName}${challengeR.isReversed ? ' (reversed)' : ''}, ${this._pairDynamic(you, challengeR, 'en')}. This is the area that requires conscious attention and honest communication.\n\nYour future together points to ${futureR.cardName}${futureR.isReversed ? ' (reversed)' : ''} — ${futureR.isReversed ? 'the path ahead asks for transformation and willingness to grow beyond current patterns' : 'the momentum of your connection carries you toward this energy'}.`,

          fr: `Le tirage Relation révèle l'architecture invisible entre deux âmes.\n\n${you.cardName}${you.isReversed ? ' (inversée)' : ''} représente votre énergie dans cette connexion — ${you.isReversed ? 'il y a peut-être des parts de vous que vous retenez' : 'c\'est ainsi que vous vous présentez, l\'énergie que vous apportez'}. En face, ${partner.cardName}${partner.isReversed ? ' (inversée)' : ''} représente l'énergie de votre partenaire — ${partner.isReversed ? 'cette personne traverse peut-être ses propres luttes internes' : 'c\'est l\'énergie qu\'elle porte dans la relation'}.\n\nLa connexion entre vous est définie par ${connection.cardName}. Votre plus grande force en tant que couple est ${strength.cardName} — ${strength.isReversed ? 'un don que vous avez mais que vous n\'utilisez peut-être pas pleinement' : 'appuyez-vous sur cette énergie'}.\n\nLe défi auquel vous faites face, ${challengeR.cardName}, est le domaine qui nécessite une attention consciente et une communication honnête.\n\nVotre avenir ensemble pointe vers ${futureR.cardName}${futureR.isReversed ? ' (inversée)' : ''} — ${futureR.isReversed ? 'le chemin à venir demande une transformation' : 'l\'élan de votre connexion vous porte vers cette énergie'}.`,

          es: `La tirada de Relación revela la arquitectura invisible entre dos almas.\n\n${you.cardName}${you.isReversed ? ' (invertida)' : ''} representa tu energía en esta conexión — ${you.isReversed ? 'puede que haya partes de ti que estás reteniendo' : 'así es como te presentas, la energía que aportas'}. Frente a ti, ${partner.cardName}${partner.isReversed ? ' (invertida)' : ''} representa la energía de tu pareja — ${partner.isReversed ? 'esta persona puede estar lidiando con sus propias luchas internas' : 'esta es la energía que lleva a la relación'}.\n\nLa conexión entre ustedes está definida por ${connection.cardName}. Su mayor fortaleza como pareja es ${strength.cardName} — ${strength.isReversed ? 'un don que tienen pero que quizás no están utilizando plenamente' : 'apóyense en esta energía'}.\n\nEl desafío que enfrentan, ${challengeR.cardName}, es el área que requiere atención consciente y comunicación honesta.\n\nSu futuro juntos apunta hacia ${futureR.cardName}${futureR.isReversed ? ' (invertida)' : ''} — ${futureR.isReversed ? 'el camino adelante pide transformación' : 'el impulso de su conexión los lleva hacia esta energía'}.`
        }[lang];
      }

      case 'career': {
        const path = get(0), obstacle = get(1), hidden = get(2);
        const action = get(3), outcomeC = get(4);
        return {
          en: `The Career Path spread maps your professional landscape.\n\n${path.cardName}${path.isReversed ? ' (reversed)' : ''} shows your current trajectory — ${path.isReversed ? 'you may feel stuck or misaligned with your current direction. This isn\'t a dead end, but a signal to reassess.' : 'this is the road you\'re walking, the professional energy you\'re building'}. Standing in your way is ${obstacle.cardName}${obstacle.isReversed ? ' (reversed)' : ''} — ${obstacle.isReversed ? 'this obstacle may be more internal than external, a self-imposed limitation' : 'a real challenge that demands your attention before progress can be made'}.\n\nWhat you may not see is revealed by ${hidden.cardName} — ${hidden.isReversed ? 'there are hidden factors working against you that need to be brought into the light' : 'there is a hidden advantage or ally you haven\'t yet recognized'}. This is the card worth meditating on most deeply.\n\nThe Oracle counsels action through ${action.cardName}${action.isReversed ? ' (reversed)' : ''}: ${action.isReversed ? 'be cautious about acting too quickly or in the wrong direction — pause, reflect, then move with intention' : 'this is your next move, the energy to embody as you navigate forward'}.\n\nThe likely outcome, ${outcomeC.cardName}${outcomeC.isReversed ? ' (reversed)' : ''}, ${outcomeC.isReversed ? 'is not yet fixed — your choices between now and then will shape whether this energy manifests as challenge or transformation' : 'shows where this path leads if you heed the Oracle\'s guidance — ' + this._elementTheme(outcomeC.element, 'en') + ' energy awaits you'}.`,

          fr: `Le tirage Chemin de Carrière cartographie votre paysage professionnel.\n\n${path.cardName}${path.isReversed ? ' (inversée)' : ''} montre votre trajectoire actuelle — ${path.isReversed ? 'vous vous sentez peut-être bloqué ou désaligné avec votre direction actuelle' : 'c\'est le chemin que vous parcourez'}. Sur votre route se tient ${obstacle.cardName} — ${obstacle.isReversed ? 'cet obstacle est peut-être plus interne qu\'externe' : 'un vrai défi qui demande votre attention'}.\n\nCe que vous ne voyez peut-être pas est révélé par ${hidden.cardName} — ${hidden.isReversed ? 'des facteurs cachés travaillent contre vous' : 'il y a un avantage caché que vous n\'avez pas encore reconnu'}.\n\nL'Oracle conseille l'action à travers ${action.cardName}: ${action.isReversed ? 'soyez prudent avant d\'agir trop vite' : 'c\'est votre prochain mouvement'}.\n\nLe résultat probable, ${outcomeC.cardName}${outcomeC.isReversed ? ' (inversée)' : ''}, ${outcomeC.isReversed ? 'n\'est pas encore fixe — vos choix façonneront le résultat' : 'montre où ce chemin mène si vous suivez les conseils de l\'Oracle'}.`,

          es: `La tirada de Camino Profesional mapea tu paisaje laboral.\n\n${path.cardName}${path.isReversed ? ' (invertida)' : ''} muestra tu trayectoria actual — ${path.isReversed ? 'puede que te sientas atascado o desalineado con tu dirección actual' : 'este es el camino que estás recorriendo'}. En tu camino se encuentra ${obstacle.cardName} — ${obstacle.isReversed ? 'este obstáculo puede ser más interno que externo' : 'un verdadero desafío que demanda tu atención'}.\n\nLo que quizás no ves está revelado por ${hidden.cardName} — ${hidden.isReversed ? 'hay factores ocultos trabajando en tu contra' : 'hay una ventaja oculta que aún no has reconocido'}.\n\nEl Oráculo aconseja acción a través de ${action.cardName}: ${action.isReversed ? 'sé cauteloso antes de actuar demasiado rápido' : 'este es tu próximo movimiento'}.\n\nEl resultado probable, ${outcomeC.cardName}${outcomeC.isReversed ? ' (invertida)' : ''}, ${outcomeC.isReversed ? 'aún no es fijo — tus decisiones darán forma al resultado' : 'muestra hacia dónde lleva este camino si sigues la guía del Oráculo'}.`
        }[lang];
      }

      case 'yesNo': {
        // Yes/No is handled separately in showReadingSummary
        return null;
      }

      default:
        return null;
    }
  },

  // ── Helper: Element Theme ─────────────────────────────────
  _elementTheme(element, lang) {
    const themes = {
      fire:  { en: 'passion and action', fr: 'passion et action', es: 'pasión y acción' },
      water: { en: 'emotion and intuition', fr: 'émotion et intuition', es: 'emoción e intuición' },
      air:   { en: 'thought and communication', fr: 'pensée et communication', es: 'pensamiento y comunicación' },
      earth: { en: 'material reality and stability', fr: 'réalité matérielle et stabilité', es: 'realidad material y estabilidad' }
    };
    return (themes[element] || themes.fire)[lang];
  },

  // ── Helper: Pair Dynamic ──────────────────────────────────
  _pairDynamic(card1, card2, lang) {
    const harmony = Celestial.getElementalHarmony(card1.element, card2.element);
    const dynamics = {
      amplified:   { en: `both cards share ${card1.element} energy, creating an intense, focused charge`, fr: `les deux cartes partagent l'énergie de ${I18N.t(card1.element)}, créant une charge intense et concentrée`, es: `ambas cartas comparten energía de ${I18N.t(card1.element)}, creando una carga intensa y enfocada` },
      harmonious:  { en: `their ${card1.element} and ${card2.element} energies flow together naturally, suggesting the solution lies in working with both`, fr: `leurs énergies de ${I18N.t(card1.element)} et ${I18N.t(card2.element)} coulent naturellement ensemble`, es: `sus energías de ${I18N.t(card1.element)} y ${I18N.t(card2.element)} fluyen juntas naturalmente` },
      challenging: { en: `the tension between ${card1.element} and ${card2.element} is where the real work lies — these forces pull in different directions and require integration`, fr: `la tension entre ${I18N.t(card1.element)} et ${I18N.t(card2.element)} est là où se trouve le vrai travail — ces forces tirent dans des directions différentes`, es: `la tensión entre ${I18N.t(card1.element)} y ${I18N.t(card2.element)} es donde está el verdadero trabajo — estas fuerzas tiran en diferentes direcciones` },
      grounding:   { en: `one grounds the other, bringing stability to the dynamic`, fr: `l'une ancre l'autre, apportant de la stabilité à la dynamique`, es: `una ancla a la otra, trayendo estabilidad a la dinámica` },
      stimulating: { en: `they stimulate each other, creating movement and new possibilities`, fr: `elles se stimulent mutuellement, créant du mouvement et de nouvelles possibilités`, es: `se estimulan mutuamente, creando movimiento y nuevas posibilidades` }
    };
    return (dynamics[harmony] || dynamics.harmonious)[lang];
  },

  // ── Helper: Arc Narrative (3-card) ────────────────────────
  _arcNarrative(past, present, future, lang) {
    const allSame = past.element === present.element && present.element === future.element;
    const shift = past.element !== future.element;
    if (allSame) {
      return { en: `a consistent ${past.element} journey — the theme of ${this._elementTheme(past.element, 'en')} runs through your entire timeline`, fr: `un voyage de ${I18N.t(past.element)} constant — le thème traverse toute votre chronologie`, es: `un viaje de ${I18N.t(past.element)} constante — el tema recorre toda tu línea temporal` }[lang];
    }
    if (shift) {
      return { en: `a transformation from ${this._elementTheme(past.element, 'en')} toward ${this._elementTheme(future.element, 'en')} — your journey is carrying you into new territory`, fr: `une transformation de ${this._elementTheme(past.element, 'fr')} vers ${this._elementTheme(future.element, 'fr')} — votre voyage vous emporte vers un nouveau territoire`, es: `una transformación de ${this._elementTheme(past.element, 'es')} hacia ${this._elementTheme(future.element, 'es')} — tu viaje te lleva a nuevo territorio` }[lang];
    }
    return { en: 'a journey of evolution and growth', fr: 'un voyage d\'évolution et de croissance', es: 'un viaje de evolución y crecimiento' }[lang];
  },

  // ── Helper: Outcome Narrative ─────────────────────────────
  _outcomeNarrative(outcome, situation, challenge, lang) {
    const harmony = Celestial.getElementalHarmony(outcome.element, situation.element);
    if (harmony === 'amplified') {
      return { en: 'the outcome echoes the core situation, suggesting resolution through deepening your understanding of it', fr: 'le résultat fait écho à la situation centrale, suggérant une résolution par l\'approfondissement de votre compréhension', es: 'el resultado hace eco de la situación central, sugiriendo resolución profundizando tu comprensión' }[lang];
    }
    if (outcome.element === challenge.element) {
      return { en: 'interestingly, the outcome shares the energy of your challenge — mastering that challenge IS the destination', fr: 'le résultat partage l\'énergie de votre défi — maîtriser ce défi EST la destination', es: 'el resultado comparte la energía de tu desafío — dominar ese desafío ES el destino' }[lang];
    }
    return { en: 'a new energy emerges, suggesting transformation rather than simple resolution', fr: 'une nouvelle énergie émerge, suggérant une transformation plutôt qu\'une simple résolution', es: 'una nueva energía emerge, sugiriendo transformación en lugar de simple resolución' }[lang];
  },

  // ── Elemental Insight ─────────────────────────────────────
  _elementalInsight(cards, lang) {
    if (cards.length < 3) return null;
    const count = { fire: 0, water: 0, air: 0, earth: 0 };
    cards.forEach(c => { if (c.element) count[c.element]++; });
    const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);
    const [dom, domCount] = sorted[0];
    const absent = sorted.filter(([ c]) => c === 0).map(([e]) => e);

    if (domCount < 2) return null;

    let text = { en: `${I18N.t(dom)} energy dominates this reading with ${domCount} of ${cards.length} cards — ${this._elementTheme(dom, 'en')} is the prevailing current.`, fr: `L'énergie de ${I18N.t(dom)} domine cette lecture avec ${domCount} cartes sur ${cards.length} — ${this._elementTheme(dom, 'fr')} est le courant dominant.`, es: `La energía de ${I18N.t(dom)} domina esta lectura con ${domCount} de ${cards.length} cartas — ${this._elementTheme(dom, 'es')} es la corriente dominante.` }[lang];

    if (absent.length > 0 && cards.length >= 5) {
      const joinWords = { en: ' and ', fr: ' et ', es: ' y ' };
      const absentNames = absent.map(e => I18N.t(e)).join(joinWords[lang] || ' and ');
      text += ' ' + { en: `The absence of ${absentNames} energy is significant — it suggests ${absent.length === 1 ? 'this area' : 'these areas'} may need conscious attention.`, fr: ` L'absence d'énergie de ${absentNames} est significative — cela suggère que ${absent.length === 1 ? 'ce domaine' : 'ces domaines'} nécessite une attention consciente.`, es: ` La ausencia de energía de ${absentNames} es significativa — sugiere que ${absent.length === 1 ? 'esta área' : 'estas áreas'} necesita atención consciente.` }[lang];
    }
    return text;
  },

  // ── Major Arcana Weight ───────────────────────────────────
  _majorArcanaInsight(cards, lang) {
    const majors = cards.filter(c => c.isMajor);
    if (majors.length === 0 || cards.length < 3) return null;
    const pct = Math.round((majors.length / cards.length) * 100);
    if (pct >= 40) {
      const majorNames = majors.map(c => c.cardName).join(', ');
      return { en: `The presence of ${majors.length} Major Arcana cards (${majorNames}) signals that larger cosmic forces are at work in your situation. These are not everyday matters — the universe is actively shaping this chapter of your life.`, fr: `La présence de ${majors.length} cartes du Arcanes Majeurs (${majorNames}) signale que des forces cosmiques plus grandes sont à l'œuvre. Ce ne sont pas des affaires quotidiennes — l'univers façonne activement ce chapitre de votre vie.`, es: `La presencia de ${majors.length} cartas de Arcanos Mayores (${majorNames}) señala que fuerzas cósmicas mayores están en acción. Estos no son asuntos cotidianos — el universo está moldeando activamente este capítulo de tu vida.` }[lang];
    }
    return null;
  },

  // ── Cosmic Context (User + Day) ───────────────────────────
  _cosmicContext(cards, userProfile, dailyEnergy, lang) {
    const sign = I18N.t(userProfile.zodiac.id);
    const userElement = userProfile.zodiac.element;
    const dayRuler = I18N.t(dailyEnergy.dayRuler);
    const moonName = I18N.t(dailyEnergy.moonPhase.name);
    const moonEmoji = dailyEnergy.moonPhase.emoji;
    const personalDay = userProfile.numerology?.personalDay;
    const dayMeaning = personalDay ? Numerology.getMeaning(personalDay) : null;

    // Check how many cards match user's element
    const resonant = cards.filter(c => c.element === userElement).length;

    let text = {
      en: `As a ${sign}, you carry ${I18N.t(userElement)} energy at your core. `,
      fr: `En tant que ${sign}, vous portez l'énergie de ${I18N.t(userElement)} en votre cœur. `,
      es: `Como ${sign}, llevas energía de ${I18N.t(userElement)} en tu esencia. `
    }[lang];

    if (resonant >= 2) {
      text += { en: `${resonant} cards in this reading share your element — the universe is speaking your language today.`, fr: `${resonant} cartes dans cette lecture partagent votre élément — l'univers parle votre langage aujourd'hui.`, es: `${resonant} cartas en esta lectura comparten tu elemento — el universo habla tu idioma hoy.` }[lang];
    } else if (resonant === 0 && cards.length >= 3) {
      text += { en: `None of the cards share your native element — the Oracle is pushing you outside your comfort zone, into unfamiliar but necessary territory.`, fr: `Aucune carte ne partage votre élément natal — l'Oracle vous pousse hors de votre zone de confort, vers un territoire inconnu mais nécessaire.`, es: `Ninguna carta comparte tu elemento natal — el Oráculo te empuja fuera de tu zona de confort, hacia territorio desconocido pero necesario.` }[lang];
    }

    if (dayMeaning) {
      text += ' ' + {
        en: `Today's personal number ${personalDay} (${dayMeaning.theme.en}) adds another layer: ${dayMeaning.advice.en}`,
        fr: `Le nombre personnel du jour ${personalDay} (${dayMeaning.theme.fr}) ajoute une couche: ${dayMeaning.advice.fr}`,
        es: `El número personal del día ${personalDay} (${dayMeaning.theme.es}) agrega otra capa: ${dayMeaning.advice.es}`
      }[lang];
    }

    // Name numerology integration
    const numData = userProfile.numerology;
    if (numData && numData.expression) {
      const exprMeaning = numData.expressionMeaning;
      const soulMeaning = numData.soulUrgeMeaning;
      const persMeaning = numData.personalityMeaning;
      const name = userProfile.fullName || '';

      text += '\n\n' + {
        en: `Your name "${name}" reveals deeper layers: with Expression number ${numData.expression}, you are ${exprMeaning?.en || 'a unique soul'}. Your Soul Urge (${numData.soulUrge}) whispers that your deepest desire is ${soulMeaning?.en || 'to find your path'}, while your Personality number (${numData.personality}) shows the world someone ${persMeaning?.en || 'remarkable'}.`,
        fr: `Votre nom "${name}" révèle des couches plus profondes: avec le nombre d'Expression ${numData.expression}, vous êtes ${exprMeaning?.fr || 'une âme unique'}. Votre Désir de l'Âme (${numData.soulUrge}) murmure que votre désir le plus profond est de ${soulMeaning?.fr || 'trouver votre chemin'}, tandis que votre nombre de Personnalité (${numData.personality}) montre au monde quelqu'un de ${persMeaning?.fr || 'remarquable'}.`,
        es: `Tu nombre "${name}" revela capas más profundas: con el número de Expresión ${numData.expression}, eres ${exprMeaning?.es || 'un alma única'}. Tu Deseo del Alma (${numData.soulUrge}) susurra que tu deseo más profundo es ${soulMeaning?.es || 'encontrar tu camino'}, mientras tu número de Personalidad (${numData.personality}) muestra al mundo alguien ${persMeaning?.es || 'notable'}.`
      }[lang];

      // Check if Expression number resonates with any card's numerology value
      const exprCards = cards.filter(c => c.numerologyValue === numData.expression || c.numerologyValue === Numerology.reduce(numData.expression));
      if (exprCards.length > 0) {
        const cardName = exprCards[0].cardName || exprCards[0].card?.name?.[lang] || 'a card';
        text += ' ' + {
          en: `Notably, ${cardName} vibrates at the same frequency as your Expression number — this card carries a deeply personal message for you.`,
          fr: `Notamment, ${cardName} vibre à la même fréquence que votre nombre d'Expression — cette carte porte un message profondément personnel pour vous.`,
          es: `Notablemente, ${cardName} vibra en la misma frecuencia que tu número de Expresión — esta carta lleva un mensaje profundamente personal para ti.`
        }[lang];
      }
    }

    return text;
  },

  // ── Oracle's Final Counsel ────────────────────────────────
  _oracleCounsel(cards, spread, dailyEnergy, lang) {
    const reversedRatio = cards.filter(c => c.isReversed).length / cards.length;
    const moonPhase = dailyEnergy?.moonPhase;

    let counsel;
    if (reversedRatio > 0.5) {
      counsel = { en: 'The Oracle notes the weight of reversed cards in your reading. This is a time for inner work — reflection, release, and realignment before outward action. The answers you seek are within you.', fr: 'L\'Oracle note le poids des cartes inversées dans votre lecture. C\'est un temps pour le travail intérieur — réflexion, libération et réalignement avant l\'action extérieure. Les réponses que vous cherchez sont en vous.', es: 'El Oráculo nota el peso de las cartas invertidas en tu lectura. Es un momento para el trabajo interior — reflexión, liberación y realineamiento antes de la acción exterior. Las respuestas que buscas están dentro de ti.'  }[lang];
    } else if (moonPhase && moonPhase.isWaxing) {
      counsel = { en: `With the ${I18N.t(moonPhase.name)} ${moonPhase.emoji} overhead, momentum is building. This reading arrives at a time of growth — act on its guidance while the cosmic tide is rising.`, fr: `Avec la ${I18N.t(moonPhase.name)} ${moonPhase.emoji} au-dessus, l'élan se construit. Cette lecture arrive en temps de croissance — agissez sur ses conseils pendant que la marée cosmique monte.`, es: `Con la ${I18N.t(moonPhase.name)} ${moonPhase.emoji} arriba, el impulso está creciendo. Esta lectura llega en tiempo de crecimiento — actúa según su guía mientras la marea cósmica sube.` }[lang];
    } else if (moonPhase && moonPhase.isWaning) {
      counsel = { en: `Under the ${I18N.t(moonPhase.name)} ${moonPhase.emoji}, this is a time to release and let go. This reading illuminates what to carry forward and what to leave behind.`, fr: `Sous la ${I18N.t(moonPhase.name)} ${moonPhase.emoji}, c'est un temps pour libérer et lâcher prise. Cette lecture illumine ce qu'il faut garder et ce qu'il faut laisser derrière.`, es: `Bajo la ${I18N.t(moonPhase.name)} ${moonPhase.emoji}, es un momento para soltar y dejar ir. Esta lectura ilumina qué llevar contigo y qué dejar atrás.` }[lang];
    }

    return counsel || null;
  },

  // ── Daily Energy Context ──────────────────────────────────
  getDailyContext(dailyEnergy, userProfile, lang) {
    if (!dailyEnergy) return '';
    const moon = dailyEnergy.moonPhase;
    const ruler = dailyEnergy.dayRuler;
    const rulerEnergy = dailyEnergy.dayRulerEnergy;
    const moonInf = dailyEnergy.moonInfluence;

    // Access multilingual theme/energy with English fallback
    const rTheme = (typeof rulerEnergy.theme === 'object') ? (rulerEnergy.theme[lang] || rulerEnergy.theme.en) : rulerEnergy.theme;
    const mEnergy = (typeof moonInf.energy === 'object') ? (moonInf.energy[lang] || moonInf.energy.en) : moonInf.energy;
    const mTheme = (typeof moonInf.theme === 'object') ? (moonInf.theme[lang] || moonInf.theme.en) : moonInf.theme;

    return {
      en: `Today is governed by ${I18N.t(ruler)}, bringing energy of ${rTheme}. The ${I18N.t(moon.name)} ${moon.emoji} lends a ${mEnergy} quality — a time for ${mTheme}.`,
      fr: `Aujourd'hui est gouverné par ${I18N.t(ruler)}, apportant l'énergie de ${rTheme}. La ${I18N.t(moon.name)} ${moon.emoji} confère une qualité ${mEnergy} — un temps pour ${mTheme}.`,
      es: `Hoy está gobernado por ${I18N.t(ruler)}, trayendo energía de ${rTheme}. La ${I18N.t(moon.name)} ${moon.emoji} otorga una cualidad ${mEnergy} — un momento para ${mTheme}.`
    }[lang];
  },

  // ── Yes/No Interpretation ─────────────────────────────────
  interpretYesNo(card, isReversed, lang) {
    const answer = Spreads.definitions.yesNo.isYesCard(card, isReversed);
    const templates = {
      yes: { en: 'The cards lean toward YES. The energy is favorable — trust the momentum and move forward with confidence.', fr: 'Les cartes penchent vers OUI. L\'énergie est favorable — faites confiance à l\'élan et avancez avec confiance.', es: 'Las cartas se inclinan hacia SÍ. La energía es favorable — confía en el impulso y avanza con confianza.' },
      no: { en: 'The cards lean toward NO. This is not the time — patience and reflection are called for before proceeding.', fr: 'Les cartes penchent vers NON. Ce n\'est pas le moment — patience et réflexion sont de mise.', es: 'Las cartas se inclinan hacia NO. No es el momento — se requiere paciencia y reflexión.' },
      maybe: { en: 'The answer is not yet clear. The situation is still unfolding — more information or a shift in perspective may be needed.', fr: 'La réponse n\'est pas encore claire. La situation continue de se déployer.', es: 'La respuesta aún no está clara. La situación sigue desarrollándose.' }
    };
    return { answer, message: (templates[answer] || templates.maybe)[lang] };
  }
};
