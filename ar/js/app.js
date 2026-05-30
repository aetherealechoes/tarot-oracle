// ============================================================
// app.js — Main Application Controller (Arabic-Only)
// Connects all modules: I18N, Celestial, Numerology, Spreads,
// Interpreter and card data into a unified Tarot Oracle
// Language is always Arabic, numerology always uses Abjad
// ============================================================

const App = {
  profile: null,
  deck: [],
  currentReading: null,
  currentInterpretation: null,
  revealedCount: 0,
  particleInterval: null,

  // ── 1. Initialization ────────────────────────────────────────
  init() {
    // Initialize internationalization
    I18N.init();

    // Build the 78-card deck
    this.buildDeck();

    // Load user profile from localStorage
    this.profile = this.loadProfile();
    this.readingForId = null; // null = reading for self

    // Ensure RTL is set
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';

    // Update all UI text via i18n
    this.updateUILanguage();

    // Set up event delegation on document body
    this._setupEventDelegation();

    // Navigate to appropriate screen
    if (this.profile) {
      this.showHome();
      this.showScreen('screen-home');
    } else {
      this.initOnboarding();
      this.showScreen('screen-onboarding');
    }
  },

  // ── 2. Build Full Deck ───────────────────────────────────────
  buildDeck() {
    this.deck = [
      ...MAJOR_ARCANA,
      ...SUIT_WANDS,
      ...SUIT_SWORDS,
      ...SUIT_CUPS,
      ...SUIT_PENTACLES
    ];
  },

  // ── 3. Screen Navigation ─────────────────────────────────────
  showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    const target = document.getElementById(screenId);
    if (!target) return;

    // Fade out current active screen
    screens.forEach((screen) => {
      if (screen.classList.contains('active')) {
        screen.classList.add('fading-out');
        screen.classList.remove('active');
        // Remove fading-out class after animation completes
        setTimeout(() => {
          screen.classList.remove('fading-out');
        }, 400);
      }
    });

    // Fade in the new screen after a brief delay
    setTimeout(() => {
      target.classList.add('active');
      window.scrollTo(0, 0);
    }, 50);
  },

  // ── 4. Onboarding Setup ──────────────────────────────────────
  initOnboarding() {
    const screen = document.getElementById('screen-onboarding');
    if (!screen) return;

    // Build the cosmic hook — value before data
    const today = new Date();
    const dailyEnergy = Celestial.getDailyEnergy(today);
    const moonName = I18N.t(dailyEnergy.moonPhase.name);
    const moonEmoji = dailyEnergy.moonPhase.emoji;
    const currentMansion = dailyEnergy.currentMansion || {};
    const mansionName = I18N.t(currentMansion.id || 'sharatain');
    const elementName = dailyEnergy.elementOfDay ? I18N.t(dailyEnergy.elementOfDay.primary) : '';

    const hookText = `${moonEmoji} ${moonName} يسطع فوقنا، ومنزل ${mansionName} يحكم اليوم، حامل معه طاقة ${elementName}. الأوراكل ترى ما يخبئه اليوم — لكنها تحتاج إلى بصمتك الكونية لتتحدث إليك مباشرة.`;

    screen.innerHTML = `
      <div class="onboarding-container">
        <div class="onboarding-hook">
          <p class="hook-text">${hookText}</p>
        </div>

        <div class="onboarding-oracle-img">
          <img src="images/oracle.png" alt="الأوراكل" />
        </div>

        <div class="onboarding-form">
          <p class="form-prompt" data-i18n="welcomeSubtitle">${I18N.t('welcomeSubtitle')}</p>

          <div class="onboarding-section">
            <label data-i18n="dobLabel">${I18N.t('dobLabel')}</label>
            <input type="hidden" id="dob-input" />
            <div class="dob-roller" id="dob-roller">
              <div class="roller-highlight"></div>
              <div class="roller-col" id="roller-day" data-role="day"></div>
              <div class="roller-col" id="roller-month" data-role="month"></div>
              <div class="roller-col" id="roller-year" data-role="year"></div>
            </div>
          </div>

          <div class="onboarding-section">
            <label>${I18N.t('fullNameLabel')} <span class="optional-hint">(${I18N.t('optionalLabel')})</span></label>
            <input type="text" id="name-input" class="name-input" placeholder="${I18N.t('fullNamePlaceholder')}" maxlength="60" autocomplete="name" />
            <span class="optional-desc">${I18N.t('nameOptionalHint')}</span>
          </div>

          <div class="onboarding-section">
            <label>${I18N.t('genderLabel')}</label>
            <div class="gender-selector" id="gender-selector">
              <button class="gender-btn active" data-gender="male" id="gender-male">${I18N.t('genderMale')}</button>
              <button class="gender-btn" data-gender="female" id="gender-female">${I18N.t('genderFemale')}</button>
            </div>
          </div>

          <div class="onboarding-preview" id="onboarding-preview" style="display:none;">
            <div class="preview-item">
              <span class="preview-label" data-i18n="yourSign">${I18N.t('yourSign')}</span>
              <span class="preview-value" id="preview-zodiac"></span>
            </div>
            <div class="preview-item">
              <span class="preview-label" data-i18n="lifePathNumber">${I18N.t('lifePathNumber')}</span>
              <span class="preview-value" id="preview-lifepath"></span>
            </div>
            <div class="preview-item preview-name-nums hidden" id="preview-name-nums">
              <span class="preview-label" data-i18n="expressionNumber">${I18N.t('expressionNumber')}</span>
              <span class="preview-value" id="preview-expression"></span>
            </div>
            <div class="preview-item preview-name-nums hidden" id="preview-soul-urge">
              <span class="preview-label" data-i18n="soulUrgeNumber">${I18N.t('soulUrgeNumber')}</span>
              <span class="preview-value" id="preview-soul-value"></span>
            </div>
          </div>
        </div>

        <button class="btn-begin" id="begin-journey-btn" disabled data-i18n="beginJourney">
          ${I18N.t('beginJourney')}
        </button>
      </div>
    `;

    // Shared preview updater
    const updatePreview = () => {
      const dobInput = document.getElementById('dob-input');
      const nameInput = document.getElementById('name-input');
      const val = dobInput?.value;
      const name = nameInput?.value?.trim() || '';

      if (!val) return;

      const parts = val.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);

      if (isNaN(year) || isNaN(month) || isNaN(day)) return;

      const mansion = Celestial.getBirthMansion(year, month, day);
      const lifePath = Numerology.getLifePath(year, month, day);

      const preview = document.getElementById('onboarding-preview');
      const previewZodiac = document.getElementById('preview-zodiac');
      const previewLifepath = document.getElementById('preview-lifepath');

      if (preview) preview.style.display = '';
      if (previewZodiac) previewZodiac.textContent = `${mansion.emoji} ${I18N.t(mansion.id)}`;
      if (previewLifepath) previewLifepath.textContent = I18N.toAr(lifePath);

      // Name-based numbers
      const nameNumsEl = document.getElementById('preview-name-nums');
      const soulUrgeEl = document.getElementById('preview-soul-urge');
      if (name.length > 1) {
        const expr = Numerology.getExpressionNumber(name);
        const soul = Numerology.getSoulUrge(name);
        const exprEl = document.getElementById('preview-expression');
        const soulVal = document.getElementById('preview-soul-value');
        if (exprEl) exprEl.textContent = I18N.toAr(expr);
        if (soulVal) soulVal.textContent = I18N.toAr(soul);
        if (nameNumsEl) nameNumsEl.classList.remove('hidden');
        if (soulUrgeEl) soulUrgeEl.classList.remove('hidden');
      } else {
        if (nameNumsEl) nameNumsEl.classList.add('hidden');
        if (soulUrgeEl) soulUrgeEl.classList.add('hidden');
      }

      // Enable begin button
      const beginBtn = document.getElementById('begin-journey-btn');
      if (beginBtn) beginBtn.disabled = false;
    };

    // ── Rolling date picker ──────────────────────────────────
    this._initDobRoller(updatePreview);

    // Name input handler
    const nameInput = document.getElementById('name-input');
    if (nameInput) nameInput.addEventListener('input', updatePreview);

    // Gender selector handler
    const genderSelector = document.getElementById('gender-selector');
    if (genderSelector) {
      genderSelector.addEventListener('click', (e) => {
        const btn = e.target.closest('.gender-btn');
        if (!btn) return;
        genderSelector.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    }
  },

  // ── 4b. Rolling DOB Picker ────────────────────────────────
  _initDobRoller(onChange, prefix = 'roller') {
    const ITEM_H = 44;
    const PAD = 2;

    const months = ['كانون الثاني','شباط','آذار','نيسان','أيّار','حزيران','تمّوز','آب','أيلول','تشرين الأول','تشرين الثاني','كانون الأول'];

    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= 1930; y--) years.push(y);

    // Resolve elements by prefix
    const dayCol   = document.getElementById(`${prefix}-day`);
    const monthCol = document.getElementById(`${prefix}-month`);
    const yearCol  = document.getElementById(`${prefix}-year`);
    const hiddenId = prefix === 'roller' ? 'dob-input' : `${prefix}-dob-input`;

    if (!dayCol || !monthCol || !yearCol) return;

    const buildItems = (col, values, labelFn) => {
      col.innerHTML = '';
      for (let i = 0; i < PAD; i++) {
        const pad = document.createElement('div');
        pad.className = 'roller-item roller-pad';
        col.appendChild(pad);
      }
      values.forEach((v, idx) => {
        const item = document.createElement('div');
        item.className = 'roller-item';
        item.textContent = labelFn ? labelFn(v, idx) : v;
        item.setAttribute('data-value', v);
        col.appendChild(item);
      });
      for (let i = 0; i < PAD; i++) {
        const pad = document.createElement('div');
        pad.className = 'roller-item roller-pad';
        col.appendChild(pad);
      }
    };

    const getSelected = (col) => {
      const scrollIdx = Math.round(col.scrollTop / ITEM_H);
      const items = col.querySelectorAll('.roller-item:not(.roller-pad)');
      const item = items[scrollIdx];
      return item ? parseInt(item.getAttribute('data-value'), 10) : null;
    };

    const highlightSelected = (col) => {
      const scrollIdx = Math.round(col.scrollTop / ITEM_H);
      const items = col.querySelectorAll('.roller-item:not(.roller-pad)');
      items.forEach((it, i) => it.classList.toggle('roller-selected', i === scrollIdx));
    };

    const writeHidden = () => {
      const m = getSelected(monthCol);
      const d = getSelected(dayCol);
      const y = getSelected(yearCol);
      if (m && d && y) {
        const hidden = document.getElementById(hiddenId);
        if (hidden) hidden.value = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        if (onChange) onChange();
      }
    };

    const attachSnap = (col) => {
      let timeout;
      col.addEventListener('scroll', () => {
        clearTimeout(timeout);
        highlightSelected(col);
        timeout = setTimeout(() => {
          const idx = Math.round(col.scrollTop / ITEM_H);
          col.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
          setTimeout(writeHidden, 120);
        }, 80);
      }, { passive: true });
    };

    const updateDays = () => {
      const m = getSelected(monthCol) || 1;
      const y = getSelected(yearCol) || 2000;
      const maxDay = new Date(y, m, 0).getDate();
      const days = [];
      for (let d = 1; d <= maxDay; d++) days.push(d);
      const prevDay = getSelected(dayCol) || 1;
      buildItems(dayCol, days, (v) => I18N.toAr(v));
      const targetDay = Math.min(prevDay, maxDay);
      dayCol.scrollTop = (targetDay - 1) * ITEM_H;
      highlightSelected(dayCol);
    };

    // Build columns
    const defaultDays = [];
    for (let d = 1; d <= 31; d++) defaultDays.push(d);

    buildItems(dayCol, defaultDays, (v) => I18N.toAr(v));
    buildItems(monthCol, Array.from({length:12}, (_,i) => i+1), (v, idx) => months[idx]);
    buildItems(yearCol, years, (v) => I18N.toAr(v));

    [dayCol, monthCol, yearCol].forEach(attachSnap);

    monthCol.addEventListener('scroll', () => setTimeout(updateDays, 150), { passive: true });
    yearCol.addEventListener('scroll', () => setTimeout(updateDays, 150), { passive: true });

    // Default: scroll to middle (year 1990, month 6, day 15)
    setTimeout(() => {
      monthCol.scrollTop = 5 * ITEM_H;
      dayCol.scrollTop = 14 * ITEM_H;
      const yr1990 = years.indexOf(1990);
      if (yr1990 >= 0) yearCol.scrollTop = yr1990 * ITEM_H;
      [dayCol, monthCol, yearCol].forEach(highlightSelected);
    }, 50);
  },

  // ── 5. Update UI Language ────────────────────────────────────
  updateUILanguage() {
    // Walk through all elements with data-i18n and update textContent
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      el.textContent = I18N.t(key);
    });

    // Update any dynamic content that uses data-i18n-placeholder
    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = I18N.t(key);
    });

    // Update document title
    document.title = I18N.t('appTitle');
  },

  // ── 6. Show Home Screen ──────────────────────────────────────
  showHome() {
    const screen = document.getElementById('screen-home');
    if (!screen) return;

    screen.innerHTML = `
      <header class="home-header">
        <h1 data-i18n="appTitle">${I18N.t('appTitle')}</h1>
        <p class="subtitle" data-i18n="appSubtitle">${I18N.t('appSubtitle')}</p>
        <button class="settings-btn" data-action="show-settings" aria-label="${I18N.t('settings')}">&#9881;</button>
      </header>

      <nav class="home-nav">
        <button class="home-nav-btn" data-action="show-numerology">
          <span class="nav-icon">&#128290;</span>
          <span data-i18n="numerologyReading">${I18N.t('numerologyReading')}</span>
        </button>
        <button class="home-nav-btn" data-action="show-glossary">
          <span class="nav-icon">&#128218;</span>
          <span data-i18n="glossary">${I18N.t('glossary')}</span>
        </button>
        <button class="home-nav-btn" data-action="show-journal">
          <span class="nav-icon">&#128216;</span>
          <span data-i18n="journal">${I18N.t('journal')}</span>
        </button>
        <button class="home-nav-btn" data-action="show-mirror">
          <span class="nav-icon">&#128302;</span>
          <span data-i18n="mirror">${I18N.t('mirror')}</span>
        </button>
      </nav>

      <section class="daily-oracle-section">
        <h2 data-i18n="dailyOracle">${I18N.t('dailyOracle')}</h2>
        <p class="section-desc" data-i18n="dailyOracleDesc">${I18N.t('dailyOracleDesc')}</p>
        <div class="daily-oracle-panel" id="daily-oracle-panel"></div>
      </section>

      <section class="spread-section">
        <h2 data-i18n="chooseSpread">${I18N.t('chooseSpread')}</h2>
        <div class="spread-grid" id="spread-grid"></div>
      </section>

      <section class="read-others-section">
        <h2 data-i18n="premiumTitle">${I18N.t('premiumTitle')}</h2>
        <p class="section-desc" data-i18n="premiumDesc">${I18N.t('premiumDesc')}</p>
        <div class="others-panel" id="others-panel"></div>
      </section>
    `;

    this.renderDailyOracle();
    this.renderSpreadOptions();
    this.renderOthersPanel();
  },

  // ── 7. Render Daily Oracle ───────────────────────────────────
  renderDailyOracle() {
    const panel = document.getElementById('daily-oracle-panel');
    if (!panel) return;

    const today = new Date();
    const dailyEnergy = Celestial.getDailyEnergy(today);
    const moonPhase = dailyEnergy.moonPhase;
    const dayRuler = dailyEnergy.dayRuler;
    const elementOfDay = dailyEnergy.elementOfDay;

    let personalDayHTML = '';
    let nameNumHTML = '';
    if (this.profile && this.profile.dob) {
      const { month, day } = this.profile.dob;
      const personalDay = Numerology.getPersonalDay(month, day, today);
      const meaning = Numerology.getMeaning(personalDay);
      const lang = I18N.currentLang;
      personalDayHTML = `
        <div class="oracle-item">
          <span class="oracle-label" data-i18n="personalDay">${I18N.t('personalDay')}</span>
          <span class="oracle-value">${I18N.toAr(personalDay)} &mdash; ${meaning.theme[lang] || meaning.theme.en}</span>
        </div>
      `;

      if (this.profile.fullName) {
        const expr = Numerology.getExpressionNumber(this.profile.fullName);
        const exprMeaning = Numerology.expressionMeanings[expr] || '';
        nameNumHTML = `
        <div class="oracle-item">
          <span class="oracle-label" data-i18n="expressionNumber">${I18N.t('expressionNumber')}</span>
          <span class="oracle-value">${I18N.toAr(expr)} &mdash; ${exprMeaning}</span>
        </div>`;
      }
    }

    panel.innerHTML = `
      <div class="oracle-item">
        <span class="oracle-label" data-i18n="moonPhase">${I18N.t('moonPhase')}</span>
        <span class="oracle-value">${moonPhase.emoji} ${I18N.t(moonPhase.name)}</span>
      </div>
      <div class="oracle-item">
        <span class="oracle-label" data-i18n="planetaryRuler">${I18N.t('planetaryRuler')}</span>
        <span class="oracle-value">${I18N.t(dayRuler)}</span>
      </div>
      <div class="oracle-item">
        <span class="oracle-label" data-i18n="elementOfDay">${I18N.t('elementOfDay')}</span>
        <span class="oracle-value">${I18N.t(elementOfDay.primary)}</span>
      </div>
      ${personalDayHTML}
      ${nameNumHTML}
    `;
  },

  // ── 8. Render Spread Options ─────────────────────────────────
  renderSpreadOptions() {
    const grid = document.getElementById('spread-grid');
    if (!grid) return;

    const spreads = Spreads.getAll();
    grid.innerHTML = '';

    spreads.forEach((spread) => {
      const card = document.createElement('div');
      card.className = 'spread-option-card';
      card.setAttribute('data-action', 'start-reading');
      card.setAttribute('data-spread-id', spread.id);

      card.innerHTML = `
        <span class="spread-icon">${spread.icon}</span>
        <h3 data-i18n="${spread.nameKey}">${I18N.t(spread.nameKey)}</h3>
        <p data-i18n="${spread.descKey}">${I18N.t(spread.descKey)}</p>
      `;

      grid.appendChild(card);
    });
  },

  // ── 8b. Render "Read for Others" Panel ───────────────────────
  renderOthersPanel() {
    const panel = document.getElementById('others-panel');
    if (!panel) return;

    const people = (this.profile && this.profile.people) || [];
    const activeId = this.readingForId || null; // null = self

    // "Myself" chip
    let html = `<div class="others-chips">
      <button class="person-chip ${!activeId ? 'active' : ''}" data-action="select-person" data-person-id="">
        <span class="chip-icon">&#9733;</span>
        <span class="chip-name">${I18N.t('readingForSelf')}</span>
      </button>`;

    // Saved people chips
    people.forEach((p) => {
      const mansion = Celestial.getBirthMansion(p.dob.year || new Date().getFullYear(), p.dob.month, p.dob.day);
      html += `
      <button class="person-chip ${activeId === p.id ? 'active' : ''}" data-action="select-person" data-person-id="${p.id}">
        <span class="chip-icon">${mansion.emoji}</span>
        <span class="chip-name">${p.name}</span>
        <span class="chip-sign">${I18N.t(mansion.id)}</span>
        <span class="chip-remove" data-action="remove-person" data-person-id="${p.id}">&times;</span>
      </button>`;
    });

    // Add person button
    html += `
      <button class="person-chip add-chip" data-action="show-add-person">
        <span class="chip-icon">+</span>
        <span class="chip-name">${I18N.t('premiumPeople')}</span>
      </button>
    </div>`;

    // Add person form (hidden by default)
    html += `
    <div class="add-person-form hidden" id="add-person-form">
      <input type="text" id="new-person-name" class="person-input" placeholder="${I18N.t('personName')}" maxlength="20" style="margin-bottom: var(--space-sm);">
      <label style="font-size:0.9rem; color:var(--text-muted); margin-bottom:var(--space-xs); display:block;">${I18N.t('dobLabel')}</label>
      <input type="hidden" id="ap-roller-dob-input" />
      <div class="dob-roller" id="ap-dob-roller">
        <div class="roller-highlight"></div>
        <div class="roller-col" id="ap-roller-day" data-role="day"></div>
        <div class="roller-col" id="ap-roller-month" data-role="month"></div>
        <div class="roller-col" id="ap-roller-year" data-role="year"></div>
      </div>
      <button class="btn-save-person" data-action="save-person" style="margin-top: var(--space-md);">${I18N.t('save')}</button>
    </div>`;

    // Show who we're reading for
    if (activeId) {
      const person = people.find(p => p.id === activeId);
      if (person) {
        const mansion = Celestial.getBirthMansion(person.dob.year || new Date().getFullYear(), person.dob.month, person.dob.day);
        const lifePath = Numerology.getProfile(person.dob.year, person.dob.month, person.dob.day, new Date()).lifePath;
        html += `
        <div class="reading-for-banner">
          <span>${I18N.t('readingFor')} <strong>${person.name}</strong> — ${mansion.emoji} ${I18N.t(mansion.id)}، ${I18N.t('lifePathNumber')} ${I18N.toAr(lifePath)}</span>
        </div>`;
      }
    }

    panel.innerHTML = html;
  },

  // ── 8c. Get active reading profile (self or other person) ───
  getReadingProfile() {
    if (this.readingForId && this.profile && this.profile.people) {
      const person = this.profile.people.find(p => p.id === this.readingForId);
      if (person) return { dob: person.dob, fullName: person.name || null };
    }
    return this.profile ? { dob: this.profile.dob, fullName: this.profile.fullName || null } : null;
  },

  // ── 9. Start a Reading ───────────────────────────────────────
  startReading(spreadId) {
    // Deal the spread
    const allowReversals = this.profile ? (this.profile.reversals !== false) : true;
    const reading = Spreads.dealSpread(spreadId, this.deck, allowReversals);
    if (!reading) return;

    this.currentReading = reading;
    this.revealedCount = 0;

    // Build user profile data for interpretation
    const today = new Date();
    const dailyEnergy = Celestial.getDailyEnergy(today);

    let userProfile = null;
    const readingData = this.getReadingProfile();
    if (readingData && readingData.dob) {
      const { year, month, day } = readingData.dob;
      const mansion = Celestial.getBirthMansion(year, month, day);
      const numProfile = Numerology.getProfile(year, month, day, today, readingData.fullName);
      userProfile = {
        zodiac: mansion,
        numerology: numProfile,
        lifePath: numProfile.lifePath,
        fullName: readingData.fullName
      };
    }

    // Pre-compute interpretation
    this.currentInterpretation = Interpreter.interpretReading(reading, userProfile, dailyEnergy);

    // Transition to reading screen
    const screen = document.getElementById('screen-reading');
    if (!screen) return;

    // Show who the reading is for
    let readingForHTML = '';
    if (this.readingForId && this.profile && this.profile.people) {
      const person = this.profile.people.find(p => p.id === this.readingForId);
      if (person) {
        const m = Celestial.getBirthMansion(person.dob.year || new Date().getFullYear(), person.dob.month, person.dob.day);
        readingForHTML = `<div class="reading-for-banner" style="margin-bottom:var(--space-md)">${I18N.t('readingFor')} <strong>${person.name}</strong> ${m.emoji}</div>`;
      }
    }

    screen.innerHTML = `
      <header class="reading-header">
        <button class="back-btn" data-action="back-home" data-i18n="back">${I18N.t('back')}</button>
        <h2 data-i18n="${reading.spread.nameKey}">${I18N.t(reading.spread.nameKey)}</h2>
      </header>
      ${readingForHTML}

      ${this.profile && this.profile.showOracle !== false ? `
      <div class="oracle-shuffle-scene" id="oracle-shuffle">
        <img src="images/OracleArabic.png" alt="Oracle" class="oracle-image" id="oracle-image"/>
      </div>
      ` : ''}

      <p class="reading-instruction" data-i18n="tapToReveal">${I18N.t('tapToReveal')}</p>
      <div class="spread-layout" id="spread-layout"></div>
      <div class="reading-summary-panel" id="reading-summary-panel" style="display:none;"></div>
    `;

    this.renderSpreadLayout(reading);
    this.showScreen('screen-reading');
  },

  // ── 10. Render Spread Layout ─────────────────────────────────
  renderSpreadLayout(reading) {
    const container = document.getElementById('spread-layout');
    if (!container) return;

    const spread = reading.spread;
    const cardCount = reading.cards.length;

    // Use a flex row layout — each card is a column with interpretation below
    container.className = 'spread-layout spread-flex';
    container.innerHTML = '';

    reading.cards.forEach((dealt, index) => {
      const position = dealt.position;
      const posName = I18N.t(position.key);

      // Card column wrapper
      const col = document.createElement('div');
      col.className = 'card-column';

      // Position label above the card
      const posLabel = document.createElement('div');
      posLabel.className = 'card-position-label';
      posLabel.textContent = posName;
      col.appendChild(posLabel);

      // The card itself
      const cardEl = document.createElement('div');
      cardEl.className = 'tarot-card face-down';
      cardEl.setAttribute('data-action', 'reveal-card');
      cardEl.setAttribute('data-card-index', index);

      if (position.crossing) {
        cardEl.classList.add('crossing-card');
      }

      cardEl.innerHTML = `
        <div class="card-inner">
          <div class="card-back">
            <div class="card-back-design"></div>
          </div>
          <div class="card-front">
            <img class="card-image" src="" alt="" loading="lazy" />
            <div class="card-name-overlay"></div>
          </div>
        </div>
      `;
      col.appendChild(cardEl);

      // Interpretation area below the card (hidden until revealed)
      const interpArea = document.createElement('div');
      interpArea.className = 'card-interpretation hidden';
      interpArea.id = `card-interp-${index}`;
      col.appendChild(interpArea);

      container.appendChild(col);
    });
  },

  // ── 11. Reveal a Single Card ─────────────────────────────────
  revealCard(index, dealt) {
    const cardEl = document.querySelector(`.tarot-card[data-card-index="${index}"]`);
    if (!cardEl || cardEl.classList.contains('revealed')) return;

    const card = dealt.card;
    const isReversed = dealt.isReversed;
    const lang = I18N.currentLang;
    const cardName = card.name[lang] || card.name.en;

    // Set card front content
    const cardFront = cardEl.querySelector('.card-front');
    const cardImage = cardEl.querySelector('.card-image');
    const cardNameOverlay = cardEl.querySelector('.card-name-overlay');

    if (cardImage) {
      cardImage.src = card.image;
      cardImage.alt = cardName;
      if (isReversed) {
        cardImage.classList.add('reversed');
      }
    }

    if (cardNameOverlay) {
      const reversedLabel = isReversed ? ` (${I18N.t('reversed')})` : '';
      cardNameOverlay.textContent = cardName + reversedLabel;
    }

    // Trigger flip animation
    cardEl.classList.add('flipping');
    setTimeout(() => {
      cardEl.classList.remove('face-down');
      cardEl.classList.add('revealed');
      cardEl.classList.remove('flipping');

      this.revealedCount++;

      // Show interpretation below this card
      const interpreted = this.currentInterpretation.cards[index];
      if (interpreted) {
        this.showInterpretation(index, interpreted);
      }

      // Check if all cards are revealed
      if (this.revealedCount === this.currentReading.cards.length) {
        // Save to journal
        let readingForName = null;
        if (this.readingForId && this.profile && this.profile.people) {
          const person = this.profile.people.find(p => p.id === this.readingForId);
          if (person) readingForName = person.name;
        }
        Journal.saveReading(this.currentReading, this.currentInterpretation, readingForName);

        setTimeout(() => {
          this.showReadingSummary(this.currentInterpretation);
        }, 800);
      }
    }, 600);
  },

  // ── 12. Show Card Interpretation (below the card) ───────────
  showInterpretation(index, interpreted) {
    const interpArea = document.getElementById(`card-interp-${index}`);
    if (!interpArea) return;

    const keywords = interpreted.keywords || [];
    const keywordTags = keywords.map((kw) => `<span class="keyword-tag">${kw}</span>`).join('');
    const orientation = interpreted.isReversed ? I18N.t('reversed') : I18N.t('upright');

    interpArea.innerHTML = `
      <div class="interp-inline" role="region" aria-label="${interpreted.cardName}">
        <span class="interp-orientation ${interpreted.isReversed ? 'reversed' : 'upright'}">${orientation}</span>
        <div class="interp-keywords">${keywordTags}</div>
        <div class="interp-meaning">
          <p>${I18N.toAr(interpreted.baseMeaning)}</p>
        </div>
        ${interpreted.personalizedNote ? `
        <div class="interp-personalized">
          <p>${I18N.toAr(interpreted.personalizedNote)}</p>
        </div>
        ` : ''}
      </div>
    `;

    interpArea.classList.remove('hidden');

    // Smooth scroll to this card's interpretation
    // Let the user scroll manually to the interpretation
  },

  // ── 13. Show Reading Summary ─────────────────────────────────
  showReadingSummary(fullInterpretation) {
    const panel = document.getElementById('reading-summary-panel');
    if (!panel) return;

    // Sanitize: strip any NaN/undefined artifacts from generated text
    const _sanitize = (text) => {
      if (!text || typeof text !== 'string') return '';
      return text.replace(/\bNaN\b/g, '').replace(/\bundefined\b/g, '').replace(/\s{2,}/g, ' ').trim();
    };
    const summary = I18N.toAr(_sanitize(fullInterpretation.summary));
    const dailyContext = I18N.toAr(_sanitize(fullInterpretation.dailyContext));

    // Build elemental analysis
    const elementCount = { fire: 0, water: 0, air: 0, earth: 0 };
    fullInterpretation.cards.forEach((c) => {
      if (c.element && elementCount[c.element] !== undefined) {
        elementCount[c.element]++;
      }
    });

    const elementBars = Object.entries(elementCount)
      .filter(([, count]) => count > 0)
      .map(([element, count]) => {
        const pct = Math.round((count / fullInterpretation.cards.length) * 100);
        return `
          <div class="element-bar">
            <span class="element-label">${I18N.t(element)}</span>
            <div class="element-bar-fill" style="width: ${pct}%"></div>
            <span class="element-count">${I18N.toAr(count)}</span>
          </div>
        `;
      })
      .join('');

    // Handle Yes/No spread special case
    let yesNoHTML = '';
    if (this.currentReading.spread.id === 'yesNo' && fullInterpretation.cards.length === 1) {
      const dealt = this.currentReading.cards[0];
      const yesNoResult = Interpreter.interpretYesNo(dealt.card, dealt.isReversed, I18N.currentLang, this.profile);
      yesNoHTML = `
        <div class="yes-no-result">
          <span class="yes-no-answer yes-no-${yesNoResult.answer}">${I18N.t('answer' + yesNoResult.answer.charAt(0).toUpperCase() + yesNoResult.answer.slice(1))}</span>
          <p class="yes-no-message">${yesNoResult.message}</p>
        </div>
      `;
    }

    panel.innerHTML = `
      <div class="reading-summary">
        <h2 data-i18n="yourReading">${I18N.t('yourReading')}</h2>

        ${yesNoHTML}

        ${elementBars ? `
        <div class="elemental-analysis">
          ${elementBars}
        </div>
        ` : ''}

        ${dailyContext ? `
        <div class="daily-context">
          <h3 data-i18n="todayEnergy">${I18N.t('todayEnergy')}</h3>
          <p>${dailyContext}</p>
        </div>
        ` : ''}

        ${summary ? `
        <div class="summary-text">
          <p>${summary}</p>
        </div>
        ` : ''}

        <div class="reading-end-actions">
          <button class="btn-primary new-reading-btn" data-action="new-reading" data-i18n="newReading">
            ${I18N.t('newReading')}
          </button>
          <button class="btn-secondary share-reading-btn" data-action="share-reading">
            &#128228; ${I18N.t('shareReading')}
          </button>
        </div>
      </div>
    `;

    panel.style.display = 'block';
    panel.classList.remove('hidden');
  },

  // ── 14. Show Settings ────────────────────────────────────────
  showSettings() {
    const screen = document.getElementById('screen-settings');
    if (!screen) return;

    const currentLang = I18N.currentLang;
    const reversals = this.profile ? (this.profile.reversals !== false) : true;
    const showOracle = this.profile ? (this.profile.showOracle !== false) : true;
    const gender = this.profile ? (this.profile.gender || 'male') : 'male';

    screen.innerHTML = `
      <header class="settings-header">
        <button class="back-btn" data-action="back-home" data-i18n="back">${I18N.t('back')}</button>
        <h2 data-i18n="settings">${I18N.t('settings')}</h2>
      </header>

      <div class="settings-content">
        <div class="settings-group">
          <label data-i18n="reversals">${I18N.t('reversals')}</label>
          <button class="toggle-btn ${reversals ? 'on' : 'off'}" data-action="toggle-reversals" id="reversals-toggle">
            ${reversals ? I18N.t('reversalsOn') : I18N.t('reversalsOff')}
          </button>
        </div>

        <div class="settings-group">
          <label data-i18n="showOracle">${I18N.t('showOracle')}</label>
          <button class="toggle-btn ${showOracle ? 'on' : 'off'}" data-action="toggle-oracle" id="oracle-toggle">
            ${showOracle ? I18N.t('showOracleOn') : I18N.t('showOracleOff')}
          </button>
        </div>

        <div class="settings-group">
          <label data-i18n="genderLabel">${I18N.t('genderLabel')}</label>
          <div class="speed-buttons">
            <button class="speed-btn ${gender === 'male' ? 'active' : ''}" data-action="set-gender" data-gender="male">${I18N.t('genderMale')}</button>
            <button class="speed-btn ${gender === 'female' ? 'active' : ''}" data-action="set-gender" data-gender="female">${I18N.t('genderFemale')}</button>
          </div>
        </div>

        <div class="settings-group settings-danger">
          <button class="btn-danger" data-action="reset-profile" data-i18n="resetProfile">${I18N.t('resetProfile')}</button>
        </div>
      </div>
    `;

    this.showScreen('screen-settings');
  },

  // ── 14b. Show Journal ────────────────────────────────────────
  showJournal(viewDate) {
    const container = document.getElementById('journal-container');
    if (!container) return;

    const now = viewDate || new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    this._journalViewDate = now;

    const readingDates = Journal.getReadingDates();
    const monthNames = {
      en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
      ar: ['\u064a\u0646\u0627\u064a\u0631','\u0641\u0628\u0631\u0627\u064a\u0631','\u0645\u0627\u0631\u0633','\u0623\u0628\u0631\u064a\u0644','\u0645\u0627\u064a\u0648','\u064a\u0648\u0646\u064a\u0648','\u064a\u0648\u0644\u064a\u0648','\u0623\u063a\u0633\u0637\u0633','\u0633\u0628\u062a\u0645\u0628\u0631','\u0623\u0643\u062a\u0648\u0628\u0631','\u0646\u0648\u0641\u0645\u0628\u0631','\u062f\u064a\u0633\u0645\u0628\u0631']
    };
    const dayNames = {
      en: ['Su','Mo','Tu','We','Th','Fr','Sa'],
      ar: ['\u0623\u062d','\u0627\u062b','\u062b\u0644','\u0623\u0631','\u062e\u0645','\u062c\u0645','\u0633\u0628']
    };
    const lang = I18N.currentLang;
    const mNames = monthNames[lang] || monthNames.en;
    const dNames = dayNames[lang] || dayNames.en;

    // Build calendar grid
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayKey = Journal._todayKey();

    let calendarHTML = '<div class="cal-header-row">';
    dNames.forEach(d => { calendarHTML += `<span class="cal-day-name">${d}</span>`; });
    calendarHTML += '</div><div class="cal-grid">';

    for (let i = 0; i < firstDay; i++) {
      calendarHTML += '<span class="cal-day empty"></span>';
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasReading = readingDates[dateKey];
      const isToday = dateKey === todayKey;
      const classes = ['cal-day'];
      if (hasReading) classes.push('has-reading');
      if (isToday) classes.push('today');

      calendarHTML += `<span class="${classes.join(' ')}" data-action="show-day-readings" data-date="${dateKey}">
        ${I18N.toAr(d)}
        ${hasReading ? `<span class="cal-dot">${hasReading > 1 ? I18N.toAr(hasReading) : ''}</span>` : ''}
      </span>`;
    }
    calendarHTML += '</div>';

    // Selected day readings
    const selectedKey = this._selectedDateKey || todayKey;
    const dayEntries = Journal.getByDate(selectedKey);
    let entriesHTML = '';

    if (dayEntries.length > 0) {
      const dateDisplay = new Date(selectedKey + 'T12:00:00').toLocaleDateString('ar-SA', { weekday: 'long', month: 'long', day: 'numeric' });
      entriesHTML = `<h3 class="day-title">${dateDisplay}</h3>`;
      dayEntries.forEach(entry => {
        const cardChips = entry.cards.map(c =>
          `<span class="journal-card-chip ${c.isReversed ? 'reversed' : ''}">${c.cardName}</span>`
        ).join('');
        entriesHTML += `
          <div class="journal-entry">
            <div class="journal-entry-header">
              <span class="journal-spread-name">${I18N.t(entry.spreadName)}</span>
              ${entry.readingFor ? `<span class="journal-for">${I18N.t('readingFor')} ${entry.readingFor}</span>` : ''}
              <button class="journal-delete" data-action="delete-reading" data-entry-id="${entry.id}">&times;</button>
            </div>
            <div class="journal-cards">${cardChips}</div>
            ${entry.summary ? `<p class="journal-summary">${I18N.toAr(entry.summary.substring(0, 200))}${entry.summary.length > 200 ? '...' : ''}</p>` : ''}
          </div>`;
      });
    } else {
      entriesHTML = `<p class="no-entries">${I18N.t('noReadings')}</p>`;
    }

    container.innerHTML = `
      <header class="journal-header">
        <button class="back-btn" data-action="back-home">${I18N.t('back')}</button>
        <h2 data-i18n="journal">${I18N.t('journal')}</h2>
      </header>

      <div class="calendar-container">
        <div class="cal-nav">
          <button class="cal-nav-btn" data-action="cal-prev">&#9664;</button>
          <span class="cal-month-year">${mNames[month]} ${I18N.toAr(year)}</span>
          <button class="cal-nav-btn" data-action="cal-next">&#9654;</button>
        </div>
        ${calendarHTML}
      </div>

      <div class="day-readings" id="day-readings">
        ${entriesHTML}
      </div>
    `;

    this.showScreen('screen-journal');
  },

  // ── 14c. Show Mirror (Analytics) ────────────────────────────
  showMirror() {
    const container = document.getElementById('journal-container');
    if (!container) return;

    const analytics = Journal.getAnalytics();

    if (!analytics) {
      container.innerHTML = `
        <header class="journal-header">
          <button class="back-btn" data-action="back-home">${I18N.t('back')}</button>
          <h2 data-i18n="mirror">${I18N.t('mirror')}</h2>
        </header>
        <p class="no-entries">${I18N.t('noReadings')}</p>
      `;
      this.showScreen('screen-journal');
      return;
    }

    // Top cards
    const topCardsHTML = analytics.topCards.map((c, i) => `
      <div class="mirror-row">
        <span class="mirror-rank">${I18N.toAr(i + 1)}</span>
        <span class="mirror-name">${c.name}</span>
        <div class="mirror-bar-bg"><div class="mirror-bar-fill" style="width:${c.pct}%"></div></div>
        <span class="mirror-count">${I18N.toAr(c.count)}</span>
      </div>
    `).join('');

    // Element bars
    const elementEmoji = { fire: '🔥', water: '💧', air: '💨', earth: '🌍' };
    const elementHTML = analytics.elementStats.map(e => `
      <div class="mirror-row">
        <span class="mirror-emoji">${elementEmoji[e.element] || ''}</span>
        <span class="mirror-name">${I18N.t(e.element)}</span>
        <div class="mirror-bar-bg"><div class="mirror-bar-fill element-${e.element}" style="width:${e.pct}%"></div></div>
        <span class="mirror-count">${I18N.toAr(e.pct)}%</span>
      </div>
    `).join('');

    // Suit bars
    const suitEmoji = { major: '⭐', wands: '🔥', cups: '💧', swords: '💨', pentacles: '🌍' };
    const suitHTML = analytics.suitStats.map(s => `
      <div class="mirror-row">
        <span class="mirror-emoji">${suitEmoji[s.suit] || ''}</span>
        <span class="mirror-name">${s.suit === 'major' ? I18N.t('major') : I18N.t(s.suit) || s.suit}</span>
        <div class="mirror-bar-bg"><div class="mirror-bar-fill" style="width:${s.pct}%"></div></div>
        <span class="mirror-count">${I18N.toAr(s.pct)}%</span>
      </div>
    `).join('');

    // Spread stats
    const spreadHTML = analytics.spreadStats.map(s => `
      <div class="mirror-row">
        <span class="mirror-name">${I18N.t(s.id + 'Name') || s.id}</span>
        <span class="mirror-count">${I18N.toAr(s.count)}x</span>
      </div>
    `).join('');

    container.innerHTML = `
      <header class="journal-header">
        <button class="back-btn" data-action="back-home">${I18N.t('back')}</button>
        <h2 data-i18n="mirror">${I18N.t('mirror')}</h2>
      </header>

      <div class="mirror-stats-row">
        <div class="mirror-stat-card">
          <span class="stat-number">${I18N.toAr(analytics.totalReadings)}</span>
          <span class="stat-label">${I18N.t('totalReadings')}</span>
        </div>
        <div class="mirror-stat-card">
          <span class="stat-number">${I18N.toAr(analytics.streak)}</span>
          <span class="stat-label">${I18N.t('currentStreak')}</span>
        </div>
        <div class="mirror-stat-card">
          <span class="stat-number">${I18N.toAr(analytics.uprightPct)}%</span>
          <span class="stat-label">${I18N.t('upright')}</span>
        </div>
      </div>

      <div class="mirror-section">
        <h3>${I18N.t('topCards')}</h3>
        ${topCardsHTML}
      </div>

      <div class="mirror-section">
        <h3>${I18N.t('elementBalance')}</h3>
        ${elementHTML}
        ${this._buildElementalPattern(analytics)}
      </div>

      <div class="mirror-section">
        <h3>${I18N.t('uprightReversed')}</h3>
        <div class="upright-reversed-bar">
          <div class="ur-upright" style="width:${analytics.uprightPct}%">
            <span>${I18N.t('upright')} ${I18N.toAr(analytics.uprightPct)}%</span>
          </div>
          <div class="ur-reversed" style="width:${analytics.reversedPct}%">
            <span>${I18N.t('reversed')} ${I18N.toAr(analytics.reversedPct)}%</span>
          </div>
        </div>
      </div>

      <div class="mirror-section">
        <h3>${I18N.t('suitBreakdown')}</h3>
        ${suitHTML}
      </div>

      <div class="mirror-section">
        <h3>${I18N.t('favoriteSpread')}</h3>
        ${spreadHTML}
      </div>
    `;

    this.showScreen('screen-journal');
  },

  // ── Elemental Pattern (neutral pattern-reading) ──────────────
  _ELEM_MIN_READINGS: 10,
  _ELEM_PROMINENT_PCT: 40,
  _ELEM_SCARCE_PCT: 10,

  _buildElementalPattern(analytics) {
    if (!analytics || !Array.isArray(analytics.elementStats)) return '';
    if (analytics.totalReadings < this._ELEM_MIN_READINGS) {
      return `<p class="ep-placeholder">${I18N.t('elementPatternPlaceholder')}</p>`;
    }
    const stats = analytics.elementStats;
    const top = stats[0];
    const bottom = stats[stats.length - 1];
    const blocks = [];
    if (top && top.pct >= this._ELEM_PROMINENT_PCT) {
      blocks.push(this._epBlock(top.element, 'prominent'));
    }
    if (bottom && bottom.pct <= this._ELEM_SCARCE_PCT &&
        (!top || bottom.element !== top.element)) {
      blocks.push(this._epBlock(bottom.element, 'scarce'));
    }
    if (blocks.length === 0) return '';
    return `<div class="elemental-pattern">${blocks.join('')}</div>`;
  },

  _epBlock(element, state) {
    const emoji = { fire: '🔥', water: '💧', air: '💨', earth: '🌍' }[element] || '';
    const cap = element.charAt(0).toUpperCase() + element.slice(1);
    const key = 'ep' + cap + (state === 'prominent' ? 'Prominent' : 'Scarce');
    const stateLabel = I18N.t(state === 'prominent' ? 'epProminentLabel' : 'epScarceLabel');
    return `
      <div class="ep-block ep-${state}">
        <div class="ep-head">
          <span class="ep-emoji">${emoji}</span>
          <span class="ep-elname">${I18N.t(element)}</span>
          <span class="ep-state">${stateLabel}</span>
        </div>
        <p class="ep-text">${I18N.t(key)}</p>
      </div>`;
  },

  // ── 14d. Show Glossary ───────────────────────────────────────
  showGlossary() {
    const container = document.getElementById('glossary-container');
    if (!container) return;

    const lang = I18N.currentLang;
    const filter = this._glossaryFilter || 'all';

    // Build filtered card list
    let cards = [...MAJOR_ARCANA, ...SUIT_WANDS, ...SUIT_SWORDS, ...SUIT_CUPS, ...SUIT_PENTACLES];
    if (filter === 'major') cards = [...MAJOR_ARCANA];
    else if (filter === 'wands') cards = [...SUIT_WANDS];
    else if (filter === 'cups') cards = [...SUIT_CUPS];
    else if (filter === 'swords') cards = [...SUIT_SWORDS];
    else if (filter === 'pentacles') cards = [...SUIT_PENTACLES];

    const filters = [
      { id: 'all', label: I18N.t('allCards') },
      { id: 'major', label: I18N.t('majorArcana') },
      { id: 'wands', label: I18N.t('wands') },
      { id: 'swords', label: I18N.t('swords') },
      { id: 'cups', label: I18N.t('cups') },
      { id: 'pentacles', label: I18N.t('pentacles') }
    ];

    const filterHTML = filters.map(f =>
      `<button class="glossary-filter-btn ${filter === f.id ? 'active' : ''}" data-action="glossary-filter" data-filter="${f.id}">${f.label}</button>`
    ).join('');

    const cardsHTML = cards.map(card => {
      const name = card.name[lang] || card.name.en;
      const kw = (card.keywords[lang] || card.keywords.en).slice(0, 3).join(', ');
      return `
        <div class="glossary-card-item" data-action="glossary-card" data-card-id="${card.id}">
          <div class="glossary-card-img">
            <img src="${card.image}" alt="${name}" loading="lazy"/>
          </div>
          <div class="glossary-card-info">
            <span class="glossary-card-name">${name}</span>
            <span class="glossary-card-kw">${kw}</span>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = `
      <header class="journal-header">
        <button class="back-btn" data-action="back-home">${I18N.t('back')}</button>
        <h2>${I18N.t('glossaryTitle')}</h2>
      </header>
      <p class="num-subtitle">${I18N.t('glossarySubtitle')}</p>

      <div class="glossary-filters">
        ${filterHTML}
      </div>

      <div class="glossary-grid">
        ${cardsHTML}
      </div>
    `;

    this.showScreen('screen-glossary');
  },

  // ── 14e. Show single glossary card detail ───────────────────
  showGlossaryCard(cardId) {
    const container = document.getElementById('glossary-container');
    if (!container) return;

    const lang = I18N.currentLang;
    const allCards = [...MAJOR_ARCANA, ...SUIT_WANDS, ...SUIT_SWORDS, ...SUIT_CUPS, ...SUIT_PENTACLES];
    const currentIndex = allCards.findIndex(c => c.id === cardId);
    const card = allCards[currentIndex];
    if (!card) return;

    // Prev/Next card IDs for navigation
    const prevCard = currentIndex > 0 ? allCards[currentIndex - 1] : null;
    const nextCard = currentIndex < allCards.length - 1 ? allCards[currentIndex + 1] : null;

    const name = card.name[lang] || card.name.en;
    const keywords = (card.keywords[lang] || card.keywords.en);
    const uprightText = card.upright[lang] || card.upright.en;
    const reversedText = card.reversed[lang] || card.reversed.en;
    const element = card.element ? I18N.t(card.element) : '';
    const planet = card.planet ? I18N.t(card.planet) : '';
    const numeral = card.numeral ? I18N.toAr(card.number) : '';
    let metaHTML = '';
    if (element) metaHTML += `<span class="gcard-meta-item">${element}</span>`;
    if (planet) metaHTML += `<span class="gcard-meta-item">${planet}</span>`;
    if (numeral) metaHTML += `<span class="gcard-meta-item">${numeral}</span>`;

    const keywordTags = keywords.map(kw => `<span class="keyword-tag">${kw}</span>`).join('');

    container.innerHTML = `
      <header class="journal-header">
        <button class="back-btn" data-action="glossary-back-list">${I18N.t('back')}</button>
      </header>

      <div class="gcard-detail">
        <h2 class="gcard-name">${name}</h2>
        <div class="gcard-image-row">
          ${prevCard ? `<button class="gcard-nav-arrow gcard-nav-prev" data-action="glossary-card" data-card-id="${prevCard.id}" title="${prevCard.name[lang] || prevCard.name.en}">&#8592;</button>` : '<span class="gcard-nav-arrow-spacer"></span>'}
          <div class="gcard-image-wrap">
            <img src="${card.image}" alt="${name}" class="gcard-image"/>
          </div>
          ${nextCard ? `<button class="gcard-nav-arrow gcard-nav-next" data-action="glossary-card" data-card-id="${nextCard.id}" title="${nextCard.name[lang] || nextCard.name.en}">&#8594;</button>` : '<span class="gcard-nav-arrow-spacer"></span>'}
        </div>

        ${metaHTML ? `<div class="gcard-meta">${metaHTML}</div>` : ''}

        <div class="gcard-keywords">${keywordTags}</div>

        <div class="gcard-meaning-section">
          <h3 class="gcard-meaning-title upright-title">${I18N.t('uprightMeaning')}</h3>
          <p class="gcard-meaning-text">${uprightText}</p>
        </div>

        <div class="gcard-meaning-section">
          <h3 class="gcard-meaning-title reversed-title">${I18N.t('reversedMeaning')}</h3>
          <p class="gcard-meaning-text">${reversedText}</p>
        </div>
      </div>
    `;

    // Scroll to top when navigating between cards
    container.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ── 14f. Show Numerology Reading ────────────────────────────
  showNumerology() {
    const container = document.getElementById('numerology-container');
    if (!container) return;

    if (!this.profile || !this.profile.dob) {
      container.innerHTML = `
        <header class="journal-header">
          <button class="back-btn" data-action="back-home">${I18N.t('back')}</button>
          <h2>${I18N.t('numerologyReading')}</h2>
        </header>
        <p class="no-entries">${I18N.t('noReadings')}</p>
      `;
      this.showScreen('screen-numerology');
      return;
    }

    const lang = I18N.currentLang;
    const today = new Date();

    // Determine who we're reading for (self or saved person)
    const numPersonId = this._numPersonId || null;
    const people = (this.profile.people) || [];
    let readingDob, fullName, readingName;

    if (numPersonId) {
      const person = people.find(p => p.id === numPersonId);
      if (person) {
        readingDob = person.dob;
        fullName = person.name;
        readingName = person.name;
      } else {
        this._numPersonId = null;
      }
    }
    if (!readingDob) {
      readingDob = this.profile.dob;
      fullName = this.profile.fullName;
      readingName = null; // self
    }

    const { year, month, day } = readingDob;
    const numProfile = Numerology.getProfile(year, month, day, today, fullName);

    // Helper to build a number card (full meaning with theme/energy/advice/shadow)
    const numCard = (number, titleKey, descKey, meaning, accent = 'purple') => {
      // meaning can be an object {theme, energy, advice, shadow} or a string
      if (typeof meaning === 'string' || (meaning && !meaning.theme)) {
        const text = (typeof meaning === 'string') ? meaning : (meaning?.[lang] || meaning?.en || '');
        return `
          <div class="num-card num-accent-${accent}">
            <div class="num-card-header">
              <span class="num-card-number">${I18N.toAr(number)}</span>
              <div class="num-card-title">
                <h4>${I18N.t(titleKey)}</h4>
                <p class="num-card-desc">${I18N.t(descKey)}</p>
              </div>
            </div>
            <div class="num-card-body">
              <p class="num-advice">${text}</p>
            </div>
          </div>`;
      }
      const theme = meaning?.theme?.[lang] || meaning?.theme?.en || '';
      const energy = meaning?.energy?.[lang] || meaning?.energy?.en || '';
      const advice = meaning?.advice?.[lang] || meaning?.advice?.en || '';
      const shadow = meaning?.shadow?.[lang] || meaning?.shadow?.en || '';
      return `
        <div class="num-card num-accent-${accent}">
          <div class="num-card-header">
            <span class="num-card-number">${I18N.toAr(number)}</span>
            <div class="num-card-title">
              <h4>${I18N.t(titleKey)}</h4>
              <p class="num-card-desc">${I18N.t(descKey)}</p>
            </div>
          </div>
          <div class="num-card-body">
            <span class="num-theme">${theme}</span>
            ${energy ? `<p class="num-energy">${energy}</p>` : ''}
            ${advice ? `<p class="num-advice">${advice}</p>` : ''}
            ${shadow ? `<p class="num-shadow"><span class="shadow-label">${{ar:'انتبه:',en:'Watch for:'}[lang]||'انتبه:'}</span> ${shadow}</p>` : ''}
          </div>
        </div>`;
    };

    // Helper for name-based number card with custom meaning text
    const nameNumCard = (number, titleKey, descKey, meaningText, accent = 'gold') => {
      return `
        <div class="num-card num-accent-${accent}">
          <div class="num-card-header">
            <span class="num-card-number">${I18N.toAr(number)}</span>
            <div class="num-card-title">
              <h4>${I18N.t(titleKey)}</h4>
              <p class="num-card-desc">${I18N.t(descKey)}</p>
            </div>
          </div>
          <div class="num-card-body">
            <span class="num-theme">${meaningText}</span>
          </div>
        </div>`;
    };

    // Core numbers section
    let coreHTML = '';
    coreHTML += numCard(numProfile.lifePath, 'lifePathNumber', 'lifePathDesc', numProfile.lifePathMeaning, 'gold');

    // Name-based numbers
    let nameHTML = '';
    if (fullName && numProfile.expression) {
      const exprText = (typeof numProfile.expressionMeaning === 'string') ? numProfile.expressionMeaning : (numProfile.expressionMeaning?.[lang] || numProfile.expressionMeaning?.en || '');
      const soulText = (typeof numProfile.soulUrgeMeaning === 'string') ? numProfile.soulUrgeMeaning : (numProfile.soulUrgeMeaning?.[lang] || numProfile.soulUrgeMeaning?.en || '');
      const persText = (typeof numProfile.personalityMeaning === 'string') ? numProfile.personalityMeaning : (numProfile.personalityMeaning?.[lang] || numProfile.personalityMeaning?.en || '');

      nameHTML += nameNumCard(numProfile.expression, 'expressionNumber', 'expressionDesc', exprText, 'gold');
      nameHTML += nameNumCard(numProfile.soulUrge, 'soulUrgeNumber', 'soulUrgeDesc', soulText, 'purple');
      nameHTML += nameNumCard(numProfile.personality, 'personalityNumber', 'personalityDesc', persText, 'purple');
    } else {
      nameHTML = `
        <div class="num-name-prompt">
          <p class="num-name-prompt-text">${I18N.t('enterNameForNumerology')}</p>
          <div class="num-name-form">
            <input type="text" id="num-name-input" class="mystic-input" placeholder="${I18N.t('fullNamePlaceholder')}" maxlength="60" autocomplete="name" />
            <button class="btn-add-friend" data-action="save-name-numerology">&#10022; ${I18N.t('saveName')}</button>
          </div>
        </div>`;
    }

    // Today's numbers section
    let todayHTML = '';
    todayHTML += numCard(numProfile.personalDay, 'personalDay', 'personalDayDesc', numProfile.personalDayMeaning, 'teal');
    todayHTML += numCard(numProfile.personalMonth, 'personalMonth', 'personalMonthDesc', numProfile.personalMonthMeaning, 'teal');
    todayHTML += numCard(numProfile.personalYear, 'personalYear', 'personalYearDesc', numProfile.personalYearMeaning, 'purple');
    todayHTML += numCard(numProfile.universalDay, 'universalDay', 'universalDayDesc', numProfile.universalDayMeaning, 'gold');

    // Person-picker chips (only show if there are saved people)
    let personPickerHTML = '';
    if (people.length > 0) {
      personPickerHTML = `
      <div class="num-person-picker">
        <div class="others-chips">
          <button class="person-chip ${!numPersonId ? 'active' : ''}" data-action="num-select-person" data-person-id="">
            <span class="chip-icon">&#9733;</span>
            <span class="chip-name">${I18N.t('readingForSelf')}</span>
          </button>
          ${people.map(p => {
            const mn = Celestial.getBirthMansion(p.dob.year || new Date().getFullYear(), p.dob.month, p.dob.day);
            return `<button class="person-chip ${numPersonId === p.id ? 'active' : ''}" data-action="num-select-person" data-person-id="${p.id}">
              <span class="chip-icon">${mn.emoji}</span>
              <span class="chip-name">${p.name}</span>
            </button>`;
          }).join('')}
        </div>
      </div>`;
    }

    container.innerHTML = `
      <header class="journal-header">
        <button class="back-btn" data-action="back-home">${I18N.t('back')}</button>
        <h2>${I18N.t('numerologyTitle')}</h2>
      </header>
      <p class="num-subtitle">${readingName ? I18N.t('numerologyFor') + ' ' + readingName : I18N.t('numerologySubtitle')}</p>
      ${personPickerHTML}

      <div class="num-section">
        <h3 class="num-section-title">${I18N.t('coreNumbers')}</h3>
        ${coreHTML}
      </div>

      <div class="num-section num-section-name">
        <h3 class="num-section-title">${I18N.t('nameNumbersTitle')}</h3>
        <p class="num-section-intro">${I18N.t('nameNumbersIntro')}</p>
        ${nameHTML}
      </div>

      <div class="num-section">
        <h3 class="num-section-title">${I18N.t('todayNumbers')}</h3>
        ${todayHTML}
      </div>
    `;

    this.showScreen('screen-numerology');
  },


  // ── 15. Save Profile ─────────────────────────────────────────
  saveProfile() {
    if (this.profile) {
      localStorage.setItem('tarot_profile', JSON.stringify(this.profile));
    }
  },

  // ── 16. Load Profile ─────────────────────────────────────────
  loadProfile() {
    try {
      const data = localStorage.getItem('tarot_profile');
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load profile:', e);
    }
    return null;
  },

  // ── 17. Reset Profile ────────────────────────────────────────
  resetProfile() {
    localStorage.removeItem('tarot_profile');
    localStorage.removeItem('tarot_language');
    this.profile = null;
    // Stay in Arabic
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
    this.initOnboarding();
    this.updateUILanguage();
    this.showScreen('screen-onboarding');
  },

  // ── 18. Create Particles ─────────────────────────────────────
  createParticles() {
    const container = document.querySelector('.particles-container') || document.body;

    // Clear existing interval
    if (this.particleInterval) {
      clearInterval(this.particleInterval);
    }

    const spawnParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';

      // Random position and properties
      const x = Math.random() * 100;
      const duration = 8 + Math.random() * 12;
      const size = 2 + Math.random() * 4;
      const delay = Math.random() * 2;

      particle.style.cssText = `
        left: ${x}%;
        width: ${size}px;
        height: ${size}px;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
      `;

      container.appendChild(particle);

      // Remove particle after animation completes
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, (duration + delay) * 1000);
    };

    // Spawn particles periodically
    this.particleInterval = setInterval(spawnParticle, 1500);

    // Create a few immediately
    for (let i = 0; i < 8; i++) {
      setTimeout(spawnParticle, i * 200);
    }
  },

  _createScreen(id) {
    let screen = document.getElementById(id);
    if (!screen) {
      screen = document.createElement('div');
      screen.id = id;
      screen.className = 'screen';
      document.body.appendChild(screen);
    }
    return screen;
  },

  _setupEventDelegation() {
    document.body.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.getAttribute('data-action');

      switch (action) {
        case 'start-reading': {
          const spreadId = target.getAttribute('data-spread-id');
          if (spreadId) this.startReading(spreadId);
          break;
        }

        case 'reveal-card': {
          const index = parseInt(target.getAttribute('data-card-index'), 10);
          if (!isNaN(index) && this.currentReading && this.currentReading.cards[index]) {
            this.revealCard(index, this.currentReading.cards[index]);
          }
          break;
        }

        case 'back-home': {
                this.currentReading = null;
          this.currentInterpretation = null;
          this.showHome();
          this.showScreen('screen-home');
          break;
        }

        case 'show-settings': {
          this.showSettings();
          break;
        }

        case 'show-glossary': {
          this._glossaryFilter = 'all';
          this.showGlossary();
          break;
        }

        case 'glossary-filter': {
          const filter = target.getAttribute('data-filter');
          if (filter) {
            this._glossaryFilter = filter;
            this.showGlossary();
          }
          break;
        }

        case 'glossary-card': {
          const cardId = target.closest('[data-card-id]')?.getAttribute('data-card-id');
          if (cardId) this.showGlossaryCard(cardId);
          break;
        }

        case 'glossary-back-list': {
          this.showGlossary();
          break;
        }

        case 'show-numerology': {
          this.showNumerology();
          break;
        }

        case 'num-select-person': {
          const pid = target.closest('[data-person-id]')?.getAttribute('data-person-id');
          if (pid !== undefined) {
            this._numPersonId = pid || null;
            this.showNumerology();
          }
          break;
        }

        case 'save-name-numerology': {
          const nameEl = document.getElementById('num-name-input');
          if (nameEl && nameEl.value.trim()) {
            if (this._numPersonId) {
              // Save name for the selected person
              const person = this.profile.people?.find(p => p.id === this._numPersonId);
              if (person) person.name = nameEl.value.trim();
            } else {
              this.profile.fullName = nameEl.value.trim();
            }
            this.saveProfile();
            this.showNumerology();
          }
          break;
        }

        case 'show-journal': {
          this._selectedDateKey = Journal._todayKey();
          this.showJournal();
          break;
        }

        case 'show-mirror': {
          this.showMirror();
          break;
        }

        case 'share-reading': {
          if (this.currentReading && this.currentInterpretation) {
            Social.shareReading(this.currentReading, this.currentInterpretation);
          }
          break;
        }

        case 'cal-prev': {
          const d = this._journalViewDate || new Date();
          d.setMonth(d.getMonth() - 1);
          this.showJournal(d);
          break;
        }

        case 'cal-next': {
          const d = this._journalViewDate || new Date();
          d.setMonth(d.getMonth() + 1);
          this.showJournal(d);
          break;
        }

        case 'show-day-readings': {
          const dateKey = target.getAttribute('data-date');
          if (dateKey) {
            this._selectedDateKey = dateKey;
            this.showJournal(this._journalViewDate);
          }
          break;
        }

        case 'delete-reading': {
          const entryId = target.getAttribute('data-entry-id');
          if (entryId && confirm(I18N.t('confirmDelete'))) {
            Journal.deleteEntry(entryId);
            this.showJournal(this._journalViewDate);
          }
          break;
        }

        case 'select-person': {
          const personId = target.closest('[data-person-id]')?.getAttribute('data-person-id');
          if (personId !== undefined) {
            this.readingForId = personId || null;
            this.renderOthersPanel();
          }
          break;
        }

        case 'show-add-person': {
          const form = document.getElementById('add-person-form');
          if (form) {
            form.classList.toggle('hidden');
            if (!form.classList.contains('hidden')) {
              const nameInput = document.getElementById('new-person-name');
              if (nameInput) nameInput.focus();
              // Initialize the add-person DOB roller
              this._initDobRoller(null, 'ap-roller');
            }
          }
          break;
        }

        case 'save-person': {
          const nameEl = document.getElementById('new-person-name');
          const dobEl = document.getElementById('ap-roller-dob-input');
          if (nameEl && dobEl && nameEl.value.trim() && dobEl.value) {
            const [y, m, d] = dobEl.value.split('-').map(Number);
            if (!this.profile.people) this.profile.people = [];
            this.profile.people.push({
              id: Date.now().toString(36),
              name: nameEl.value.trim(),
              dob: { year: y, month: m, day: d }
            });
            this.saveProfile();
            this.renderOthersPanel();
          }
          break;
        }

        case 'remove-person': {
          const removeId = target.closest('[data-person-id]')?.getAttribute('data-person-id');
          if (removeId && this.profile && this.profile.people) {
            this.profile.people = this.profile.people.filter(p => p.id !== removeId);
            if (this.readingForId === removeId) this.readingForId = null;
            this.saveProfile();
            this.renderOthersPanel();
          }
          break;
        }

        case 'toggle-reversals': {
          if (this.profile) {
            this.profile.reversals = !(this.profile.reversals !== false);
            this.saveProfile();

            // Update toggle display
            target.classList.toggle('on', this.profile.reversals);
            target.classList.toggle('off', !this.profile.reversals);
            target.textContent = this.profile.reversals
              ? I18N.t('reversalsOn')
              : I18N.t('reversalsOff');
          }
          break;
        }

        case 'toggle-oracle': {
          if (this.profile) {
            this.profile.showOracle = !(this.profile.showOracle !== false);
            this.saveProfile();

            target.classList.toggle('on', this.profile.showOracle);
            target.classList.toggle('off', !this.profile.showOracle);
            target.textContent = this.profile.showOracle
              ? I18N.t('showOracleOn')
              : I18N.t('showOracleOff');
          }
          break;
        }

        case 'set-gender': {
          const g = target.getAttribute('data-gender');
          if (g && this.profile) {
            this.profile.gender = g;
            this.saveProfile();

            const genderGroup = target.closest('.speed-buttons');
            if (genderGroup) {
              genderGroup.querySelectorAll('.speed-btn').forEach((btn) => {
                btn.classList.toggle('active', btn.getAttribute('data-gender') === g);
              });
            }
          }
          break;
        }

        case 'reset-profile': {
          const confirmed = confirm(I18N.t('resetConfirm'));
          if (confirmed) {
            this.resetProfile();
          }
          break;
        }

        case 'new-reading': {
                this.currentReading = null;
          this.currentInterpretation = null;
          this.showHome();
          this.showScreen('screen-home');
          break;
        }

        default:
          break;
      }
    });

    // Handle onboarding begin button and language selection via delegation
    document.body.addEventListener('click', (e) => {
      // Begin journey button
      if (e.target.id === 'begin-journey-btn' || e.target.closest('#begin-journey-btn')) {
        const dobInput = document.getElementById('dob-input');
        if (!dobInput || !dobInput.value) return;

        const parts = dobInput.value.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);

        if (isNaN(year) || isNaN(month) || isNaN(day)) return;

        const mansion = Celestial.getBirthMansion(year, month, day);
        const lifePath = Numerology.getLifePath(year, month, day);

        const nameInput = document.getElementById('name-input');
        const fullName = nameInput ? nameInput.value.trim() : '';

        const genderActive = document.querySelector('.gender-btn.active');
        const gender = genderActive ? genderActive.getAttribute('data-gender') : 'male';

        this.profile = {
          fullName: fullName || null,
          dob: { year, month, day },
          zodiac: mansion,
          lifePath: lifePath,
          gender: gender,
          language: I18N.currentLang,
          reversals: true
        };

        this.saveProfile();
        this.showHome();
        this.showScreen('screen-home');
      }

    });
  },

  // ── Utility: Escape HTML Attribute ───────────────────────────
  _escapeAttr(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
};

// ── Bootstrap ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
