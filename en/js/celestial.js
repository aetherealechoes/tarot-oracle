// ============================================================
// celestial.js — Self-Contained Celestial Engine
// Moon phases, planetary day rulers, zodiac, elements
// No external API — pure algorithmic calculations
// ============================================================

const Celestial = {

  // ── Zodiac Signs ──────────────────────────────────────────
  zodiacSigns: [
    { id: 'aries',       element: 'fire',  modality: 'cardinal', ruler: 'mars',    startMonth: 3,  startDay: 21, endMonth: 4,  endDay: 19 },
    { id: 'taurus',      element: 'earth', modality: 'fixed',    ruler: 'venus',   startMonth: 4,  startDay: 20, endMonth: 5,  endDay: 20 },
    { id: 'gemini',      element: 'air',   modality: 'mutable',  ruler: 'mercury', startMonth: 5,  startDay: 21, endMonth: 6,  endDay: 20 },
    { id: 'cancer',      element: 'water', modality: 'cardinal', ruler: 'moon',    startMonth: 6,  startDay: 21, endMonth: 7,  endDay: 22 },
    { id: 'leo',         element: 'fire',  modality: 'fixed',    ruler: 'sun',     startMonth: 7,  startDay: 23, endMonth: 8,  endDay: 22 },
    { id: 'virgo',       element: 'earth', modality: 'mutable',  ruler: 'mercury', startMonth: 8,  startDay: 23, endMonth: 9,  endDay: 22 },
    { id: 'libra',       element: 'air',   modality: 'cardinal', ruler: 'venus',   startMonth: 9,  startDay: 23, endMonth: 10, endDay: 22 },
    { id: 'scorpio',     element: 'water', modality: 'fixed',    ruler: 'mars',    startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
    { id: 'sagittarius', element: 'fire',  modality: 'mutable',  ruler: 'jupiter', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
    { id: 'capricorn',   element: 'earth', modality: 'cardinal', ruler: 'saturn',  startMonth: 12, startDay: 22, endMonth: 1,  endDay: 19 },
    { id: 'aquarius',    element: 'air',   modality: 'fixed',    ruler: 'saturn',  startMonth: 1,  startDay: 20, endMonth: 2,  endDay: 18 },
    { id: 'pisces',      element: 'water', modality: 'mutable',  ruler: 'jupiter', startMonth: 2,  startDay: 19, endMonth: 3,  endDay: 20 }
  ],

  // ── Planetary Day Rulers (Chaldean Order) ─────────────────
  // Sunday=Sun, Monday=Moon, Tuesday=Mars, Wednesday=Mercury,
  // Thursday=Jupiter, Friday=Venus, Saturday=Saturn
  dayRulers: ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'],

  // ── Planetary Hour Rulers (Chaldean sequence) ─────────────
  chaldeanOrder: ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'],

  // ── Element Correspondences ───────────────────────────────
  elementCorrespondences: {
    fire:  { suits: ['wands'], quality: 'passion', energy: 'active',   season: 'summer' },
    water: { suits: ['cups'],  quality: 'emotion', energy: 'passive',  season: 'autumn' },
    air:   { suits: ['swords'], quality: 'intellect', energy: 'active', season: 'spring' },
    earth: { suits: ['pentacles'], quality: 'material', energy: 'passive', season: 'winter' }
  },

  // ── Planetary Correspondences ─────────────────────────────
  planetaryEnergy: {
    sun:     { quality: 'vitality',      theme: { en: 'identity, success, visibility', fr: 'identité, succès, visibilité', es: 'identidad, éxito, visibilidad' } },
    moon:    { quality: 'intuition',     theme: { en: 'emotions, dreams, the subconscious', fr: 'émotions, rêves, le subconscient', es: 'emociones, sueños, el subconsciente' } },
    mars:    { quality: 'action',        theme: { en: 'courage, conflict, drive', fr: 'courage, conflit, détermination', es: 'coraje, conflicto, impulso' } },
    mercury: { quality: 'communication', theme: { en: 'thought, messages, travel', fr: 'pensée, messages, voyage', es: 'pensamiento, mensajes, viaje' } },
    jupiter: { quality: 'expansion',     theme: { en: 'growth, luck, wisdom', fr: 'croissance, chance, sagesse', es: 'crecimiento, suerte, sabiduría' } },
    venus:   { quality: 'love',          theme: { en: 'beauty, harmony, relationships', fr: 'beauté, harmonie, relations', es: 'belleza, armonía, relaciones' } },
    saturn:  { quality: 'discipline',    theme: { en: 'structure, lessons, boundaries', fr: 'structure, leçons, limites', es: 'estructura, lecciones, límites' } }
  },

  // ── Get Zodiac Sign from Date ─────────────────────────────
  getZodiacSign(month, day) {
    for (const sign of this.zodiacSigns) {
      if (sign.startMonth === sign.endMonth) {
        if (month === sign.startMonth && day >= sign.startDay && day <= sign.endDay) return sign;
      } else if (sign.endMonth < sign.startMonth) {
        // Capricorn wraps Dec→Jan
        if ((month === sign.startMonth && day >= sign.startDay) ||
            (month === sign.endMonth && day <= sign.endDay)) return sign;
      } else {
        if ((month === sign.startMonth && day >= sign.startDay) ||
            (month === sign.endMonth && day <= sign.endDay)) return sign;
      }
    }
    return this.zodiacSigns[0]; // fallback
  },

  // ── Current Zodiac Season ─────────────────────────────────
  getCurrentZodiacSeason(date = new Date()) {
    return this.getZodiacSign(date.getMonth() + 1, date.getDate());
  },

  // ── Moon Phase Calculator ─────────────────────────────────
  // Based on John Conway's algorithm — accurate to ~1 day
  getMoonPhase(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Calculate days since known new moon (Jan 6, 2000)
    const knownNew = new Date(2000, 0, 6, 18, 14); // Known new moon
    const diffMs = date.getTime() - knownNew.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // Synodic month = 29.53058770576 days
    const synodicMonth = 29.53058770576;
    let phase = ((diffDays % synodicMonth) + synodicMonth) % synodicMonth;

    // Phase age in days (0-29.53)
    const age = phase;

    // Determine phase name and illumination
    let phaseName, phaseKey, illumination;
    if (age < 1.84566) {
      phaseName = 'newMoon'; phaseKey = 'new'; illumination = 0;
    } else if (age < 5.53699) {
      phaseName = 'waxingCrescent'; phaseKey = 'waxing-crescent'; illumination = 0.15;
    } else if (age < 9.22831) {
      phaseName = 'firstQuarter'; phaseKey = 'first-quarter'; illumination = 0.5;
    } else if (age < 12.91963) {
      phaseName = 'waxingGibbous'; phaseKey = 'waxing-gibbous'; illumination = 0.85;
    } else if (age < 16.61096) {
      phaseName = 'fullMoon'; phaseKey = 'full'; illumination = 1;
    } else if (age < 20.30228) {
      phaseName = 'waningGibbous'; phaseKey = 'waning-gibbous'; illumination = 0.85;
    } else if (age < 23.99361) {
      phaseName = 'lastQuarter'; phaseKey = 'last-quarter'; illumination = 0.5;
    } else if (age < 27.68493) {
      phaseName = 'waningCrescent'; phaseKey = 'waning-crescent'; illumination = 0.15;
    } else {
      phaseName = 'newMoon'; phaseKey = 'new'; illumination = 0;
    }

    return {
      age: Math.round(age * 100) / 100,
      name: phaseName,      // i18n key
      key: phaseKey,
      illumination,
      isWaxing: age < 14.765,
      isWaning: age >= 14.765,
      emoji: this._moonEmoji(phaseKey)
    };
  },

  _moonEmoji(key) {
    const emojis = {
      'new': '🌑', 'waxing-crescent': '🌒', 'first-quarter': '🌓',
      'waxing-gibbous': '🌔', 'full': '🌕', 'waning-gibbous': '🌖',
      'last-quarter': '🌗', 'waning-crescent': '🌘'
    };
    return emojis[key] || '🌑';
  },

  // ── Moon Phase Tarot Influence ────────────────────────────
  getMoonInfluence(moonPhase) {
    const influences = {
      'new': {
        energy: { en: 'introspective', fr: 'introspective', es: 'introspectiva' },
        theme: { en: 'new beginnings, setting intentions, planting seeds', fr: 'nouveaux départs, fixer des intentions, semer des graines', es: 'nuevos comienzos, establecer intenciones, plantar semillas' },
        favoredSuits: ['cups', 'pentacles']
      },
      'waxing-crescent': {
        energy: { en: 'building', fr: 'constructive', es: 'constructiva' },
        theme: { en: 'taking first steps, emerging plans, growing momentum', fr: 'premiers pas, plans émergents, élan croissant', es: 'dando primeros pasos, planes emergentes, impulso creciente' },
        favoredSuits: ['wands']
      },
      'first-quarter': {
        energy: { en: 'decisive', fr: 'décisive', es: 'decisiva' },
        theme: { en: 'overcoming obstacles, taking action, commitment', fr: 'surmonter les obstacles, passer à l\'action, engagement', es: 'superar obstáculos, tomar acción, compromiso' },
        favoredSuits: ['swords', 'wands']
      },
      'waxing-gibbous': {
        energy: { en: 'refining', fr: 'raffinante', es: 'refinada' },
        theme: { en: 'adjustments, patience, trust the process', fr: 'ajustements, patience, faire confiance au processus', es: 'ajustes, paciencia, confiar en el proceso' },
        favoredSuits: ['pentacles']
      },
      'full': {
        energy: { en: 'illuminated', fr: 'illuminée', es: 'iluminada' },
        theme: { en: 'completion, revelation, heightened intuition', fr: 'achèvement, révélation, intuition accrue', es: 'completación, revelación, intuición elevada' },
        favoredSuits: ['cups']
      },
      'waning-gibbous': {
        energy: { en: 'grateful', fr: 'reconnaissante', es: 'agradecida' },
        theme: { en: 'sharing wisdom, gratitude, giving back', fr: 'partager la sagesse, gratitude, redonner', es: 'compartir sabiduría, gratitud, retribuir' },
        favoredSuits: ['cups', 'pentacles']
      },
      'last-quarter': {
        energy: { en: 'releasing', fr: 'libératrice', es: 'liberadora' },
        theme: { en: 'letting go, forgiveness, clearing space', fr: 'lâcher prise, pardon, faire de la place', es: 'soltar, perdón, abrir espacio' },
        favoredSuits: ['swords']
      },
      'waning-crescent': {
        energy: { en: 'resting', fr: 'reposante', es: 'descansada' },
        theme: { en: 'surrender, rest, spiritual reflection', fr: 'abandon, repos, réflexion spirituelle', es: 'rendirse, descanso, reflexión espiritual' },
        favoredSuits: ['cups']
      }
    };
    return influences[moonPhase.key] || influences['new'];
  },

  // ── Day of Week Planetary Ruler ───────────────────────────
  getDayRuler(date = new Date()) {
    return this.dayRulers[date.getDay()];
  },

  // ── Element of the Day ────────────────────────────────────
  // Combines day ruler + zodiac season
  getElementOfDay(date = new Date()) {
    const ruler = this.getDayRuler(date);
    const season = this.getCurrentZodiacSeason(date);

    // Planet-element mapping
    const planetElements = {
      sun: 'fire', moon: 'water', mars: 'fire',
      mercury: 'air', jupiter: 'fire', venus: 'earth', saturn: 'earth'
    };

    const dayElement = planetElements[ruler];
    const seasonElement = season.element;

    // If they match, that element is strongly emphasized
    // Otherwise return the day's element (planetary ruler takes precedence for daily readings)
    return {
      primary: dayElement,
      secondary: seasonElement,
      harmony: dayElement === seasonElement,
      description: dayElement === seasonElement
        ? `Double ${dayElement} — intensified energy`
        : `${dayElement} meets ${seasonElement}`
    };
  },

  // ── Full Daily Energy Report ──────────────────────────────
  getDailyEnergy(date = new Date()) {
    const moonPhase = this.getMoonPhase(date);
    const dayRuler = this.getDayRuler(date);
    const zodiacSeason = this.getCurrentZodiacSeason(date);
    const elementOfDay = this.getElementOfDay(date);
    const moonInfluence = this.getMoonInfluence(moonPhase);

    return {
      date,
      moonPhase,
      moonInfluence,
      dayRuler,
      dayRulerEnergy: this.planetaryEnergy[dayRuler],
      zodiacSeason,
      elementOfDay,
      // Combined energy signature for interpretation
      energySignature: {
        dominant: elementOfDay.primary,
        moon: moonPhase.name,
        planet: dayRuler,
        zodiac: zodiacSeason.id,
        isHarmonious: elementOfDay.harmony,
        favoredSuits: moonInfluence.favoredSuits
      }
    };
  },

  // ── Elemental Compatibility ───────────────────────────────
  getElementalHarmony(element1, element2) {
    const harmonies = {
      'fire-fire': 'amplified', 'fire-air': 'harmonious', 'fire-water': 'challenging', 'fire-earth': 'grounding',
      'water-water': 'amplified', 'water-earth': 'harmonious', 'water-fire': 'challenging', 'water-air': 'stimulating',
      'air-air': 'amplified', 'air-fire': 'harmonious', 'air-earth': 'challenging', 'air-water': 'stimulating',
      'earth-earth': 'amplified', 'earth-water': 'harmonious', 'earth-fire': 'grounding', 'earth-air': 'challenging'
    };
    return harmonies[`${element1}-${element2}`] || 'neutral';
  }
};
