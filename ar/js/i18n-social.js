// ============================================================
// i18n-social.js — Sharing Translations (Arabic)
// Merged into I18N.translations after i18n.js loads
// ============================================================

const SOCIAL_I18N = {
  ar: {
    shareReading: 'مشاركة القراءة',
    shareMessage: 'شاهد قراءة التاروت الخاصة بي!',
    shareTitle: 'شارك قراءتك',
    shareDesc: 'أنشئ بطاقة جميلة للمشاركة',
    shareDownload: 'حفظ الصورة',
    shareNative: 'مشاركة'
  }
};

// ── Merge into I18N on load ──────────────────────────────────
(function mergeSocialI18N() {
  if (typeof I18N === 'undefined') return;
  Object.keys(SOCIAL_I18N).forEach(lang => {
    if (I18N.translations[lang]) {
      Object.assign(I18N.translations[lang], SOCIAL_I18N[lang]);
    }
  });
})();
