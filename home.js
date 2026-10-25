/* Главная страница: цены, филиалы, форма заявки */
(function () {
  var reduce = window.REP && window.REP.reduce;
  var $ = function (id) { return document.getElementById(id); };

  // Программы и цены — из прайса «Репетитора» на 2026–2027 (тарифы «Фиксированный» и «Гибкий»)
  var PROGS = [
    { id: 'pre', tab: 'Дошкольники и 1 класс', books: 'Ping Pong', format: '3 раза в неделю по 45 минут', ind: 'от 1 100 ₽ за 45 минут', fix: [4200, 4700], flex: [6300, 7050] },
    { id: 'prim', tab: 'Начальная школа', books: 'Fun with Fizz 1, 2', format: '2 раза в неделю по 60 минут или 3 раза по 45 минут', ind: 'от 1 200 ₽ за 45 минут', fix: [4000, 4500], flex: [6000, 6750] },
    { id: 'mid', tab: 'Средняя школа', books: 'Amazing English 1–3, English Download Pre A1–A2', format: '2–3 раза в неделю, от 45 до 80 минут', ind: 'от 1 250 ₽ за 45 минут', fix: [4200, 4700], flex: [6300, 7050] },
    { id: 'ege', tab: 'Углублённо и ЕГЭ', books: 'Ready for Planet English, English Download B1–B1+, Ultimate English B1–B2', format: '2–3 раза в неделю, от 45 до 80 минут. Курс подготовки к ЕГЭ онлайн — раз в неделю по 80 минут', ind: 'от 1 450 ₽ за 45 минут', fix: [4800, 5300], flex: [7200, 7950] },
    { id: 'adult', tab: 'Взрослые', books: 'New English File', format: '2 раза в неделю по 80 минут', ind: 'от 2 000 ₽ за час', fix: [6000, null], flex: [9000, 11000] },
    { id: 'east', tab: 'Восточные языки', books: 'Общая программа', format: '2 раза в неделю по 60 или 80 минут', ind: 'от 1 600 ₽ за час', fix: [5200, 5700], flex: [7800, 8550] }
  ];
  var BRANCHES = [
    { addr: 'Вяземская, 1а', note: 'остановка «Степная»', hours: 'Пн–Пт 9:00–19:00, Сб 11:00–14:00', map: 'https://2gis.ru/khabarovsk/firm/70000001007331053', ll: [48.504025, 135.075429] },
    { addr: 'Союзная, 1', note: 'район остановки «Заводская», есть пандус', hours: 'Пн–Пт 9:00–19:00, Сб 11:00–14:00', map: 'https://2gis.ru/khabarovsk/firm/4926340373581857', ll: [48.398612, 135.09743] },
    { addr: 'Ленинградская, 7', note: '1 этаж', hours: 'Пн–Пт 9:00–19:00, Сб 11:00–14:00', map: 'https://2gis.ru/khabarovsk/firm/70000001044723421', ll: [48.480253, 135.097101] },
    { addr: 'Квартал ДОС, 75', note: 'офис', hours: 'Пн–Пт 9:00–19:00, Сб 10:00–14:00', map: 'https://2gis.ru/khabarovsk/firm/4926340373581856', ll: [48.4673, 135.119911] },
    { addr: 'Фабричный переулок, 25', note: '1 этаж', hours: 'Пн–Пт 9:00–20:00', map: 'https://2gis.ru/khabarovsk/firm/70000001039518399', ll: [48.465933, 135.078153] }
  ];

  var state = { prog: 'pre', tariff: 'fix' };
  function rub(n) { return 'от ' + n.toLocaleString('ru-RU') + ' ₽'; }
  var tabs = $('tabs'), panel = $('panel');

  PROGS.forEach(function (p) {
    var b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'tab'); b.id = 'tab-' + p.id; b.textContent = p.tab;
    b.addEventListener('click', function () { setProg(p.id); });
    tabs.appendChild(b);
  });
  tabs.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var i = PROGS.findIndex(function (p) { return p.id === state.prog; });
    i = (i + (e.key === 'ArrowRight' ? 1 : -1) + PROGS.length) % PROGS.length;
    setProg(PROGS[i].id); $('tab-' + PROGS[i].id).focus();
  });
  document.querySelectorAll('.seg button').forEach(function (b) {
    b.addEventListener('click', function () { state.tariff = b.dataset.tariff; render(true); });
  });
  document.querySelectorAll('[data-prog]').forEach(function (a) {
    a.addEventListener('click', function () { setProg(a.dataset.prog); });
  });
  function setProg(id) { state.prog = id; render(true); }
  function render(anim) {
    var p = PROGS.filter(function (x) { return x.id === state.prog; })[0];
    var pair = state.tariff === 'fix' ? p.fix : p.flex;
    PROGS.forEach(function (x) {
      var b = $('tab-' + x.id), on = x.id === p.id;
      b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', 'tab-' + p.id);
    document.querySelectorAll('.seg button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.tariff === state.tariff); });
    $('p-title').textContent = p.tab; $('p-books').textContent = p.books; $('p-format').textContent = p.format; $('p-ind').textContent = p.ind;
    $('p-g').textContent = rub(pair[0]); $('p-gn').textContent = 'в месяц, 6–10 человек';
    $('p-m').textContent = pair[1] ? rub(pair[1]) : '—';
    $('p-mn').textContent = pair[1] ? 'в месяц, 3–5 человек' : 'только по гибкому тарифу';
    if (anim && !reduce) { panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap'); }
  }
  render(false);

  // Филиалы: список + карта (Leaflet подгружается, когда блок появляется на экране)
  var brs = $('brs');
  brs.innerHTML = BRANCHES.map(function (b, i) {
    return '<article class="brk" data-i="' + i + '"><button type="button" class="brk-pick" aria-label="Показать на карте: ' + b.addr + '">' +
      '<span class="num">' + (i + 1) + '</span><span><span class="a">' + b.addr + '</span><span class="m">' + b.note + '</span>' +
      '<span class="h">' + b.hours + '</span></span></button><a class="go" href="' + b.map + '" target="_blank" rel="noopener">Маршрут в 2ГИС →</a></article>';
  }).join('') +
    '<div class="br-tel"><span>Единый телефон</span><a class="t1" href="tel:+74212607773">+7 (4212) 60-77-73</a><a class="t2" href="tel:+74212251879">+7 (4212) 25-18-79</a><a class="wa" href="https://wa.me/79145410164" target="_blank" rel="noopener">WhatsApp: +7 914 541-01-64</a></div>';

  var map = null, markers = [], active = -1;
  function setActive(i, fly) {
    active = i;
    brs.querySelectorAll('.brk').forEach(function (el, j) { el.classList.toggle('act', j === i); });
    markers.forEach(function (m, j) {
      var el = m.getElement(); if (el) el.classList.toggle('act', j === i);
      m.setZIndexOffset(j === i ? 1000 : 0);
    });
    if (map && fly) {
      map.flyTo(BRANCHES[i].ll, 15, { duration: reduce ? 0 : 1.1 });
      markers[i].openPopup();
    }
  }
  brs.addEventListener('click', function (e) {
    var b = e.target.closest('.brk-pick');
    if (!b) return;
    var i = +b.parentNode.dataset.i;
    setActive(i, true);
    if (window.innerWidth <= 900 && map) {
      var box = document.querySelector('.mapbox');
      window.scrollTo({ top: box.getBoundingClientRect().top + window.scrollY - 90, behavior: reduce ? 'auto' : 'smooth' });
    }
  });

  function initMap() {
    var L = window.L;
    map = L.map('map', { zoomControl: true, scrollWheelZoom: false, attributionControl: true });
    map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
    L.tileLayer('https://tile{s}.maps.2gis.com/tiles?x={x}&y={y}&z={z}&v=1', {
      maxZoom: 18, subdomains: '0123',
      attribution: '&copy; <a href="https://2gis.ru" target="_blank" rel="noopener">2ГИС</a>'
    }).addTo(map);
    BRANCHES.forEach(function (b, i) {
      var icon = L.divIcon({ className: 'pin', html: '<span><b>' + (i + 1) + '</b></span>', iconSize: [44, 44], iconAnchor: [22, 40], popupAnchor: [0, -36] });
      var m = L.marker(b.ll, { icon: icon, title: b.addr, keyboard: true }).addTo(map);
      m.bindPopup('<div class="pop"><b>' + b.addr + '</b><span class="m">' + b.note + '</span><div class="h">' + b.hours + '</div>' +
        '<div class="ln"><a href="' + b.map + '" target="_blank" rel="noopener">Маршрут в 2ГИС</a><a href="tel:+74212607773">Позвонить</a></div></div>');
      m.on('click', function () { setActive(i, false); });
      var el = m.getElement(); if (el) el.firstChild.style.animationDelay = (i * 0.12) + 's';
      markers.push(m);
    });
    map.fitBounds(L.latLngBounds(BRANCHES.map(function (b) { return b.ll; })), { padding: [50, 50] });
    map.on('click', function () { map.scrollWheelZoom.enable(); });
    // на телефоне карта не перехватывает прокрутку страницы, пока по ней не нажали
    var box = document.querySelector('.mapbox'), hint = $('map-hint');
    if (window.matchMedia('(max-width: 900px)').matches) {
      map.dragging.disable(); map.touchZoom.disable();
      hint.addEventListener('click', function () { map.dragging.enable(); map.touchZoom.enable(); box.classList.add('live'); });
    } else {
      box.classList.add('live');
    }
  }
  function loadLeaflet() {
    var css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(css);
    var js = document.createElement('script');
    js.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    js.onload = initMap;
    js.onerror = function () { document.querySelector('.mapbox').style.display = 'none'; };
    document.head.appendChild(js);
  }
  var mapEl = $('map');
  if ('IntersectionObserver' in window) {
    var mio = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { mio.disconnect(); loadLeaflet(); }
    }, { rootMargin: '400px 0px' });
    mio.observe(mapEl);
  } else {
    loadLeaflet();
  }

  // Выпадающие списки в форме
  var dds = Array.prototype.slice.call(document.querySelectorAll('.dd'));
  function closeAll(except) {
    dds.forEach(function (d) { if (d !== except) { d.classList.remove('open'); d.querySelector('.dd-btn').setAttribute('aria-expanded', false); } });
  }
  dds.forEach(function (d) {
    var btn = d.querySelector('.dd-btn'), list = d.querySelector('.dd-list');
    var items = Array.prototype.slice.call(list.querySelectorAll('li'));
    var check = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0070C4" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    items.forEach(function (li, i) { li.id = d.dataset.name + '-o' + i; li.insertAdjacentHTML('beforeend', check); });
    var act = 0;
    function open() {
      closeAll(d); d.classList.add('open'); btn.setAttribute('aria-expanded', true);
      act = Math.max(0, items.findIndex(function (li) { return li.getAttribute('aria-selected') === 'true'; }));
      mark(); list.focus();
    }
    function close(focusBtn) { d.classList.remove('open'); btn.setAttribute('aria-expanded', false); if (focusBtn) btn.focus(); }
    function mark() { items.forEach(function (li, i) { li.classList.toggle('act', i === act); }); list.setAttribute('aria-activedescendant', items[act].id); }
    function pick(i) {
      items.forEach(function (li, j) { li.setAttribute('aria-selected', i === j); });
      btn.querySelector('span').textContent = items[i].textContent;
      d.dataset.value = items[i].textContent; close(true);
    }
    d.dataset.value = items[0].textContent;
    btn.addEventListener('click', function () { d.classList.contains('open') ? close() : open(); });
    btn.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); open(); } });
    items.forEach(function (li, i) { li.addEventListener('click', function () { pick(i); }); });
    list.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); act = Math.min(items.length - 1, act + 1); mark(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); act = Math.max(0, act - 1); mark(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(act); }
      else if (e.key === 'Escape' || e.key === 'Tab') { close(e.key === 'Escape'); }
    });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.dd')) closeAll(); });

  // Заявка: проверяем поля и открываем WhatsApp школы с готовым текстом
  var form = $('form');
  function setErr(id, on) { $(id).classList.toggle('err', on); }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('f-name').value.trim();
    var phone = $('f-phone').value.trim();
    var digits = phone.replace(/\D/g, '');
    var ok1 = name.length > 1, ok2 = digits.length >= 10 && digits.length <= 12, ok3 = $('f-agree').checked;
    setErr('f-name-w', !ok1); setErr('f-phone-w', !ok2); setErr('f-agree-w', !ok3);
    if (!(ok1 && ok2 && ok3)) return;
    var who = document.querySelector('.dd[data-name="who"]').dataset.value;
    var branch = document.querySelector('.dd[data-name="branch"]').dataset.value;
    var text = 'Здравствуйте! Хочу записаться на занятия.\nИмя: ' + name + '\nТелефон: ' + phone + '\nКто будет учиться: ' + who + '\nФилиал: ' + branch;
    form.classList.add('sent');
    window.open('https://wa.me/79145410164?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });
  ['f-name', 'f-phone'].forEach(function (id) { $(id).addEventListener('input', function () { setErr(id + '-w', false); }); });
  $('f-agree').addEventListener('change', function () { setErr('f-agree-w', false); });
})();
