// ============================================================
// journal.js — Reading Journal & Pattern Analytics (Mirror)
// Saves readings to localStorage, calendar view, analytics
// ============================================================

const Journal = {
  STORAGE_KEY: 'tarot_journal',

  // ── Save a reading ──────────────────────────────────────────
  saveReading(reading, interpretation, readingForName) {
    const entries = this.getAll();
    const now = new Date();

    const entry = {
      id: now.getTime().toString(36),
      date: now.toISOString(),
      dateKey: this._dateKey(now),
      spreadId: reading.spread.id,
      spreadName: reading.spread.nameKey,
      readingFor: readingForName || null,
      cards: reading.cards.map((c, i) => ({
        cardId: c.card.id,
        cardName: interpretation.cards[i]?.cardName || c.card.name?.en || c.card.id,
        isReversed: c.isReversed,
        element: c.card.element,
        suit: c.card.suit || 'major',
        isMajor: !c.card.suit,
        positionName: interpretation.cards[i]?.positionName || ''
      })),
      summary: interpretation.summary || ''
    };

    entries.push(entry);
    this._save(entries);
    return entry;
  },

  // ── Get all entries ─────────────────────────────────────────
  getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to load journal:', e);
      return [];
    }
  },

  // ── Get entries for a specific date ─────────────────────────
  getByDate(dateKey) {
    return this.getAll().filter(e => e.dateKey === dateKey);
  },

  // ── Get dates that have readings (for calendar dots) ────────
  getReadingDates() {
    const entries = this.getAll();
    const dates = {};
    entries.forEach(e => {
      dates[e.dateKey] = (dates[e.dateKey] || 0) + 1;
    });
    return dates;
  },

  // ── Delete an entry ─────────────────────────────────────────
  deleteEntry(id) {
    const entries = this.getAll().filter(e => e.id !== id);
    this._save(entries);
  },

  // ── Analytics: compute all patterns ─────────────────────────
  getAnalytics() {
    const entries = this.getAll();
    if (entries.length === 0) return null;

    const allCards = entries.flatMap(e => e.cards);
    const totalCards = allCards.length;
    const totalReadings = entries.length;

    // 1. Most drawn cards (top 10)
    const cardCounts = {};
    allCards.forEach(c => {
      cardCounts[c.cardName] = (cardCounts[c.cardName] || 0) + 1;
    });
    const topCards = Object.entries(cardCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / totalCards) * 100) }));

    // 2. Element distribution
    const elements = { fire: 0, water: 0, air: 0, earth: 0 };
    allCards.forEach(c => {
      if (c.element && elements[c.element] !== undefined) elements[c.element]++;
    });
    const elementTotal = Object.values(elements).reduce((a, b) => a + b, 0);
    const elementStats = Object.entries(elements).map(([el, count]) => ({
      element: el,
      count,
      pct: elementTotal > 0 ? Math.round((count / elementTotal) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    // 3. Upright vs Reversed ratio
    const upright = allCards.filter(c => !c.isReversed).length;
    const reversed = allCards.filter(c => c.isReversed).length;
    const uprightPct = totalCards > 0 ? Math.round((upright / totalCards) * 100) : 0;

    // 4. Suit distribution
    const suits = { major: 0, wands: 0, cups: 0, swords: 0, pentacles: 0 };
    allCards.forEach(c => {
      const s = c.isMajor ? 'major' : (c.suit || 'major');
      if (suits[s] !== undefined) suits[s]++;
    });
    const suitStats = Object.entries(suits).map(([suit, count]) => ({
      suit,
      count,
      pct: totalCards > 0 ? Math.round((count / totalCards) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    // 5. Spread usage
    const spreadCounts = {};
    entries.forEach(e => {
      spreadCounts[e.spreadId] = (spreadCounts[e.spreadId] || 0) + 1;
    });
    const spreadStats = Object.entries(spreadCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({ id, count }));

    // 6. Reading streak
    const dateSet = new Set(entries.map(e => e.dateKey));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (dateSet.has(this._dateKey(d))) {
        streak++;
      } else {
        break;
      }
    }

    return {
      totalReadings,
      totalCards,
      topCards,
      elementStats,
      uprightPct,
      reversedPct: 100 - uprightPct,
      upright,
      reversed,
      suitStats,
      spreadStats,
      streak,
      firstReading: entries[0]?.date,
      lastReading: entries[entries.length - 1]?.date
    };
  },

  // ── Private helpers ─────────────────────────────────────────
  _save(entries) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
  },

  _dateKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  _todayKey() {
    return this._dateKey(new Date());
  }
};
