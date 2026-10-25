/* Общие скрипты для всех страниц сайта «Репетитор» */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  window.REP = { reduce: reduce };

  // Если сайт открыт файлом с диска, браузер не подставляет index.html в ссылки на папки
  if (location.protocol === 'file:') {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (/^(https?:|mailto:|tel:|#)/.test(h)) return;
      var parts = h.split('#');
      if (parts[0] === '' || /\/$/.test(parts[0])) {
        a.setAttribute('href', (parts[0] || './') + 'index.html' + (parts[1] !== undefined ? '#' + parts[1] : ''));
      }
    });
  }

  // Появление блоков при прокрутке, счётчики, полоски баллов
  function countUp(el) {
    var to = +el.dataset.count, t0 = null;
    if (reduce) { el.textContent = to; return; }
    el.textContent = 0;
    function step(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / 1600), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var targets = Array.prototype.slice.call(document.querySelectorAll('.rv, .grads, [data-counters]'));
  if ('IntersectionObserver' in window && !reduce) {
    document.querySelectorAll('[data-count]').forEach(function (el) { el.textContent = 0; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('on');
        if (el.hasAttribute('data-counters')) el.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('on'); });
  }

  // Плавный переход по ссылкам внутри страницы
  var hdr = document.querySelector('.hdr');
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    var y = id === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY - hdr.offsetHeight - 12;
    window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  });

  // Мобильное меню
  var burger = $('burger'), mnav = $('mnav');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = mnav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    mnav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { mnav.classList.remove('open'); burger.setAttribute('aria-expanded', false); }
    });
  }

  // Выпадающие пункты меню на компьютере
  document.querySelectorAll('.nav .sub > button').forEach(function (b) {
    var sub = b.parentNode;
    b.addEventListener('click', function () {
      var open = !sub.classList.contains('open');
      document.querySelectorAll('.nav .sub.open').forEach(function (s) { s.classList.remove('open'); s.firstElementChild.setAttribute('aria-expanded', false); });
      sub.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav .sub')) document.querySelectorAll('.nav .sub.open').forEach(function (s) { s.classList.remove('open'); s.firstElementChild.setAttribute('aria-expanded', false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') document.querySelectorAll('.nav .sub.open').forEach(function (s) { s.classList.remove('open'); s.firstElementChild.setAttribute('aria-expanded', false); s.firstElementChild.focus(); });
  });

  // Нижняя панель на телефоне — после первого экрана
  var mbar = $('mbar');
  if (mbar) {
    var onScroll = function () { mbar.classList.toggle('show', window.scrollY > 420); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  // Версия для слабовидящих
  function setBvi(on) {
    doc.classList.toggle('bvi', on);
    document.querySelectorAll('[data-bvi]').forEach(function (b) { b.setAttribute('aria-pressed', on); });
    try { localStorage.setItem('rep-bvi', on ? '1' : ''); } catch (e) {}
  }
  try { if (localStorage.getItem('rep-bvi')) setBvi(true); } catch (e) {}
  document.querySelectorAll('[data-bvi]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); setBvi(!doc.classList.contains('bvi')); });
  });

  // Просмотр фото на весь экран (галерея, лицензия)
  var lb = null, lbImgs = [], lbI = 0;
  function lbShow() {
    var a = lbImgs[lbI];
    lb.querySelector('img').src = a.getAttribute('href');
    lb.querySelector('img').alt = (a.querySelector('img') || {}).alt || '';
    lb.querySelector('.lb-n').textContent = (lbI + 1) + ' / ' + lbImgs.length;
  }
  function lbOpen(group, i) {
    if (!lb) {
      lb = document.createElement('div');
      lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Просмотр фото');
      lb.innerHTML = '<img alt=""><button type="button" class="lb-x" aria-label="Закрыть">×</button>' +
        '<button type="button" class="lb-p" aria-label="Предыдущее фото">‹</button><button type="button" class="lb-nx" aria-label="Следующее фото">›</button><span class="lb-n"></span>';
      document.body.appendChild(lb);
      lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-x')) lbClose(); });
      lb.querySelector('.lb-p').addEventListener('click', function () { lbI = (lbI - 1 + lbImgs.length) % lbImgs.length; lbShow(); });
      lb.querySelector('.lb-nx').addEventListener('click', function () { lbI = (lbI + 1) % lbImgs.length; lbShow(); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') lbClose();
        if (e.key === 'ArrowLeft') lb.querySelector('.lb-p').click();
        if (e.key === 'ArrowRight') lb.querySelector('.lb-nx').click();
      });
    }
    lbImgs = Array.prototype.slice.call(group.querySelectorAll('a[data-lb]')); lbI = i;
    lbShow(); lb.classList.add('open'); document.body.style.overflow = 'hidden';
    lb.querySelector('.lb-x').focus();
  }
  function lbClose() { lb.classList.remove('open'); document.body.style.overflow = ''; }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-lb]');
    if (!a) return;
    e.preventDefault();
    var group = a.closest('[data-lb-group]') || document.body;
    lbOpen(group, Array.prototype.indexOf.call(group.querySelectorAll('a[data-lb]'), a));
  });
})();
