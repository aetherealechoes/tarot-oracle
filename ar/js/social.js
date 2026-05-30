// ============================================================
// social.js — External Sharing: Shareable Reading Cards
// Generates beautiful PNG cards and shares via Web Share API
// ============================================================

const Social = {

  // ── Smart truncation ────────────────────────────────────────
  _smartTruncate(text, maxLen = 200) {
    if (text.length <= maxLen) return text;
    const chunk = text.substring(0, maxLen);
    // Find last sentence-ending punctuation (Latin + Arabic)
    const sentenceEnd = chunk.search(/[.!?؟۔][^.!?؟۔]*$/);
    if (sentenceEnd !== -1) {
      return chunk.substring(0, sentenceEnd + 1) + '…';
    }
    // Fall back to nearest word boundary
    const lastSpace = chunk.lastIndexOf(' ');
    if (lastSpace > 0) {
      return chunk.substring(0, lastSpace) + '…';
    }
    return chunk + '…';
  },

  // ── Shareable Reading Card (Canvas) ──────────────────────────
  async generateShareableCard(reading, interpretation, callback) {
    // Wait for fonts to load before drawing
    await document.fonts.ready;

    const SCALE = 3; // render at 3x (1800×2400) so text + art stay crisp on phones
    const canvas = document.createElement('canvas');
    canvas.width = 600 * SCALE;
    canvas.height = 800 * SCALE;
    const ctx = canvas.getContext('2d');
    ctx.scale(SCALE, SCALE); // all draw coords below stay in 600×800 logical space

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 800);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(0.5, '#1a0a2e');
    grad.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 800);

    // Decorative border
    ctx.strokeStyle = '#c8a84e';
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, 570, 770);
    ctx.strokeStyle = 'rgba(200, 168, 78, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(25, 25, 550, 750);

    // Title (Amiri for Arabic text)
    ctx.fillStyle = '#c8a84e';
    ctx.font = 'bold 28px "Amiri", serif';
    ctx.textAlign = 'center';
    ctx.fillText('أوراكل التاروت', 300, 60);

    // Date (Amiri for Arabic text)
    ctx.fillStyle = 'rgba(200, 168, 78, 0.6)';
    ctx.font = '14px "Amiri", serif';
    ctx.fillText(new Date().toLocaleDateString('ar'), 300, 85);

    // Stars decoration
    ctx.fillStyle = 'rgba(200, 168, 78, 0.4)';
    ctx.font = '16px serif';
    ctx.fillText('✦  ✦  ✦', 300, 110);

    // Spread name (Amiri for Arabic text)
    if (reading && reading.spread) {
      ctx.fillStyle = '#e8d5a3';
      ctx.font = '20px "Amiri", serif';
      ctx.fillText(I18N.t(reading.spread.nameKey), 300, 145);
    }

    // ── Flowing layout: names → summary → image grid ──
    const lang = I18N.currentLang;
    const cards = (reading && reading.cards) ? reading.cards : [];
    const N = cards.length;
    const num = (n) => (I18N.toAr ? I18N.toAr(n) : String(n));
    const cardName = (card) => {
      const c = card.card || card;               // dealt cards are { card, isReversed }
      const nm = c.name;
      const base = (nm && typeof nm === 'object') ? (nm[lang] || nm.ar || nm.en) : (nm || c.id || '');
      return base + (card.isReversed ? ` (${I18N.t('reversed')})` : '');
    };

    let cursorY = 178;

    // Card names — 1 column up to 6 cards, 2 columns beyond (RTL: first half on the right)
    if (N) {
      ctx.fillStyle = '#c8a84e';
      ctx.textAlign = 'center';
      if (N <= 6) {
        ctx.font = '16px "Amiri", serif';
        cards.forEach((card, i) => {
          ctx.fillText(`${cardName(card)} .${num(i + 1)}`, 300, cursorY);
          cursorY += 26;
        });
      } else {
        ctx.font = '14px "Amiri", serif';
        const half = Math.ceil(N / 2);
        for (let r = 0; r < half; r++) {
          const li = r, ri = r + half;
          ctx.fillText(`${cardName(cards[li])} .${num(li + 1)}`, 425, cursorY);
          if (cards[ri]) ctx.fillText(`${cardName(cards[ri])} .${num(ri + 1)}`, 175, cursorY);
          cursorY += 24;
        }
      }
      cursorY += 16;
    }

    // Interpretation summary (smart truncation, Amiri for Arabic)
    if (interpretation) {
      const summary = interpretation.summary || '';
      const text = (typeof summary === 'object') ? (summary[lang] || summary.ar || summary.en || '') : summary;
      const shortText = this._smartTruncate(text);
      ctx.fillStyle = '#e8d5a3';
      ctx.font = 'italic 15px "Amiri", serif';
      ctx.textAlign = 'center';
      const words = shortText.split(' ');
      let line = '';
      const maxWidth = 480;
      words.forEach(word => {
        const testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > maxWidth) {
          ctx.fillText(line.trim(), 300, cursorY);
          line = word + ' ';
          cursorY += 22;
        } else {
          line = testLine;
        }
      });
      if (line.trim()) { ctx.fillText(line.trim(), 300, cursorY); cursorY += 22; }
      cursorY += 14;
    }

    // Card images — grid that wraps (≤4 per row for big spreads), sized to fit
    if (N) {
      const gridTop = Math.max(cursorY, 360);
      const footerTop = 705;
      const gap = 12;
      const perRow = N <= 5 ? N : 4;
      const rows = Math.ceil(N / perRow);
      let cardW = Math.min(120, Math.floor((540 - (perRow - 1) * gap) / perRow));
      let cardH = Math.round(cardW * 1.5);
      const maxCardH = Math.floor(((footerTop - gridTop) - (rows - 1) * gap) / rows);
      if (cardH > maxCardH) { cardH = maxCardH; cardW = Math.round(cardH / 1.5); }

      const imgs = await Promise.all(cards.map(card => this._loadImage((card.card || card).image)));

      for (let i = 0; i < N; i++) {
        const row = Math.floor(i / perRow);
        const colsThisRow = Math.min(perRow, N - row * perRow);
        const rowW = colsThisRow * cardW + (colsThisRow - 1) * gap;
        const startX = Math.round((600 - rowW) / 2);
        const x = startX + (i % perRow) * (cardW + gap);
        const yTop = gridTop + row * (cardH + gap);
        const img = imgs[i];
        if (img) {
          ctx.save();
          if (cards[i].isReversed) {
            const cx = x + cardW / 2, cy = yTop + cardH / 2;
            ctx.translate(cx, cy); ctx.rotate(Math.PI); ctx.translate(-cx, -cy);
          }
          ctx.drawImage(img, x, yTop, cardW, cardH);
          ctx.restore();
        } else {
          ctx.fillStyle = '#1a0e30';
          ctx.fillRect(x, yTop, cardW, cardH);
        }
        ctx.strokeStyle = 'rgba(200, 168, 78, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, yTop, cardW, cardH);
      }
    }

    // Footer (Cormorant for Latin URL)
    ctx.fillStyle = 'rgba(200, 168, 78, 0.4)';
    ctx.font = '12px "Cormorant Garamond", serif';
    ctx.textAlign = 'center';
    ctx.fillText('tarot.etherealechoes.com', 300, 760);

    // Moon phase decoration
    ctx.font = '24px serif';
    ctx.fillText('🌙', 300, 740);

    if (callback) {
      callback(canvas.toDataURL('image/png'));
    }
    return canvas;
  },

  // ── Share: native sheet on mobile, modal on desktop ──────────
  async shareReading(reading, interpretation) {
    const canvas = await this.generateShareableCard(reading, interpretation);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const file = blob ? new File([blob], 'tarot-reading.png', { type: 'image/png' }) : null;

    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'قراءة التاروت',
          text: I18N.t('shareMessage'),
          files: [file]
        });
        return true;
      } catch (err) {
        if (err.name === 'AbortError') return false;
      }
    }

    this._showShareModal(canvas, blob);
    return false;
  },

  // ── Desktop share modal ──────────────────────────────────────
  _showShareModal(canvas, blob) {
    const dataUrl = canvas.toDataURL('image/png');
    const siteUrl = 'https://tarot.etherealechoes.com';
    const mediaUrl = 'https://tarot.etherealechoes.com/ar/images/oracle.png';
    const caption = I18N.t('shareMessage');

    const old = document.getElementById('share-modal');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'share-modal';
    overlay.className = 'share-modal-overlay';
    overlay.innerHTML = `
      <div class="share-modal" role="dialog" aria-modal="true">
        <button class="share-modal-close" aria-label="${I18N.t('close') || 'إغلاق'}">&times;</button>
        <h3 class="share-modal-title">${I18N.t('shareYourReading')}</h3>
        <img class="share-modal-preview" src="${dataUrl}" alt="${I18N.t('shareYourReading')}" />
        <div class="share-modal-actions">
          <button class="share-act" data-share="download">&#128229; ${I18N.t('shareDownload')}</button>
          <button class="share-act" data-share="copy">&#10697; ${I18N.t('shareCopy')}</button>
        </div>
        <div class="share-modal-or">${I18N.t('shareOrTo')}</div>
        <div class="share-modal-social">
          <a class="share-social" target="_blank" rel="noopener" aria-label="X"
             href="https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(siteUrl)}">&#120143;</a>
          <a class="share-social" target="_blank" rel="noopener" aria-label="WhatsApp"
             href="https://wa.me/?text=${encodeURIComponent(caption + ' ' + siteUrl)}">&#9990;</a>
          <a class="share-social" target="_blank" rel="noopener" aria-label="Facebook"
             href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}">f</a>
          <a class="share-social" target="_blank" rel="noopener" aria-label="Pinterest"
             href="https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(siteUrl)}&media=${encodeURIComponent(mediaUrl)}&description=${encodeURIComponent(caption)}">P</a>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('.share-modal-close').addEventListener('click', close);

    overlay.querySelector('[data-share="download"]').addEventListener('click', () => {
      this._downloadImage(canvas);
    });

    const copyBtn = overlay.querySelector('[data-share="copy"]');
    copyBtn.addEventListener('click', async () => {
      try {
        const b = blob || await new Promise(r => canvas.toBlob(r, 'image/png'));
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]);
        copyBtn.innerHTML = '&#10003; ' + (I18N.t('shareCopied') || 'تم النسخ');
        setTimeout(() => { copyBtn.innerHTML = '&#10697; ' + I18N.t('shareCopy'); }, 1800);
      } catch (err) {
        this._downloadImage(canvas);
      }
    });
  },

  _loadImage(src) {
    return new Promise(resolve => {
      if (!src) { resolve(null); return; }
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  },

  _downloadImage(canvas) {
    const link = document.createElement('a');
    link.download = 'tarot-reading.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
};
