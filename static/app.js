(function () {
  var root = document.documentElement;

  // --- Theme toggle (defaults to system preference) ---
  var themeBtn = document.getElementById('themeBtn');
  var savedTheme = localStorage.getItem('theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function paintThemeBtn() { themeBtn.textContent = isDark() ? '☀️' : '🌙'; }
  themeBtn.addEventListener('click', function () {
    root.setAttribute('data-theme', isDark() ? 'light' : 'dark');
    localStorage.setItem('theme', root.getAttribute('data-theme'));
    paintThemeBtn();
  });
  paintThemeBtn();

  // --- Language switcher (English / Hindi) ---
  // Translatable elements carry a data-hi attribute with their Hindi HTML.
  // We snapshot the English innerHTML into data-en on load, then swap between them.
  var langGroup = document.querySelector('.langswitch');
  var langOpts = Array.prototype.slice.call(langGroup.querySelectorAll('.langopt'));
  var nodes = document.querySelectorAll('[data-hi]');
  nodes.forEach(function (n) { n.dataset.en = n.innerHTML; });
  var lang = localStorage.getItem('lang') || 'en';

  function applyLang() {
    nodes.forEach(function (n) { n.innerHTML = (lang === 'hi') ? n.dataset.hi : n.dataset.en; });
    root.lang = lang;
    // Roving tabindex: only the selected option is in the tab order, so the
    // group is one stop and arrow keys move within it.
    langOpts.forEach(function (b) {
      var on = b.dataset.lang === lang;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
  }

  function setLang(next) {
    if (next === lang) return;
    lang = next;
    localStorage.setItem('lang', lang);
    applyLang();
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

  applyLang();
})();
