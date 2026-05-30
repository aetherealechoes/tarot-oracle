// ============================================================
// spreads.js — Spread Layouts & Card Dealing
// ============================================================

const Spreads = {

  definitions: {
    single: {
      id: 'single',
      nameKey: 'spreadSingleCard',
      descKey: 'spreadSingleCardDesc',
      cardCount: 1,
      icon: '✦',
      positions: [
        { key: 'posSingle', gridArea: '2 / 2' }
      ],
      gridTemplate: { cols: 3, rows: 3 }
    },

    threeCard: {
      id: 'threeCard',
      nameKey: 'spreadThreeCard',
      descKey: 'spreadThreeCardDesc',
      cardCount: 3,
      icon: '☽ ✦ ☾',
      positions: [
        { key: 'posPast',    gridArea: '1 / 1' },
        { key: 'posPresent', gridArea: '1 / 2' },
        { key: 'posFuture',  gridArea: '1 / 3' }
      ],
      gridTemplate: { cols: 3, rows: 1 }
    },

    celticCross: {
      id: 'celticCross',
      nameKey: 'spreadCelticCross',
      descKey: 'spreadCelticCrossDesc',
      cardCount: 10,
      icon: '✚',
      positions: [
        { key: 'posSituation',    gridArea: '3 / 2', label: '1' },
        { key: 'posChallenge',    gridArea: '3 / 2', label: '2', crossing: true },
        { key: 'posConscious',    gridArea: '1 / 2', label: '3' },
        { key: 'posSubconscious', gridArea: '5 / 2', label: '4' },
        { key: 'posRecentPast',   gridArea: '3 / 1', label: '5' },
        { key: 'posNearFuture',   gridArea: '3 / 3', label: '6' },
        { key: 'posYourself',     gridArea: '5 / 4', label: '7' },
        { key: 'posEnvironment',  gridArea: '4 / 4', label: '8' },
        { key: 'posHopesFears',   gridArea: '2 / 4', label: '9' },
        { key: 'posOutcome',      gridArea: '1 / 4', label: '10' }
      ],
      gridTemplate: { cols: 4, rows: 5 }
    },

    relationship: {
      id: 'relationship',
      nameKey: 'spreadRelationship',
      descKey: 'spreadRelationshipDesc',
      cardCount: 6,
      icon: '♡',
      positions: [
        { key: 'posYou',          gridArea: '2 / 1', label: '1' },
        { key: 'posPartner',      gridArea: '2 / 3', label: '2' },
        { key: 'posConnection',   gridArea: '1 / 2', label: '3' },
        { key: 'posStrength',     gridArea: '2 / 2', label: '4' },
        { key: 'posChallengRel',  gridArea: '3 / 2', label: '5' },
        { key: 'posFutureRel',    gridArea: '4 / 2', label: '6' }
      ],
      gridTemplate: { cols: 3, rows: 4 }
    },

    career: {
      id: 'career',
      nameKey: 'spreadCareer',
      descKey: 'spreadCareerDesc',
      cardCount: 5,
      icon: '⚝',
      positions: [
        { key: 'posCurrentPath',     gridArea: '2 / 1', label: '1' },
        { key: 'posObstacle',        gridArea: '2 / 2', label: '2' },
        { key: 'posHiddenInfluence', gridArea: '1 / 2', label: '3' },
        { key: 'posAction',          gridArea: '2 / 3', label: '4' },
        { key: 'posOutcomeCareer',   gridArea: '1 / 3', label: '5' }
      ],
      gridTemplate: { cols: 3, rows: 2 }
    },

    yesNo: {
      id: 'yesNo',
      nameKey: 'spreadYesNo',
      descKey: 'spreadYesNoDesc',
      cardCount: 1,
      icon: '⚖',
      positions: [
        { key: 'posAnswer', gridArea: '1 / 1' }
      ],
      gridTemplate: { cols: 1, rows: 1 },
      // Yes/No determination based on card energy
      isYesCard(card, isReversed) {
        // Generally upright = yes tendency, reversed = no tendency
        // But also depends on card nature
        const yesCards = [
          'the-sun', 'the-star', 'the-world', 'the-empress', 'the-magician',
          'wheel-of-fortune', 'strength', 'temperance', 'the-lovers', 'the-chariot'
        ];
        const noCards = [
          'the-tower', 'the-devil', 'death', 'the-hanged-man',
          'the-moon', 'the-hermit'
        ];

        if (isReversed) {
          return yesCards.includes(card.id) ? 'maybe' : 'no';
        }
        if (yesCards.includes(card.id)) return 'yes';
        if (noCards.includes(card.id)) return 'no';

        // For minor arcana, generally positive numbers are yes
        if (card.number) {
          const positiveNumbers = [1, 3, 6, 9, 10];
          return positiveNumbers.includes(card.number) ? 'yes' : 'maybe';
        }
        return 'maybe';
      }
    }
  },

  // ── Get All Spread Types ──────────────────────────────────
  getAll() {
    return Object.values(this.definitions);
  },

  // ── Get Specific Spread ───────────────────────────────────
  get(id) {
    return this.definitions[id];
  },

  // ── Shuffle Deck ──────────────────────────────────────────
  // Fisher-Yates shuffle
  shuffleDeck(deck, allowReversals = false) {
    const shuffled = deck.map(card => ({
      ...card,
      isReversed: allowReversals ? Math.random() < 0.35 : false
    }));

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // ── Deal Cards for a Spread ───────────────────────────────
  dealSpread(spreadId, deck, allowReversals = false) {
    const spread = this.get(spreadId);
    if (!spread) return null;

    const shuffled = this.shuffleDeck(deck, allowReversals);
    const dealt = shuffled.slice(0, spread.cardCount);

    return {
      spread,
      cards: dealt.map((card, i) => ({
        card,
        position: spread.positions[i],
        isReversed: card.isReversed || false
      }))
    };
  }
};
