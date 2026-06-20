// ============================================================
// numerology.js — Numerology Engine (Arabic / Abjad Only)
// Life path, expression, personal day/year calculations
// Always uses Abjad numerology for name-based calculations
// ============================================================

const Numerology = {

  // ── Reduce to Single Digit (or Master Number) ─────────────
  reduce(num) {
    if (num === 11 || num === 22 || num === 33) return num;
    while (num > 9) {
      num = String(num).split('').reduce((a, b) => a + parseInt(b), 0);
      if (num === 11 || num === 22 || num === 33) return num;
    }
    return num;
  },

  // ── Life Path Number ──────────────────────────────────────
  getLifePath(year, month, day) {
    const m = this.reduce(month);
    const d = this.reduce(day);
    const y = this.reduce(year);
    return this.reduce(m + d + y);
  },

  // ── Personal Year Number ──────────────────────────────────
  getPersonalYear(birthMonth, birthDay, currentYear = new Date().getFullYear()) {
    const m = this.reduce(birthMonth);
    const d = this.reduce(birthDay);
    const y = this.reduce(currentYear);
    return this.reduce(m + d + y);
  },

  // ── Personal Month Number ─────────────────────────────────
  getPersonalMonth(birthMonth, birthDay, date = new Date()) {
    const personalYear = this.getPersonalYear(birthMonth, birthDay, date.getFullYear());
    const currentMonth = this.reduce(date.getMonth() + 1);
    return this.reduce(personalYear + currentMonth);
  },

  // ── Personal Day Number ───────────────────────────────────
  getPersonalDay(birthMonth, birthDay, date = new Date()) {
    const personalMonth = this.getPersonalMonth(birthMonth, birthDay, date);
    const currentDay = this.reduce(date.getDate());
    return this.reduce(personalMonth + currentDay);
  },

  // ── Universal Day Number ──────────────────────────────────
  getUniversalDay(date = new Date()) {
    const sum = (date.getMonth() + 1) + date.getDate() + date.getFullYear();
    return this.reduce(sum);
  },

  // ── Abjad Letter Values (حساب الجمل) ──────────────────────
  _arabicLetterValue(char) {
    const abjad = {
      '\u0627': 1, '\u0623': 1, '\u0625': 1, '\u0622': 1, '\u0621': 1,
      '\u0628': 2, '\u062c': 3, '\u062f': 4, '\u0647': 5, '\u0629': 5,
      '\u0648': 6, '\u0632': 7, '\u062d': 8, '\u0637': 9,
      '\u064a': 1, '\u0649': 1, '\u0643': 2, '\u0644': 3, '\u0645': 4, '\u0646': 5,
      '\u0633': 6, '\u0639': 7, '\u0641': 8, '\u0635': 9,
      '\u0642': 1, '\u0631': 2, '\u0634': 3, '\u062a': 4, '\u062b': 5,
      '\u062e': 6, '\u0630': 7, '\u0636': 8, '\u0638': 9, '\u063a': 1
    };
    return abjad[char] || 0;
  },

  _isArabicVowel(char) {
    return '\u0627\u0623\u0625\u0622\u0648\u064a'.includes(char);
  },

  // ── Arabic name to number (Abjad) ─────────────────────────
  _arabicNameToNumber(name) {
    const chars = name.replace(/[\s\u0640\u064B-\u065F]/g, '');
    const sum = chars.split('').reduce((acc, c) => acc + this._arabicLetterValue(c), 0);
    return this.reduce(sum || 1);
  },

  // ── Expression Number (full name — all letters, Abjad) ────
  getExpressionNumber(fullName) {
    return this._arabicNameToNumber(fullName);
  },

  // ── Soul Urge Number (Arabic vowels only, Abjad) ──────────
  getSoulUrge(fullName) {
    const vowels = fullName.replace(/[\s\u0640\u064B-\u065F]/g, '').split('').filter(c => this._isArabicVowel(c)).join('');
    return this._arabicNameToNumber(vowels);
  },

  // ── Personality Number (Arabic consonants only, Abjad) ─────
  getPersonalityNumber(fullName) {
    const consonants = fullName.replace(/[\s\u0640\u064B-\u065F]/g, '').split('').filter(c => !this._isArabicVowel(c) && this._arabicLetterValue(c) > 0).join('');
    return this._arabicNameToNumber(consonants);
  },

  // ── Name Numerology Meanings (Arabic only) ────────────────
  expressionMeanings: {
    1: '\u0642\u0627\u0626\u062f \u0628\u0627\u0644\u0641\u0637\u0631\u0629 \u064a\u062a\u062d\u0644\u0651\u0649 \u0628\u0627\u0644\u0623\u0635\u0627\u0644\u0629 \u0648\u0627\u0644\u0639\u0632\u064a\u0645\u0629',
    2: '\u062f\u0628\u0644\u0648\u0645\u0627\u0633\u064a \u0628\u0627\u0644\u0637\u0628\u064a\u0639\u0629 \u0648\u0635\u0627\u0646\u0639 \u0633\u0644\u0627\u0645',
    3: '\u0631\u0648\u062d \u0645\u0628\u062f\u0639\u0629 \u0641\u064a \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u062a\u0641\u064a\u0636 \u0628\u0627\u0644\u0628\u0647\u062c\u0629',
    4: '\u0628\u0646\u0651\u0627\u0621 \u0639\u0645\u0644\u064a \u064a\u0634\u064a\u0651\u062f \u0623\u0633\u0633\u0627\u064b \u0631\u0627\u0633\u062e\u0629',
    5: '\u0628\u0627\u062d\u062b \u0639\u0646 \u0627\u0644\u062d\u0631\u064a\u0629 \u062a\u0633\u062a\u0647\u0648\u064a\u0647 \u0627\u0644\u0645\u063a\u0627\u0645\u0631\u0629 \u0648\u0627\u0644\u062a\u062d\u0648\u0651\u0644',
    6: '\u0631\u0648\u062d \u062d\u0627\u0646\u064a\u0629 \u0645\u0643\u0631\u0651\u0633\u0629 \u0644\u0644\u062d\u0628 \u0648\u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064a\u0629',
    7: '\u0628\u0627\u062d\u062b \u0639\u0646 \u0627\u0644\u062d\u0642\u064a\u0642\u0629 \u0648\u0627\u0644\u062d\u0643\u0645\u0629 \u0627\u0644\u0631\u0648\u062d\u0627\u0646\u064a\u0629',
    8: '\u0642\u0648\u0629 \u062c\u0628\u0651\u0627\u0631\u0629 \u0645\u0646 \u0627\u0644\u0637\u0645\u0648\u062d \u0648\u0627\u0644\u0625\u062a\u0642\u0627\u0646 \u0627\u0644\u0645\u0627\u062f\u064a',
    9: '\u0625\u0646\u0633\u0627\u0646 \u0631\u062d\u064a\u0645 \u064a\u062d\u0645\u0644 \u0631\u0624\u064a\u0629 \u0643\u0648\u0646\u064a\u0629 \u0634\u0627\u0645\u0644\u0629',
    11: '\u0635\u0627\u062d\u0628 \u0631\u0624\u064a\u0627 \u0645\u0646\u064a\u0631\u0629 \u064a\u0633\u062a\u0642\u0628\u0644 \u0627\u0644\u062d\u0642\u064a\u0642\u0629 \u0627\u0644\u0639\u0644\u064a\u0627',
    22: '\u0645\u0639\u0645\u0627\u0631\u064a \u0628\u0627\u0631\u0639 \u064a\u062d\u0648\u0651\u0644 \u0627\u0644\u0623\u062d\u0644\u0627\u0645 \u0625\u0644\u0649 \u0648\u0627\u0642\u0639',
    33: '\u0645\u0639\u0644\u0651\u0645 \u0639\u0638\u064a\u0645 \u064a\u0634\u0639\u0651 \u0628\u0627\u0644\u062d\u0628 \u063a\u064a\u0631 \u0627\u0644\u0645\u0634\u0631\u0648\u0637'
  },

  soulUrgeMeanings: {
    1: '\u0623\u0646 \u064a\u0642\u0648\u062f\u060c \u0623\u0646 \u064a\u0628\u062a\u0643\u0631\u060c \u0623\u0646 \u064a\u0643\u0648\u0646 \u0627\u0644\u0623\u0648\u0644',
    2: '\u0623\u0646 \u064a\u062d\u0628\u060c \u0623\u0646 \u064a\u062c\u062f \u0627\u0644\u0627\u0646\u0633\u062c\u0627\u0645\u060c \u0623\u0646 \u064a\u062a\u0648\u0627\u0635\u0644',
    3: '\u0623\u0646 \u064a\u0628\u062f\u0639\u060c \u0623\u0646 \u064a\u0639\u0628\u0651\u0631\u060c \u0623\u0646 \u064a\u0644\u0647\u0645 \u0627\u0644\u0641\u0631\u062d',
    4: '\u0623\u0646 \u064a\u0628\u0646\u064a\u060c \u0623\u0646 \u064a\u062b\u0628\u0651\u062a\u060c \u0623\u0646 \u064a\u062d\u0645\u064a',
    5: '\u0623\u0646 \u064a\u0633\u062a\u0643\u0634\u0641\u060c \u0623\u0646 \u064a\u062e\u062a\u0628\u0631\u060c \u0623\u0646 \u064a\u0643\u0648\u0646 \u062d\u0631\u0627\u064b',
    6: '\u0623\u0646 \u064a\u0631\u0639\u0649\u060c \u0623\u0646 \u064a\u0634\u0641\u064a\u060c \u0623\u0646 \u064a\u062e\u062f\u0645 \u0645\u0646 \u064a\u062d\u0628',
    7: '\u0623\u0646 \u064a\u0641\u0647\u0645\u060c \u0623\u0646 \u064a\u0628\u062d\u062b \u0639\u0646 \u0627\u0644\u062d\u0642\u064a\u0642\u0629\u060c \u0623\u0646 \u064a\u062c\u062f \u0627\u0644\u0633\u0643\u064a\u0646\u0629 \u0627\u0644\u062f\u0627\u062e\u0644\u064a\u0629',
    8: '\u0623\u0646 \u064a\u0646\u062c\u0632\u060c \u0623\u0646 \u064a\u062a\u0642\u0646\u060c \u0623\u0646 \u064a\u0646\u0627\u0644 \u0627\u0644\u0648\u0641\u0631\u0629',
    9: '\u0623\u0646 \u064a\u062e\u062f\u0645 \u0627\u0644\u0628\u0634\u0631\u064a\u0629\u060c \u0623\u0646 \u064a\u0634\u0641\u064a\u060c \u0623\u0646 \u064a\u062a\u062d\u0631\u0651\u0631',
    11: '\u0623\u0646 \u064a\u064f\u0646\u064a\u0631\u060c \u0623\u0646 \u064a\u064f\u0644\u0647\u0645\u060c \u0623\u0646 \u064a\u0648\u0642\u0638 \u0627\u0644\u0622\u062e\u0631\u064a\u0646',
    22: '\u0623\u0646 \u064a\u063a\u064a\u0651\u0631 \u0627\u0644\u0639\u0627\u0644\u0645 \u0628\u0627\u0644\u0631\u0624\u064a\u0629 \u0648\u0627\u0644\u0639\u0645\u0644',
    33: '\u0623\u0646 \u064a\u0631\u062a\u0642\u064a \u0628\u0627\u0644\u062c\u0645\u064a\u0639 \u0645\u0646 \u062e\u0644\u0627\u0644 \u0631\u062d\u0645\u0629 \u0644\u0627 \u062d\u062f\u0648\u062f \u0644\u0647\u0627'
  },

  personalityMeanings: {
    1: '\u0648\u0627\u062b\u0642 \u0648\u0645\u0639\u062a\u062f\u0651 \u0628\u0646\u0641\u0633\u0647',
    2: '\u0644\u0637\u064a\u0641 \u0648\u0648\u062f\u0648\u062f',
    3: '\u0633\u0627\u062d\u0631 \u0648\u0645\u0639\u0628\u0651\u0631',
    4: '\u0645\u0648\u062b\u0648\u0642 \u0648\u0631\u0627\u0633\u062e',
    5: '\u062c\u0630\u0651\u0627\u0628 \u0648\u0645\u063a\u0627\u0645\u0631',
    6: '\u062f\u0627\u0641\u0626 \u0648\u062d\u0627\u0645\u064d',
    7: '\u063a\u0627\u0645\u0636 \u0648\u062a\u0623\u0645\u0651\u0644\u064a',
    8: '\u0642\u0648\u064a \u0648\u0630\u0648 \u0647\u064a\u0628\u0629',
    9: '\u0639\u0627\u0631\u0641 \u0628\u0627\u0644\u062f\u0646\u064a\u0627 \u0648\u0631\u062d\u064a\u0645',
    11: '\u0623\u062b\u064a\u0631\u064a \u0648\u0645\u064f\u0644\u0647\u0650\u0645',
    22: '\u0645\u0647\u064a\u0628 \u0648\u0635\u0627\u062d\u0628 \u0631\u0624\u064a\u0629',
    33: '\u0645\u0634\u0631\u0642 \u0648\u0646\u0643\u0631\u0627\u0646 \u0644\u0644\u0630\u0627\u062a'
  },

  // ── Number Meanings (kept multilingual for compatibility with card data) ──
  meanings: {
    1:  {
      theme: { en: 'New Beginnings & Leadership', ar: '\u0628\u062f\u0627\u064a\u0627\u062a \u062c\u062f\u064a\u062f\u0629 \u0648\u0642\u064a\u0627\u062f\u0629' },
      energy: { en: 'independence, initiative, originality', ar: '\u0627\u0633\u062a\u0642\u0644\u0627\u0644\u064a\u0629\u060c \u0645\u0628\u0627\u062f\u0631\u0629\u060c \u0623\u0635\u0627\u0644\u0629' },
      advice: { en: 'Trust your instincts and take the lead today.', ar: '\u062b\u0642 \u0628\u062d\u062f\u0633\u0643 \u0648\u062a\u0648\u0644\u0651\u064e \u0632\u0645\u0627\u0645 \u0627\u0644\u0642\u064a\u0627\u062f\u0629 \u0627\u0644\u064a\u0648\u0645.' }
    },
    2:  {
      theme: { en: 'Partnership & Balance', ar: '\u0634\u0631\u0627\u0643\u0629 \u0648\u062a\u0648\u0627\u0632\u0646' },
      energy: { en: 'cooperation, diplomacy, sensitivity', ar: '\u062a\u0639\u0627\u0648\u0646\u060c \u062f\u0628\u0644\u0648\u0645\u0627\u0633\u064a\u0629\u060c \u062d\u0633\u0627\u0633\u064a\u0629' },
      advice: { en: 'Seek harmony in your connections and be patient.', ar: '\u0627\u0628\u062d\u062b \u0639\u0646 \u0627\u0644\u0627\u0646\u0633\u062c\u0627\u0645 \u0641\u064a \u0639\u0644\u0627\u0642\u0627\u062a\u0643 \u0648\u062a\u062d\u0644\u0651\u064e \u0628\u0627\u0644\u0635\u0628\u0631.' }
    },
    3:  {
      theme: { en: 'Creativity & Expression', ar: '\u0625\u0628\u062f\u0627\u0639 \u0648\u062a\u0639\u0628\u064a\u0631' },
      energy: { en: 'joy, communication, artistic flow', ar: '\u0641\u0631\u062d\u060c \u062a\u0648\u0627\u0635\u0644\u060c \u062a\u062f\u0641\u0651\u0642 \u0641\u0646\u064a' },
      advice: { en: 'Express yourself freely and embrace creative inspiration.', ar: '\u0639\u0628\u0651\u0631 \u0639\u0646 \u0646\u0641\u0633\u0643 \u0628\u062d\u0631\u064a\u0629 \u0648\u0627\u062d\u062a\u0636\u0646 \u0627\u0644\u0625\u0644\u0647\u0627\u0645 \u0627\u0644\u0625\u0628\u062f\u0627\u0639\u064a.' }
    },
    4:  {
      theme: { en: 'Foundation & Structure', ar: '\u0623\u0633\u0627\u0633 \u0648\u0628\u0646\u064a\u0629' },
      energy: { en: 'stability, discipline, hard work', ar: '\u062b\u0628\u0627\u062a\u060c \u0627\u0646\u0636\u0628\u0627\u0637\u060c \u0639\u0645\u0644 \u062f\u0624\u0648\u0628' },
      advice: { en: 'Build with care and attention to detail today.', ar: '\u0627\u0628\u0646\u0650 \u0628\u0639\u0646\u0627\u064a\u0629 \u0648\u0627\u0647\u062a\u0645\u0627\u0645 \u0628\u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u064a\u0648\u0645.' }
    },
    5:  {
      theme: { en: 'Change & Freedom', ar: '\u062a\u063a\u064a\u064a\u0631 \u0648\u062d\u0631\u064a\u0629' },
      energy: { en: 'adventure, versatility, transformation', ar: '\u0645\u063a\u0627\u0645\u0631\u0629\u060c \u062a\u0646\u0648\u0639\u060c \u062a\u062d\u0648\u0651\u0644' },
      advice: { en: 'Embrace change and stay adaptable \u2014 adventure calls.', ar: '\u0627\u062d\u062a\u0636\u0646 \u0627\u0644\u062a\u063a\u064a\u064a\u0631 \u0648\u0643\u0646 \u0645\u0631\u0646\u0627\u064b \u2014 \u0627\u0644\u0645\u063a\u0627\u0645\u0631\u0629 \u062a\u0646\u0627\u062f\u064a\u0643.' }
    },
    6:  {
      theme: { en: 'Love & Responsibility', ar: '\u062d\u0628 \u0648\u0645\u0633\u0624\u0648\u0644\u064a\u0629' },
      energy: { en: 'nurturing, harmony, domestic matters', ar: '\u0631\u0639\u0627\u064a\u0629\u060c \u0627\u0646\u0633\u062c\u0627\u0645\u060c \u0634\u0624\u0648\u0646 \u0627\u0644\u062f\u0627\u0631' },
      advice: { en: 'Focus on home, heart, and those you care for.', ar: '\u0631\u0643\u0651\u0632 \u0639\u0644\u0649 \u0627\u0644\u0628\u064a\u062a \u0648\u0627\u0644\u0642\u0644\u0628 \u0648\u0645\u0646 \u062a\u062d\u0628\u0651\u0647\u0645.' }
    },
    7:  {
      theme: { en: 'Wisdom & Introspection', ar: '\u062d\u0643\u0645\u0629 \u0648\u062a\u0623\u0645\u0651\u0644' },
      energy: { en: 'spiritual seeking, analysis, solitude', ar: '\u0628\u062d\u062b \u0631\u0648\u062d\u0627\u0646\u064a\u060c \u062a\u062d\u0644\u064a\u0644\u060c \u0639\u0632\u0644\u0629' },
      advice: { en: 'Go within. Meditation and study are favored.', ar: '\u0627\u062a\u0651\u062c\u0647 \u0625\u0644\u0649 \u062f\u0627\u062e\u0644\u0643. \u0627\u0644\u062a\u0623\u0645\u0651\u0644 \u0648\u0627\u0644\u062f\u0631\u0627\u0633\u0629 \u0641\u064a \u0635\u0627\u0644\u062d\u0643 \u0627\u0644\u064a\u0648\u0645.' }
    },
    8:  {
      theme: { en: 'Power & Abundance', ar: '\u0642\u0648\u0629 \u0648\u0648\u0641\u0631\u0629' },
      energy: { en: 'ambition, manifestation, material success', ar: '\u0637\u0645\u0648\u062d\u060c \u062a\u062c\u0644\u0651\u064a\u060c \u0646\u062c\u0627\u062d \u0645\u0627\u062f\u064a' },
      advice: { en: 'Step into your authority. Financial matters are highlighted.', ar: '\u062a\u0642\u062f\u0651\u0645 \u0628\u0633\u0644\u0637\u062a\u0643. \u0627\u0644\u0634\u0624\u0648\u0646 \u0627\u0644\u0645\u0627\u0644\u064a\u0629 \u0641\u064a \u062f\u0627\u0626\u0631\u0629 \u0627\u0644\u0636\u0648\u0621.' }
    },
    9:  {
      theme: { en: 'Completion & Compassion', ar: '\u0627\u0643\u062a\u0645\u0627\u0644 \u0648\u0631\u062d\u0645\u0629' },
      energy: { en: 'humanitarianism, release, universal love', ar: '\u0625\u0646\u0633\u0627\u0646\u064a\u0629\u060c \u062a\u062d\u0631\u0651\u0631\u060c \u062d\u0628 \u0643\u0648\u0646\u064a' },
      advice: { en: 'Let go of what no longer serves you. Give generously.', ar: '\u0623\u0637\u0644\u0642 \u0645\u0627 \u0644\u0645 \u064a\u0639\u062f \u064a\u062e\u062f\u0645\u0643. \u0648\u0623\u0639\u0637\u0650 \u0628\u0633\u062e\u0627\u0621.' }
    },
    11: {
      theme: { en: 'Spiritual Illumination', ar: '\u062a\u0646\u0648\u064a\u0631 \u0631\u0648\u062d\u0627\u0646\u064a' },
      energy: { en: 'intuition, inspiration, visionary insight', ar: '\u062d\u062f\u0633\u060c \u0625\u0644\u0647\u0627\u0645\u060c \u0628\u0635\u064a\u0631\u0629 \u0646\u0628\u0648\u064a\u0629' },
      advice: { en: 'Your intuition is heightened. Trust the visions that come.', ar: '\u062d\u062f\u0633\u0643 \u0641\u064a \u0630\u0631\u0648\u062a\u0647. \u062b\u0642 \u0628\u0627\u0644\u0631\u0624\u0649 \u0627\u0644\u062a\u064a \u062a\u0623\u062a\u064a\u0643.' }
    },
    22: {
      theme: { en: 'Master Builder', ar: '\u0627\u0644\u0628\u0646\u0651\u0627\u0621 \u0627\u0644\u0623\u0639\u0638\u0645' },
      energy: { en: 'large-scale achievement, practical idealism', ar: '\u0625\u0646\u062c\u0627\u0632 \u0648\u0627\u0633\u0639 \u0627\u0644\u0646\u0637\u0627\u0642\u060c \u0645\u062b\u0627\u0644\u064a\u0629 \u0639\u0645\u0644\u064a\u0629' },
      advice: { en: 'Dream big and build with purpose \u2014 you can manifest the extraordinary.', ar: '\u0627\u062d\u0644\u0645 \u062d\u0644\u0645\u0627\u064b \u0643\u0628\u064a\u0631\u0627\u064b \u0648\u0627\u0628\u0646\u0650 \u0628\u0647\u062f\u0641 \u2014 \u0628\u0625\u0645\u0643\u0627\u0646\u0643 \u062a\u062c\u0633\u064a\u062f \u0627\u0644\u0645\u0639\u062c\u0632\u0627\u062a.' }
    },
    33: {
      theme: { en: 'Master Healer', ar: '\u0627\u0644\u0645\u0639\u0627\u0644\u0650\u062c \u0627\u0644\u0623\u0639\u0638\u0645' },
      energy: { en: 'compassionate service, spiritual teaching', ar: '\u062e\u062f\u0645\u0629 \u0631\u062d\u064a\u0645\u0629\u060c \u062a\u0639\u0644\u064a\u0645 \u0631\u0648\u062d\u0627\u0646\u064a' },
      advice: { en: 'Your gift is healing through love. Share your light.', ar: '\u0645\u0648\u0647\u0628\u062a\u0643 \u0647\u064a \u0627\u0644\u0634\u0641\u0627\u0621 \u0628\u0627\u0644\u062d\u0628. \u0627\u0646\u0634\u0631 \u0646\u0648\u0631\u0643.' }
    }
  },

  // ── Get Meaning for a Number ──────────────────────────────
  getMeaning(num) {
    return this.meanings[num] || this.meanings[this.reduce(num)];
  },

  // ── Full Numerology Profile ───────────────────────────────
  getProfile(year, month, day, currentDate = new Date(), fullName = null) {
    const lifePath = this.getLifePath(year, month, day);
    const personalYear = this.getPersonalYear(month, day, currentDate.getFullYear());
    const personalMonth = this.getPersonalMonth(month, day, currentDate);
    const personalDay = this.getPersonalDay(month, day, currentDate);
    const universalDay = this.getUniversalDay(currentDate);

    const profile = {
      lifePath,
      lifePathMeaning: this.getMeaning(lifePath),
      personalYear,
      personalYearMeaning: this.getMeaning(personalYear),
      personalMonth,
      personalMonthMeaning: this.getMeaning(personalMonth),
      personalDay,
      personalDayMeaning: this.getMeaning(personalDay),
      universalDay,
      universalDayMeaning: this.getMeaning(universalDay)
    };

    // Add name-based numbers if name is available
    if (fullName && fullName.trim().length > 1) {
      profile.expression = this.getExpressionNumber(fullName);
      profile.expressionMeaning = this.expressionMeanings[profile.expression] || this.expressionMeanings[this.reduce(profile.expression)];
      profile.soulUrge = this.getSoulUrge(fullName);
      profile.soulUrgeMeaning = this.soulUrgeMeanings[profile.soulUrge] || this.soulUrgeMeanings[this.reduce(profile.soulUrge)];
      profile.personality = this.getPersonalityNumber(fullName);
      profile.personalityMeaning = this.personalityMeanings[profile.personality] || this.personalityMeanings[this.reduce(profile.personality)];
    }

    return profile;
  }
};
