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

  // --- Language toggle (English / Hindi) ---
  // Translatable elements carry a data-hi attribute with their Hindi HTML.
  // We snapshot the English innerHTML into data-en on load, then swap between them.
  var langBtn = document.getElementById('langBtn');
  var nodes = document.querySelectorAll('[data-hi]');
  nodes.forEach(function (n) { n.dataset.en = n.innerHTML; });
  var lang = localStorage.getItem('lang') || 'en';
  function applyLang() {
    nodes.forEach(function (n) { n.innerHTML = (lang === 'hi') ? n.dataset.hi : n.dataset.en; });
    root.lang = lang;
    langBtn.textContent = (lang === 'en') ? 'हिंदी' : 'EN';
  }
  langBtn.addEventListener('click', function () {
    lang = (lang === 'en') ? 'hi' : 'en';
    localStorage.setItem('lang', lang);
    applyLang();
  });
  applyLang();
})();
