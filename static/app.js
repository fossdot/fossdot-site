(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // --- Block cascade ---------------------------------------------------------
  // The page is a stack of panels, so theme and language changes ripple down it
  // one panel at a time instead of snapping over all at once. Each block gets an
  // index; CSS turns that into a transition-delay. Kept in DOM order, which is
  // reading order — including the two side-by-side project cards, left then right.
  var THEME_STEP = 110;
  var LANG_STEP = 110;
  var blocks = Array.prototype.slice.call(
    document.querySelectorAll('h1, .card, .postcard, .backlink, .post, footer')
  );
  blocks.forEach(function (el, i) { el.style.setProperty('--td', (i * THEME_STEP) + 'ms'); });
  var cascadeMs = blocks.length * THEME_STEP + 700; // last block's delay + its fade

  function cascading() { return !reduceMotion.matches && blocks.length > 0; }

  // --- Theme toggle (defaults to system preference) ---
  var themeBtn = document.getElementById('themeBtn');
  var savedTheme = localStorage.getItem('theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  // The glyph swap lives in CSS; only the accessible name needs scripting, since
  // it has to say which way the button goes — and say it in the current language.
  var THEME_LABELS = {
    en: { toDark: 'Switch to dark theme', toLight: 'Switch to light theme' },
    hi: { toDark: 'डार्क थीम पर जाएँ', toLight: 'लाइट थीम पर जाएँ' }
  };
  function paintThemeBtn() {
    var l = THEME_LABELS[root.lang] || THEME_LABELS.en;
    themeBtn.setAttribute('aria-label', isDark() ? l.toLight : l.toDark);
  }

  // The delays only apply while .theming is set, so ordinary hovers stay instant.
  var themingTimer;
  themeBtn.addEventListener('click', function () {
    if (cascading()) {
      root.classList.add('theming');
      window.clearTimeout(themingTimer);
      themingTimer = window.setTimeout(function () {
        root.classList.remove('theming');
      }, cascadeMs);
    }
    root.setAttribute('data-theme', isDark() ? 'light' : 'dark');
    localStorage.setItem('theme', root.getAttribute('data-theme'));
    paintThemeBtn();
  });
  // Follow the system flipping while no explicit choice is stored.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paintThemeBtn);
  paintThemeBtn();

  // --- Language switcher (English / Hindi) ---
  // Translatable elements carry a data-hi attribute with their Hindi HTML.
  // We snapshot the English innerHTML into data-en on load, then swap between them.
  var langGroup = document.querySelector('.langswitch');
  var langOpts = Array.prototype.slice.call(langGroup.querySelectorAll('.langopt'));
  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-hi]'));
  nodes.forEach(function (n) { n.dataset.en = n.innerHTML; });
  var lang = localStorage.getItem('lang') || 'en';

  // Group the translatable nodes under the block they sit in, so a panel's text
  // swaps as one piece rather than line by line. Anything outside a block forms
  // its own group at the end, so nothing is ever left untranslated.
  var groups = [];
  var claimed = [];
  blocks.forEach(function (b) {
    var own = nodes.filter(function (n) { return n === b || b.contains(n); });
    own = own.filter(function (n) { return claimed.indexOf(n) === -1; });
    if (own.length) {
      groups.push({ el: b, nodes: own });
      claimed = claimed.concat(own);
    }
  });
  var orphans = nodes.filter(function (n) { return claimed.indexOf(n) === -1; });
  if (orphans.length) groups.push({ el: null, nodes: orphans });

  function swap(group) {
    group.nodes.forEach(function (n) {
      n.innerHTML = (lang === 'hi') ? n.dataset.hi : n.dataset.en;
    });
  }

  function paintLangOpts() {
    root.lang = lang;
    // Roving tabindex: only the selected option is in the tab order, so the
    // group is one stop and arrow keys move within it.
    langOpts.forEach(function (b) {
      var on = b.dataset.lang === lang;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
  }

  var swapTimers = [];
  function applyLang(animate) {
    paintLangOpts();
    paintThemeBtn();                     // its label is language-dependent too
    swapTimers.forEach(window.clearTimeout);
    swapTimers = [];

    if (!animate || !cascading()) {
      groups.forEach(swap);
      return;
    }
    groups.forEach(function (g, i) {
      swapTimers.push(window.setTimeout(function () {
        swap(g);
        if (!g.el) return;
        // Restart the animation even if this block is still mid-flight.
        g.el.classList.remove('swapping');
        void g.el.offsetWidth;
        g.el.classList.add('swapping');
      }, i * LANG_STEP));
    });
  }

  // Clean up the class once its animation finishes, wherever it started.
  document.addEventListener('animationend', function (e) {
    if (e.animationName === 'swapin' && e.target.classList) {
      e.target.classList.remove('swapping');
    }
  });

  function setLang(next) {
    if (next === lang) return;
    lang = next;
    localStorage.setItem('lang', lang);
    applyLang(true);
  }

  langOpts.forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
  });

  langGroup.addEventListener('keydown', function (e) {
    var i = langOpts.indexOf(document.activeElement);
    var step = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
    if (i < 0 || !step) return;
    e.preventDefault();
    var target = langOpts[(i + step + langOpts.length) % langOpts.length];
    setLang(target.dataset.lang);
    target.focus(); // move focus even if the language was already selected
  });

  applyLang(false);   // first paint restores the stored language with no animation
})();
