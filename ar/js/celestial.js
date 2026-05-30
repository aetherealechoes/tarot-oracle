// ============================================================
// celestial.js — منازل القمر (Manazil al-Qamar)
// 28 Lunar Mansions of Arabic Astrology
// Moon phases, planetary day rulers, lunar mansions
// No external API — pure algorithmic calculations
// ============================================================

const Celestial = {

  // ── The 28 Lunar Mansions (منازل القمر) ───────────────────
  // Each mansion spans 12°51'26" (360/28) of ecliptic longitude
  // Traditional attributes from classical Arabic astrology
  lunarMansions: [
    { index: 0,  id: 'sharatain',    nameAr: 'الشَّرَطين',      nameEn: 'Al-Sharatain',      meaning: 'العلامتان',          element: 'fire',  nature: 'sa\'d',  ruler: 'mars',    favoredSuits: ['wands'],              emoji: '♈' },
    { index: 1,  id: 'butain',       nameAr: 'البُطَين',        nameEn: 'Al-Butain',         meaning: 'البطن الصغير',       element: 'fire',  nature: 'sa\'d',  ruler: 'venus',   favoredSuits: ['pentacles'],          emoji: '♈' },
    { index: 2,  id: 'thurayya',     nameAr: 'الثُّرَيّا',       nameEn: 'Al-Thurayya',       meaning: 'الثريا (النجوم)',     element: 'fire',  nature: 'sa\'d',  ruler: 'mercury', favoredSuits: ['wands', 'swords'],    emoji: '♈' },
    { index: 3,  id: 'dabaran',      nameAr: 'الدَّبَران',       nameEn: 'Al-Dabaran',        meaning: 'التابع',             element: 'earth', nature: 'nahs',   ruler: 'moon',    favoredSuits: ['cups'],               emoji: '♉' },
    { index: 4,  id: 'haqah',        nameAr: 'الهَقعة',         nameEn: 'Al-Haq\'ah',        meaning: 'العلامة البيضاء',     element: 'earth', nature: 'nahs',   ruler: 'mars',    favoredSuits: ['swords'],             emoji: '♉' },
    { index: 5,  id: 'hanah',        nameAr: 'الهَنعة',         nameEn: 'Al-Han\'ah',        meaning: 'الوَسم',             element: 'air',   nature: 'sa\'d',  ruler: 'sun',     favoredSuits: ['wands'],              emoji: '♊' },
    { index: 6,  id: 'dhira',        nameAr: 'الذِّراع',        nameEn: 'Al-Dhira\'',        meaning: 'الذراع',             element: 'air',   nature: 'sa\'d',  ruler: 'venus',   favoredSuits: ['cups', 'pentacles'],  emoji: '♊' },
    { index: 7,  id: 'nathrah',      nameAr: 'النَّثرة',        nameEn: 'Al-Nathrah',        meaning: 'الفجوة',             element: 'water', nature: 'sa\'d',  ruler: 'mercury', favoredSuits: ['cups'],               emoji: '♋' },
    { index: 8,  id: 'tarf',         nameAr: 'الطَّرف',         nameEn: 'Al-Tarf',           meaning: 'النظرة',             element: 'water', nature: 'nahs',   ruler: 'moon',    favoredSuits: ['cups', 'swords'],     emoji: '♋' },
    { index: 9,  id: 'jabhah',       nameAr: 'الجَبهة',         nameEn: 'Al-Jabhah',         meaning: 'الجبهة',             element: 'fire',  nature: 'sa\'d',  ruler: 'sun',     favoredSuits: ['wands'],              emoji: '♌' },
    { index: 10, id: 'zubrah',       nameAr: 'الزُّبرة',        nameEn: 'Al-Zubrah',         meaning: 'العُرف',             element: 'fire',  nature: 'nahs',   ruler: 'jupiter', favoredSuits: ['wands', 'pentacles'], emoji: '♌' },
    { index: 11, id: 'sarfah',       nameAr: 'الصَّرفة',        nameEn: 'Al-Sarfah',         meaning: 'المُغيِّر',           element: 'earth', nature: 'sa\'d',  ruler: 'sun',     favoredSuits: ['pentacles'],          emoji: '♍' },
    { index: 12, id: 'awwa',         nameAr: 'العَوّاء',        nameEn: 'Al-Awwa\'',         meaning: 'النابح',             element: 'earth', nature: 'nahs',   ruler: 'venus',   favoredSuits: ['pentacles', 'cups'],  emoji: '♍' },
    { index: 13, id: 'simak',        nameAr: 'السِّماك',        nameEn: 'Al-Simak',          meaning: 'الأعزل',             element: 'air',   nature: 'sa\'d',  ruler: 'mars',    favoredSuits: ['swords'],             emoji: '♎' },
    { index: 14, id: 'ghafr',        nameAr: 'الغَفر',          nameEn: 'Al-Ghafr',          meaning: 'الغطاء',             element: 'air',   nature: 'sa\'d',  ruler: 'jupiter', favoredSuits: ['pentacles', 'cups'],  emoji: '♎' },
    { index: 15, id: 'zubana',       nameAr: 'الزُّبانى',       nameEn: 'Al-Zubana',         meaning: 'المخالب',            element: 'water', nature: 'nahs',   ruler: 'saturn',  favoredSuits: ['swords'],             emoji: '♏' },
    { index: 16, id: 'iklil',        nameAr: 'الإكليل',         nameEn: 'Al-Iklil',          meaning: 'التاج',              element: 'water', nature: 'sa\'d',  ruler: 'mars',    favoredSuits: ['wands', 'cups'],      emoji: '♏' },
    { index: 17, id: 'qalb',         nameAr: 'القَلب',          nameEn: 'Al-Qalb',           meaning: 'القلب',              element: 'water', nature: 'nahs',   ruler: 'mars',    favoredSuits: ['cups', 'swords'],     emoji: '♏' },
    { index: 18, id: 'shaulah',      nameAr: 'الشَّولة',        nameEn: 'Al-Shaulah',        meaning: 'الذيل المرفوع',      element: 'fire',  nature: 'nahs',   ruler: 'jupiter', favoredSuits: ['wands'],              emoji: '♐' },
    { index: 19, id: 'naaim',        nameAr: 'النَّعائم',       nameEn: 'Al-Na\'aim',        meaning: 'النعام',             element: 'fire',  nature: 'sa\'d',  ruler: 'sun',     favoredSuits: ['wands', 'pentacles'], emoji: '♐' },
    { index: 20, id: 'baldah',       nameAr: 'البَلدة',         nameEn: 'Al-Baldah',         meaning: 'المدينة',            element: 'earth', nature: 'nahs',   ruler: 'saturn',  favoredSuits: ['pentacles'],          emoji: '♑' },
    { index: 21, id: 'saad_dhabih',  nameAr: 'سعد الذابح',      nameEn: 'Sa\'d al-Dhabih',   meaning: 'نجم الذابح السعيد',   element: 'earth', nature: 'sa\'d',  ruler: 'saturn',  favoredSuits: ['pentacles', 'swords'],emoji: '♑' },
    { index: 22, id: 'saad_bula',    nameAr: 'سعد بُلَع',       nameEn: 'Sa\'d Bula\'',      meaning: 'نجم البالع السعيد',   element: 'air',   nature: 'sa\'d',  ruler: 'saturn',  favoredSuits: ['cups'],               emoji: '♒' },
    { index: 23, id: 'saad_suud',    nameAr: 'سعد السُّعود',    nameEn: 'Sa\'d al-Su\'ud',   meaning: 'أسعد السعود',         element: 'air',   nature: 'sa\'d',  ruler: 'jupiter', favoredSuits: ['cups', 'pentacles'],  emoji: '♒' },
    { index: 24, id: 'saad_akhbiyah',nameAr: 'سعد الأخبية',     nameEn: 'Sa\'d al-Akhbiyah', meaning: 'نجم الخيام السعيد',   element: 'air',   nature: 'sa\'d',  ruler: 'venus',   favoredSuits: ['cups', 'pentacles'],  emoji: '♒' },
    { index: 25, id: 'fargh_muqaddam', nameAr: 'الفَرغ المُقدَّم', nameEn: 'Al-Fargh al-Muqaddam', meaning: 'الدلو الأعلى', element: 'water', nature: 'sa\'d',  ruler: 'mars',    favoredSuits: ['wands', 'cups'],      emoji: '♓' },
    { index: 26, id: 'fargh_muakhkhar', nameAr: 'الفَرغ المُؤخَّر', nameEn: 'Al-Fargh al-Mu\'akhkhar', meaning: 'الدلو الأسفل', element: 'water', nature: 'sa\'d', ruler: 'mercury', favoredSuits: ['cups'],              emoji: '♓' },
    { index: 27, id: 'batn_hut',     nameAr: 'بطن الحوت',       nameEn: 'Batn al-Hut',       meaning: 'بطن السمكة',          element: 'water', nature: 'sa\'d',  ruler: 'jupiter', favoredSuits: ['cups', 'pentacles'],  emoji: '♓' }
  ],

  // ── Mansion Descriptions (Arabic primary, English fallback) ─
  mansionDescriptions: {
    sharatain:      { ar: 'طاقة المبادرة والشجاعة. وقت مناسب للبدايات الجريئة والقيادة.', en: 'Energy of initiative and courage. A time for bold beginnings and leadership.' },
    butain:         { ar: 'طاقة الثروة والوفرة. وقت مناسب لجمع الموارد والتأسيس.', en: 'Energy of wealth and abundance. A time for gathering resources and building foundations.' },
    thurayya:       { ar: 'طاقة النور والعلم. وقت مناسب للتعلم والاكتشاف والسفر.', en: 'Energy of light and knowledge. A time for learning, discovery, and travel.' },
    dabaran:        { ar: 'طاقة الصبر والمتابعة. وقت للتأني والمثابرة رغم العقبات.', en: 'Energy of patience and persistence. A time for steadfastness despite obstacles.' },
    haqah:          { ar: 'طاقة التحول والتطهير. وقت لإزالة ما لا يخدمك والتجديد.', en: 'Energy of transformation and purification. A time to release what no longer serves you.' },
    hanah:          { ar: 'طاقة التواصل والحكمة. وقت مناسب للحوار والتعبير عن الذات.', en: 'Energy of communication and wisdom. A time for dialogue and self-expression.' },
    dhira:          { ar: 'طاقة الحب والانسجام. وقت مناسب للعلاقات والشراكات والمصالحة.', en: 'Energy of love and harmony. A time for relationships, partnerships, and reconciliation.' },
    nathrah:        { ar: 'طاقة الحدس والرؤية الداخلية. وقت للتأمل والاستماع للقلب.', en: 'Energy of intuition and inner vision. A time for meditation and listening to the heart.' },
    tarf:           { ar: 'طاقة الحذر واليقظة. وقت للتروي قبل اتخاذ القرارات المهمة.', en: 'Energy of caution and vigilance. A time to pause before making important decisions.' },
    jabhah:         { ar: 'طاقة الكرامة والنصر. وقت مناسب للمواجهة والدفاع عن الحق.', en: 'Energy of dignity and victory. A time for standing up and defending what is right.' },
    zubrah:         { ar: 'طاقة القوة الخفية والحماية. وقت للتحصين الروحي والقوة الداخلية.', en: 'Energy of hidden power and protection. A time for spiritual fortification.' },
    sarfah:         { ar: 'طاقة التغيير والتحول. وقت مناسب لتبديل المسار والتجديد.', en: 'Energy of change and transformation. A time to shift direction and renew.' },
    awwa:           { ar: 'طاقة التحليل والتمييز. وقت للتفكير العميق وفرز الأمور.', en: 'Energy of analysis and discernment. A time for deep thinking and sorting matters.' },
    simak:          { ar: 'طاقة العدالة والتوازن. وقت مناسب لإحقاق الحق والإنصاف.', en: 'Energy of justice and balance. A time for fairness and equity.' },
    ghafr:          { ar: 'طاقة السلام والستر. وقت للهدوء والتعافي والغفران.', en: 'Energy of peace and concealment. A time for calm, healing, and forgiveness.' },
    zubana:         { ar: 'طاقة المواجهة والحسم. وقت للتعامل مع التحديات بشكل مباشر.', en: 'Energy of confrontation and resolution. A time to deal with challenges directly.' },
    iklil:          { ar: 'طاقة التتويج والشرف. وقت مناسب للاحتفال بالإنجازات.', en: 'Energy of crowning and honor. A time to celebrate achievements.' },
    qalb:           { ar: 'طاقة العاطفة العميقة والكشف. وقت لمواجهة الحقائق الخفية.', en: 'Energy of deep emotion and revelation. A time to face hidden truths.' },
    shaulah:        { ar: 'طاقة الطموح والمغامرة. وقت للخروج من منطقة الراحة.', en: 'Energy of ambition and adventure. A time to step out of the comfort zone.' },
    naaim:          { ar: 'طاقة التفاؤل والسعادة. وقت مناسب للسفر والاستكشاف والفرح.', en: 'Energy of optimism and joy. A time for travel, exploration, and happiness.' },
    baldah:         { ar: 'طاقة العزلة والتأمل. وقت للخلوة والتفكر في مسار الحياة.', en: 'Energy of solitude and contemplation. A time for retreat and reflecting on life\'s path.' },
    saad_dhabih:    { ar: 'طاقة التضحية من أجل النجاح. وقت للعمل الجاد والإصرار.', en: 'Energy of sacrifice for success. A time for hard work and determination.' },
    saad_bula:      { ar: 'طاقة الاستيعاب والتقبل. وقت لقبول التغيير والتكيف.', en: 'Energy of absorption and acceptance. A time to embrace change and adapt.' },
    saad_suud:      { ar: 'طاقة الحظ الأعظم والبركة. أسعد المنازل — وقت مبارك لكل شيء.', en: 'Energy of supreme fortune and blessing. The luckiest mansion — a blessed time for everything.' },
    saad_akhbiyah:  { ar: 'طاقة الأمان والحماية. وقت للاحتماء والتخطيط بحكمة.', en: 'Energy of safety and shelter. A time for seeking refuge and planning wisely.' },
    fargh_muqaddam: { ar: 'طاقة الانطلاق والتحرر. وقت لكسر القيود والمضي قدماً.', en: 'Energy of liberation and forward movement. A time to break free and move ahead.' },
    fargh_muakhkhar:{ ar: 'طاقة الاكتمال والإنجاز. وقت لإتمام المشاريع وجني الثمار.', en: 'Energy of completion and accomplishment. A time to finish projects and reap rewards.' },
    batn_hut:       { ar: 'طاقة الرحمة والتسليم. وقت للتواضع والاستسلام للقدر.', en: 'Energy of mercy and surrender. A time for humility and accepting destiny.' }
  },

  // ── Planetary Day Rulers (Chaldean Order) ─────────────────
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

  // ── Planetary Correspondences (Arabic primary) ────────────
  planetaryEnergy: {
    sun:     { quality: 'vitality',      theme: { ar: 'الهوية، النجاح، الظهور', en: 'identity, success, visibility' } },
    moon:    { quality: 'intuition',     theme: { ar: 'العواطف، الأحلام، اللاوعي', en: 'emotions, dreams, the subconscious' } },
    mars:    { quality: 'action',        theme: { ar: 'الشجاعة، الصراع، العزيمة', en: 'courage, conflict, drive' } },
    mercury: { quality: 'communication', theme: { ar: 'الفكر، الرسائل، السفر', en: 'thought, messages, travel' } },
    jupiter: { quality: 'expansion',     theme: { ar: 'النمو، الحظ، الحكمة', en: 'growth, luck, wisdom' } },
    venus:   { quality: 'love',          theme: { ar: 'الجمال، الانسجام، العلاقات', en: 'beauty, harmony, relationships' } },
    saturn:  { quality: 'discipline',    theme: { ar: 'البنية، الدروس، الحدود', en: 'structure, lessons, boundaries' } }
  },

  // ── Calculate Moon's Ecliptic Longitude ───────────────────
  // Simplified Meeus algorithm — accurate to ~1-2° (sufficient
  // for mansion determination since each spans ~12.86°)
  _getMoonLongitude(date) {
    // Julian Date calculation
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate() + 0.5; // noon
    let jy = y, jm = m;
    if (m <= 2) { jy--; jm += 12; }
    const A = Math.floor(jy / 100);
    const B = 2 - A + Math.floor(A / 4);
    const JD = Math.floor(365.25 * (jy + 4716)) + Math.floor(30.6001 * (jm + 1)) + d + B - 1524.5;

    // Days since J2000.0
    const T = (JD - 2451545.0) / 36525.0;

    // Moon's mean longitude (L')
    const Lp = 218.3164477 + 481267.88123421 * T
      - 0.0015786 * T * T + T * T * T / 538841.0;

    // Moon's mean anomaly (M')
    const Mp = 134.9633964 + 477198.8675055 * T
      + 0.0087414 * T * T + T * T * T / 69699.0;

    // Moon's mean elongation (D)
    const D = 297.8501921 + 445267.1114034 * T
      - 0.0018819 * T * T + T * T * T / 545868.0;

    // Sun's mean anomaly (M)
    const Ms = 357.5291092 + 35999.0502909 * T
      - 0.0001536 * T * T;

    // Moon's argument of latitude (F)
    const F = 93.2720950 + 483202.0175233 * T
      - 0.0036539 * T * T;

    // Convert to radians
    const rad = Math.PI / 180;
    const MpR = Mp * rad, DR = D * rad, MsR = Ms * rad, FR = F * rad;

    // Principal perturbation terms (longitude, in degrees)
    let longitude = Lp
      + 6.289 * Math.sin(MpR)
      + 1.274 * Math.sin(2 * DR - MpR)
      + 0.658 * Math.sin(2 * DR)
      + 0.214 * Math.sin(2 * MpR)
      - 0.186 * Math.sin(MsR)
      - 0.114 * Math.sin(2 * FR)
      + 0.059 * Math.sin(2 * DR - 2 * MpR)
      + 0.057 * Math.sin(2 * DR - MsR - MpR)
      + 0.053 * Math.sin(2 * DR + MpR)
      + 0.046 * Math.sin(2 * DR - MsR)
      - 0.041 * Math.sin(MsR - MpR)
      - 0.035 * Math.sin(DR)
      - 0.030 * Math.sin(MsR + MpR);

    // Normalize to 0-360
    longitude = ((longitude % 360) + 360) % 360;
    return longitude;
  },

  // ── Get Lunar Mansion from Ecliptic Longitude ─────────────
  _mansionFromLongitude(longitude) {
    const mansionWidth = 360 / 28; // ~12.8571°
    const index = Math.floor(longitude / mansionWidth);
    return this.lunarMansions[index % 28];
  },

  // ── Get Lunar Mansion for a Date ──────────────────────────
  // Returns which mansion the moon occupies on this date
  getLunarMansion(date = new Date()) {
    const longitude = this._getMoonLongitude(date);
    return this._mansionFromLongitude(longitude);
  },

  // ── Get Birth Mansion from DOB ────────────────────────────
  // Backward compatible: accepts (month, day) or (year, month, day)
  // When year is provided, calculates actual moon position
  // When only month/day, uses a simplified seasonal mapping
  getBirthMansion(yearOrMonth, monthOrDay, dayOrNull) {
    let mansion;
    if (dayOrNull !== undefined && dayOrNull !== null) {
      // Full date provided — calculate actual moon longitude
      const date = new Date(yearOrMonth, monthOrDay - 1, dayOrNull);
      const longitude = this._getMoonLongitude(date);
      mansion = this._mansionFromLongitude(longitude);
    } else {
      // Only month/day — need year for accurate calculation
      // Use current year as approximation (caller should provide full date)
      const now = new Date();
      const date = new Date(now.getFullYear(), yearOrMonth - 1, monthOrDay);
      const longitude = this._getMoonLongitude(date);
      mansion = this._mansionFromLongitude(longitude);
    }
    return mansion;
  },

  // ── Backward Compatibility: getZodiacSign ─────────────────
  // Returns a mansion object that has the same interface shape
  // as the old zodiac sign object (id, element, ruler, emoji)
  getZodiacSign(month, day, year) {
    return this.getBirthMansion(year || new Date().getFullYear(), month, day);
  },

  // ── Current Mansion Season ────────────────────────────────
  getCurrentMansionSeason(date = new Date()) {
    return this.getLunarMansion(date);
  },

  // ── Backward Compatibility ────────────────────────────────
  getCurrentZodiacSeason(date = new Date()) {
    return this.getCurrentMansionSeason(date);
  },

  // ── Moon Phase Calculator ─────────────────────────────────
  // Based on John Conway's algorithm — accurate to ~1 day
  getMoonPhase(date = new Date()) {
    // Calculate days since known new moon (Jan 6, 2000)
    const knownNew = new Date(2000, 0, 6, 18, 14);
    const diffMs = date.getTime() - knownNew.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // Synodic month = 29.53058770576 days
    const synodicMonth = 29.53058770576;
    let phase = ((diffDays % synodicMonth) + synodicMonth) % synodicMonth;
    const age = phase;

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
      name: phaseName,
      key: phaseKey,
      illumination,
      isWaxing: age < 14.765,
      isWaning: age >= 14.765,
      emoji: this._moonEmoji(phaseKey)
    };
  },

  _moonEmoji(key) {
    const emojis = {
      'new': '\u{1F311}', 'waxing-crescent': '\u{1F312}', 'first-quarter': '\u{1F313}',
      'waxing-gibbous': '\u{1F314}', 'full': '\u{1F315}', 'waning-gibbous': '\u{1F316}',
      'last-quarter': '\u{1F317}', 'waning-crescent': '\u{1F318}'
    };
    return emojis[key] || '\u{1F311}';
  },

  // ── Moon Phase Tarot Influence ────────────────────────────
  getMoonInfluence(moonPhase) {
    const influences = {
      'new': {
        energy: { ar: 'تأمّلية', en: 'introspective' },
        theme: { ar: 'بدايات جديدة، تحديد النوايا، زراعة البذور', en: 'new beginnings, setting intentions, planting seeds' },
        favoredSuits: ['cups', 'pentacles']
      },
      'waxing-crescent': {
        energy: { ar: 'بنّاءة', en: 'building' },
        theme: { ar: 'اتخاذ الخطوات الأولى، خطط ناشئة، زخم متنامٍ', en: 'taking first steps, emerging plans, growing momentum' },
        favoredSuits: ['wands']
      },
      'first-quarter': {
        energy: { ar: 'حاسمة', en: 'decisive' },
        theme: { ar: 'التغلب على العقبات، اتخاذ الإجراءات، الالتزام', en: 'overcoming obstacles, taking action, commitment' },
        favoredSuits: ['swords', 'wands']
      },
      'waxing-gibbous': {
        energy: { ar: 'صاقلة', en: 'refining' },
        theme: { ar: 'تعديلات، صبر، ثقة بالمسار', en: 'adjustments, patience, trust the process' },
        favoredSuits: ['pentacles']
      },
      'full': {
        energy: { ar: 'مُنيرة', en: 'illuminated' },
        theme: { ar: 'اكتمال، كشف، حدس مُتعاظم', en: 'completion, revelation, heightened intuition' },
        favoredSuits: ['cups']
      },
      'waning-gibbous': {
        energy: { ar: 'ممتنّة', en: 'grateful' },
        theme: { ar: 'مشاركة الحكمة، الامتنان، ردّ الجميل', en: 'sharing wisdom, gratitude, giving back' },
        favoredSuits: ['cups', 'pentacles']
      },
      'last-quarter': {
        energy: { ar: 'مُحرِّرة', en: 'releasing' },
        theme: { ar: 'التخلّي، المسامحة، تفريغ المساحة', en: 'letting go, forgiveness, clearing space' },
        favoredSuits: ['swords']
      },
      'waning-crescent': {
        energy: { ar: 'مُريحة', en: 'resting' },
        theme: { ar: 'الاستسلام، الراحة، التأمل الروحي', en: 'surrender, rest, spiritual reflection' },
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
  // Combines day ruler element + current mansion element
  getElementOfDay(date = new Date()) {
    const ruler = this.getDayRuler(date);
    const mansion = this.getLunarMansion(date);

    const planetElements = {
      sun: 'fire', moon: 'water', mars: 'fire',
      mercury: 'air', jupiter: 'fire', venus: 'earth', saturn: 'earth'
    };

    const dayElement = planetElements[ruler];
    const mansionElement = mansion.element;

    return {
      primary: dayElement,
      secondary: mansionElement,
      harmony: dayElement === mansionElement,
      description: dayElement === mansionElement
        ? `طاقة ${dayElement} مضاعفة — قوة مكثّفة`
        : `${dayElement} يلتقي ${mansionElement}`
    };
  },

  // ── Get Mansion Description ───────────────────────────────
  getMansionDescription(mansionId, lang = 'ar') {
    const desc = this.mansionDescriptions[mansionId];
    if (!desc) return '';
    return desc[lang] || desc.ar || desc.en || '';
  },

  // ── Mansion Nature Label ──────────────────────────────────
  getMansionNature(mansion) {
    if (mansion.nature === "sa'd") return { ar: 'سعد (مبارك)', en: 'Fortunate' };
    return { ar: 'نحس (تحذيري)', en: 'Cautionary' };
  },

  // ── Full Daily Energy Report ──────────────────────────────
  getDailyEnergy(date = new Date()) {
    const moonPhase = this.getMoonPhase(date);
    const dayRuler = this.getDayRuler(date);
    const currentMansion = this.getLunarMansion(date);
    const elementOfDay = this.getElementOfDay(date);
    const moonInfluence = this.getMoonInfluence(moonPhase);
    const mansionDesc = this.getMansionDescription(currentMansion.id, 'ar');

    return {
      date,
      moonPhase,
      moonInfluence,
      dayRuler,
      dayRulerEnergy: this.planetaryEnergy[dayRuler],
      currentMansion,
      mansionDescription: mansionDesc,
      // Backward compat aliases
      zodiacSeason: currentMansion,
      elementOfDay,
      energySignature: {
        dominant: elementOfDay.primary,
        moon: moonPhase.name,
        planet: dayRuler,
        mansion: currentMansion.id,
        zodiac: currentMansion.id,  // backward compat
        isHarmonious: elementOfDay.harmony,
        favoredSuits: [...new Set([...moonInfluence.favoredSuits, ...currentMansion.favoredSuits])]
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
  },

  // ── Mansion Compatibility ─────────────────────────────────
  // Used for friend/compatibility readings
  getMansionCompatibility(mansion1, mansion2) {
    // Element harmony
    const elemental = this.getElementalHarmony(mansion1.element, mansion2.element);

    // Nature harmony (both fortunate = good, both cautionary = challenging, mixed = interesting)
    let natureHarmony;
    if (mansion1.nature === mansion2.nature) {
      natureHarmony = mansion1.nature === "sa'd" ? 'blessed' : 'intense';
    } else {
      natureHarmony = 'balancing';
    }

    // Ruler harmony (same ruler = strong bond)
    const rulerMatch = mansion1.ruler === mansion2.ruler;

    // Distance between mansions (0-14, where 14 is opposite)
    const dist = Math.abs(mansion1.index - mansion2.index);
    const distance = Math.min(dist, 28 - dist);
    let distanceHarmony;
    if (distance === 0) distanceHarmony = 'identical';
    else if (distance === 14) distanceHarmony = 'opposite';
    else if (distance <= 3) distanceHarmony = 'neighboring';
    else if (distance >= 12 && distance <= 16) distanceHarmony = 'contrasting';
    else distanceHarmony = 'moderate';

    // Overall score (0-100)
    let score = 50;
    if (elemental === 'amplified') score += 15;
    else if (elemental === 'harmonious') score += 10;
    else if (elemental === 'challenging') score -= 10;
    if (natureHarmony === 'blessed') score += 15;
    else if (natureHarmony === 'intense') score -= 5;
    if (rulerMatch) score += 10;
    if (distanceHarmony === 'neighboring') score += 5;
    else if (distanceHarmony === 'opposite') score += 5; // opposites attract

    score = Math.max(20, Math.min(95, score));

    return {
      score,
      elemental,
      natureHarmony,
      rulerMatch,
      distanceHarmony
    };
  }
};
