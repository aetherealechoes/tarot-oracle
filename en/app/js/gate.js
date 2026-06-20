// ============================================================
// gate.js — 7-day free trial + one-time license unlock
//
// No card at signup. Trial is time-based (localStorage). When it
// ends, a gentle paywall invites a one-time purchase; an activation
// key (sent after payment) unlocks lifetime access.
//
// Keys are verified OFFLINE with a public key — no server call — so
// once a key checks out, the app trusts it forever and never
// re-prompts. Keys can be minted from any channel (website, Gumroad,
// by hand) and all verify identically. Shared across /en/ and /ar/.
// ============================================================
(function () {
  'use strict';

  const GATE_ENABLED = false;   // DISABLED: test first
  const PREFIX     = 'TAROT';
  const BUY_URL    = 'https://etherealjournals.gumroad.com/l/tarot-oracle';
  const GUMROAD_PRODUCT_ID = 'GxrcWsPbDrTSdDFwP_8Bow==';
  const TRIAL_DAYS = 7;

  // Public verification key (safe to ship). The matching PRIVATE key
  // lives only in your offline key-generator tool.
  const PUBLIC_JWK = { kty:'EC', crv:'P-256',
    x:'NSCgc3843sg8R99uym4FH-YMzfEcZ-JHqVGv4igJcWg',
    y:'3VtWqELlanqVqbrE_qEAvKP3cxiZwfqcIsJC0zLNH-A' };
  const MSG = new TextEncoder().encode('TAROT-ORACLE-LIFETIME');

  // localStorage keys
  const K_LIC     = 'tarot_lic';        // the activated key string (for reference)
  const K_ACTIVE  = 'tarot_activated';  // '1' once a valid key has been accepted — trusted forever
  const K_LEGACY  = 'tarot_legacy';     // grandfathered (existing user/tester)
  const K_TRIAL   = 'tarot_trial_start';
  const K_INIT    = 'tarot_gate_init';
  const K_EMAIL   = 'tarot_trial_email'; // captured trial email
  const DAY_MS    = 86400000;
  // Trial sign-up emails are sent here via Formsubmit (no account; confirm once on first signup).
  const EMAIL_TO  = 'abadayy13@gmail.com';

  const t = (key, fallback) => {
    if (window.I18N && typeof I18N.t === 'function') {
      const v = I18N.t(key);
      if (v && v !== key) return v;
    }
    return fallback;
  };

  // ── First run: grandfather existing users. (Trial starts only after email capture.) ──
  function initState() {
    if (localStorage.getItem(K_INIT)) return;
    const existing = localStorage.getItem('tarot_profile') || localStorage.getItem('tarot_journal');
    if (existing) localStorage.setItem(K_LEGACY, '1');
    localStorage.setItem(K_INIT, '1');
  }

  const isActivated = () => localStorage.getItem(K_ACTIVE) === '1';
  const isLegacy    = () => localStorage.getItem(K_LEGACY) === '1';
  function trialMsLeft() {
    const s = parseInt(localStorage.getItem(K_TRIAL), 10);
    return s ? (s + TRIAL_DAYS * DAY_MS) - Date.now() : 0;
  }
  const trialActive   = () => trialMsLeft() > 0;
  const trialDaysLeft = () => Math.max(1, Math.ceil(trialMsLeft() / DAY_MS));

  // ── Offline key verification (no network) ──
  function b64urlToBytes(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  let _pubKey = null;
  async function publicKey() {
    if (!_pubKey) {
      _pubKey = await crypto.subtle.importKey('jwk', PUBLIC_JWK,
        { name:'ECDSA', namedCurve:'P-256' }, false, ['verify']);
    }
    return _pubKey;
  }
  async function verifyKey(raw) {
    const clean = (raw || '').trim().replace(/\s+/g, '');
    if (/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{8}-[0-9A-Fa-f]{8}-[0-9A-Fa-f]{8}$/.test(clean)) {
      try {
        const r = await fetch('https://api.gumroad.com/v2/licenses/verify', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'product_id=' + encodeURIComponent(GUMROAD_PRODUCT_ID) + '&license_key=' + encodeURIComponent(clean) + '&increment_uses_count=true' });
        const d = await r.json();
        return !!(d && d.success);
      } catch (e) { return false; }
    }
    if (!clean.startsWith(PREFIX + '-')) return false;
    let sig;
    try { sig = b64urlToBytes(clean.slice(PREFIX.length + 1)); } catch (e) { return false; }
    if (sig.length !== 64) return false; // P-256 raw signature is exactly 64 bytes
    try {
      return await crypto.subtle.verify({ name:'ECDSA', hash:'SHA-256' }, await publicKey(), sig, MSG);
    } catch (e) { return false; }
  }

  // ── Styling (self-contained, uses the app's CSS variables) ──
  function injectStyle() {
    if (document.getElementById('tarot-gate-style')) return;
    const s = document.createElement('style');
    s.id = 'tarot-gate-style';
    s.textContent = `
      .tarot-gate-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;
        justify-content:center;padding:1.2rem;background:rgba(5,4,10,.82);backdrop-filter:blur(5px);
        animation:tgFade .4s ease;}
      @keyframes tgFade{from{opacity:0}to{opacity:1}}
      .tarot-gate-card{position:relative;width:360px;max-width:92vw;max-height:92vh;overflow-y:auto;
        text-align:center;padding:2rem 1.6rem 1.8rem;border-radius:16px;
        background:var(--bg-surface,#16132a);border:1px solid rgba(201,168,76,.35);
        box-shadow:0 24px 70px rgba(0,0,0,.65);font-family:'Cormorant Garamond','Amiri',serif;}
      .tarot-gate-moon{font-size:2.2rem;margin-bottom:.4rem;filter:drop-shadow(0 0 14px rgba(201,168,76,.5));}
      .tarot-gate-title{font-family:'Cinzel','Amiri',serif;color:var(--gold-bright,#e8c547);
        font-size:1.4rem;letter-spacing:.03em;margin:0 0 .7rem;}
      .tarot-gate-sub{color:var(--text-light,#c4b69c);font-size:1.02rem;line-height:1.6;margin:0 0 1.4rem;}
      .tarot-gate-buy{display:block;width:100%;padding:.95rem 1rem;margin:0 0 1.4rem;border-radius:12px;
        text-decoration:none;font-family:'Cinzel','Amiri',serif;font-size:1.02rem;letter-spacing:.03em;
        color:#1a1228;background:linear-gradient(135deg,#e8c547,#c9a84c);
        box-shadow:0 6px 22px rgba(201,168,76,.3);transition:transform .25s ease,box-shadow .25s ease;}
      .tarot-gate-buy:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(201,168,76,.45);}
      .tarot-gate-keywrap{border-top:1px solid rgba(201,168,76,.18);padding-top:1.1rem;}
      .tarot-gate-keylabel{color:var(--text-muted,#8a7e6a);font-size:.86rem;letter-spacing:.04em;margin-bottom:.55rem;}
      .tarot-gate-input{width:100%;box-sizing:border-box;padding:.7rem .8rem;border-radius:10px;
        border:1px solid rgba(201,168,76,.35);background:rgba(10,10,18,.5);color:var(--text-cream,#e8dcc8);
        font-size:.9rem;text-align:center;letter-spacing:.02em;margin-bottom:.6rem;}
      .tarot-gate-input:focus{outline:none;border-color:var(--gold-rich,#c9a84c);}
      .tarot-gate-submit{width:100%;padding:.7rem 1rem;border-radius:10px;cursor:pointer;
        border:1px solid rgba(201,168,76,.5);background:rgba(201,168,76,.1);color:var(--text-cream,#e8dcc8);
        font-family:'Cinzel','Amiri',serif;font-size:.95rem;transition:background .25s ease;}
      .tarot-gate-submit:hover{background:rgba(201,168,76,.2);}
      .tarot-gate-error{min-height:1.1em;margin-top:.5rem;color:#e0795b;font-size:.82rem;}
      .tarot-trial-badge{position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:9000;
        padding:.4rem .9rem;border-radius:999px;font-family:'Cormorant Garamond','Amiri',serif;
        font-size:.8rem;letter-spacing:.04em;color:var(--gold-pale,#f0d878);
        background:rgba(20,16,40,.85);border:1px solid rgba(201,168,76,.3);
        box-shadow:0 4px 16px rgba(0,0,0,.4);transition:opacity 1s ease;pointer-events:none;}
      .tarot-trial-badge.fade{opacity:0;}
    `;
    document.head.appendChild(s);
  }

  function unlockFully() {
    document.body.style.overflow = '';
    const g = document.getElementById('tarot-gate');
    if (g) g.remove();
  }

  function showGate(fromEmail) {
    if (document.getElementById('tarot-gate')) return;
    injectStyle();
    const o = document.createElement('div');
    o.id = 'tarot-gate';
    o.className = 'tarot-gate-overlay';
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-modal', 'true');
    o.innerHTML =
      '<div class="tarot-gate-card">' +
        '<div class="tarot-gate-moon">🌙</div>' +
        '<h2 class="tarot-gate-title">' + (fromEmail ? t('gateTitleKey', 'Enter your license key') : t('gateTitle', 'Your trial has ended')) + '</h2>' +
        '<p class="tarot-gate-sub">' + (fromEmail ? t('gateSubKey', 'Paste the key from your purchase receipt to unlock lifetime access.') : t('gateSub', 'Seven days with the Oracle have come to a close. If it has spoken to you, you can keep it for life.')) + '</p>' +
        '<a class="tarot-gate-buy" href="' + BUY_URL + '" target="_blank" rel="noopener">' + t('gateBuy', 'Unlock lifetime access — $44.44 USD') + '</a>' +
        '<div class="tarot-gate-keywrap">' +
          '<div class="tarot-gate-keylabel">' + t('gateHaveKey', 'Already have a key?') + '</div>' +
          '<input id="tarot-gate-input" class="tarot-gate-input" placeholder="' + PREFIX + '-…" autocomplete="off" spellcheck="false" />' +
          '<button id="tarot-gate-submit" class="tarot-gate-submit">' + t('gateUnlock', 'Unlock ✦') + '</button>' +
          '<div id="tarot-gate-error" class="tarot-gate-error"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(o);
    document.body.style.overflow = 'hidden';
    document.getElementById('tarot-gate-submit').addEventListener('click', tryKey);
    const inp = document.getElementById('tarot-gate-input');
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryKey(); });
    inp.addEventListener('input', function () { document.getElementById('tarot-gate-error').textContent = ''; });
  }

  async function tryKey() {
    const inp = document.getElementById('tarot-gate-input');
    const err = document.getElementById('tarot-gate-error');
    const btn = document.getElementById('tarot-gate-submit');
    const raw = (inp.value || '').trim();
    if (!raw) { err.textContent = t('gateEnterKey', 'Please enter your key.'); return; }
    const orig = btn.textContent;
    btn.disabled = true; btn.textContent = t('gateValidating', 'Validating…'); err.textContent = '';
    const ok = await verifyKey(raw);
    if (ok) {
      localStorage.setItem(K_LIC, raw.replace(/\s+/g, ''));
      localStorage.setItem(K_ACTIVE, '1');   // trusted forever — never re-checked
      unlockFully();
    } else {
      err.textContent = t('gateFailed', 'That key could not be verified. Please paste the full key you received.');
      btn.disabled = false; btn.textContent = orig;
    }
  }

  function showTrialBadge() {
    if (document.getElementById('tarot-trial-badge')) return;
    injectStyle();
    const b = document.createElement('div');
    b.id = 'tarot-trial-badge';
    b.className = 'tarot-trial-badge';
    const d = trialDaysLeft();
    const dStr = (window.I18N && typeof I18N.toAr === 'function') ? I18N.toAr(d) : String(d);
    b.textContent = t('trialDaysLeft', '{n} days left in your trial').replace('{n}', dStr);
    document.body.appendChild(b);
    setTimeout(function () { b.classList.add('fade'); }, 6000);
  }

  // ── Email capture: starts the trial + sends the email to you via Formsubmit ──
  function showEmailGate() {
    if (document.getElementById('tarot-gate')) return;
    injectStyle();
    const o = document.createElement('div');
    o.id = 'tarot-gate'; o.className = 'tarot-gate-overlay';
    o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true');
    o.innerHTML =
      '<div class="tarot-gate-card">' +
        '<div class="tarot-gate-moon">🌙</div>' +
        '<h2 class="tarot-gate-title">' + t('emailTitle', 'Begin your free trial') + '</h2>' +
        '<p class="tarot-gate-sub">' + t('emailSub', 'Enter your email to unlock 7 days with the Oracle.') + '</p>' +
        '<input id="tarot-email-input" class="tarot-gate-input" type="email" placeholder="you@example.com" autocomplete="email" spellcheck="false" />' +
        '<button id="tarot-email-submit" class="tarot-gate-submit">' + t('emailStart', 'Start my 7-day trial ✦') + '</button>' +
        '<div id="tarot-email-error" class="tarot-gate-error"></div>' +
        '<a class="tarot-gate-buy" style="margin:1rem 0 0" href="' + BUY_URL + '" target="_blank" rel="noopener">' + t('emailBuyNow', 'Buy now — $44.44 USD') + '</a>' +
        '<button id="tarot-email-havekey" class="tarot-gate-submit" style="margin-top:1.1rem">' + t('emailHaveKey', 'Already have a key? Enter it here') + '</button>' +
      '</div>';
    document.body.appendChild(o);
    document.body.style.overflow = 'hidden';
    const inp = document.getElementById('tarot-email-input');
    const err = document.getElementById('tarot-email-error');
    const btn = document.getElementById('tarot-email-submit');
    inp.focus();
    async function startTrial() {
      const email = (inp.value || '').trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err.textContent = t('emailInvalid', 'Please enter a valid email.'); return; }
      btn.disabled = true; btn.textContent = t('gateValidating', 'Validating…');
      try {
        await fetch('https://formsubmit.co/ajax/' + EMAIL_TO, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ email: email, _subject: 'New Tarot Oracle trial signup' })
        });
      } catch (e) {}
      localStorage.setItem(K_EMAIL, email);
      localStorage.setItem(K_TRIAL, String(Date.now()));
      unlockFully();
      showTrialBadge();
    }
    btn.addEventListener('click', startTrial);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') startTrial(); });
    inp.addEventListener('input', function () { err.textContent = ''; });
    var hk = document.getElementById('tarot-email-havekey');
    if (hk) hk.addEventListener('click', function (e) { e.preventDefault(); o.remove(); document.body.style.overflow = ''; showGate(true); });
  }

  function evaluate() {
    if (!GATE_ENABLED) return;          // paywall paused — app stays fully open
    initState();
    if (isLegacy() || isActivated()) return;   // grandfathered or already unlocked → full access
    if (!localStorage.getItem(K_TRIAL)) {       // trial not started yet
      if (!localStorage.getItem(K_EMAIL)) { showEmailGate(); return; }  // capture email first → starts trial
      localStorage.setItem(K_TRIAL, String(Date.now()));                // safety fallback
    }
    if (trialActive()) showTrialBadge();
    else showGate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', evaluate);
  } else {
    evaluate();
  }
})();
