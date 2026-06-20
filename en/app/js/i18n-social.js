// ============================================================
// i18n-social.js — Sharing Translations
// Merged into I18N.translations after i18n.js loads
// ============================================================

const SOCIAL_I18N = {
  en: {
    shareReading: 'Share Reading',
    shareMessage: 'Check out my Tarot Oracle reading!',
    shareTitle: 'Share Your Reading',
    shareDesc: 'Create a beautiful card to share with friends',
    shareDownload: 'Save Image',
    shareNative: 'Share'
  },

  fr: {
    shareReading: 'Partager la lecture',
    shareMessage: 'Découvrez ma lecture Tarot Oracle !',
    shareTitle: 'Partagez votre lecture',
    shareDesc: 'Créez une belle carte à partager',
    shareDownload: 'Enregistrer l\'image',
    shareNative: 'Partager'
  },

  es: {
    shareReading: 'Compartir lectura',
    shareMessage: '¡Mira mi lectura de Tarot Oracle!',
    shareTitle: 'Comparte tu lectura',
    shareDesc: 'Crea una hermosa carta para compartir',
    shareDownload: 'Guardar imagen',
    shareNative: 'Compartir'
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
